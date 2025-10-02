import { logger } from '../../../core/utils/logger';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  createdAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface RBACConfig {
  defaultRole: string;
  adminRole: string;
  guestRole: string;
  maxRolesPerUser: number;
  enableRoleHierarchy: boolean;
  enableTemporaryRoles: boolean;
}

export interface AccessRequest {
  userId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export interface AccessResult {
  granted: boolean;
  reason: string;
  requiredPermissions: string[];
  userPermissions: string[];
  roles: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export class RBACService {
  private readonly config: RBACConfig;
  private isInitialized = false;
  private readonly roles: Map<string, Role> = new Map();
  private readonly permissions: Map<string, Permission> = new Map();
  private readonly userRoles: Map<string, UserRole[]> = new Map();
  private readonly roleHierarchy: Map<string, string[]> = new Map(); // parent -> children

  constructor() {
    this.config = {
      defaultRole: process.env.RBAC_DEFAULT_ROLE || 'user',
      adminRole: process.env.RBAC_ADMIN_ROLE || 'admin',
      guestRole: process.env.RBAC_GUEST_ROLE || 'guest',
      maxRolesPerUser: parseInt(process.env.RBAC_MAX_ROLES_PER_USER || '5'),
      enableRoleHierarchy: process.env.RBAC_ENABLE_HIERARCHY === 'true',
      enableTemporaryRoles: process.env.RBAC_ENABLE_TEMPORARY_ROLES === 'true',
    };
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  async initialize(): Promise<ApiResponse> {
    try {
      logger.info('初始化 RBAC 服務');

      // 創建系統權限
      await this.createSystemPermissions();

      // 創建系統角色
      await this.createSystemRoles();

      // 設置角色層次結構
      if (this.config.enableRoleHierarchy) {
        await this.setupRoleHierarchy();
      }

      this.isInitialized = true;
      logger.info('RBAC 服務初始化完成');

      return {
        success: true,
        data: {
          defaultRole: this.config.defaultRole,
          adminRole: this.config.adminRole,
          guestRole: this.config.guestRole,
          maxRolesPerUser: this.config.maxRolesPerUser,
          enableRoleHierarchy: this.config.enableRoleHierarchy,
          enableTemporaryRoles: this.config.enableTemporaryRoles,
          totalRoles: this.roles.size,
          totalPermissions: this.permissions.size,
        },
        message: 'RBAC 服務初始化成功',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('RBAC 服務初始化失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  // 權限管理
  async createPermission(
    permission: Omit<Permission, 'id' | 'createdAt'>
  ): Promise<ApiResponse<Permission>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'RBAC 服務未初始化',
          timestamp: Date.now(),
        };
      }

      const id = this.generateId();
      const newPermission: Permission = {
        ...permission,
        id,
        createdAt: new Date(),
      };

      this.permissions.set(id, newPermission);
      logger.info(`創建權限: ${permission.name}`);

      return {
        success: true,
        data: newPermission,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('創建權限失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  async updatePermission(
    id: string,
    updates: Partial<Permission>
  ): Promise<ApiResponse<Permission>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'RBAC 服務未初始化',
          timestamp: Date.now(),
        };
      }

      const permission = this.permissions.get(id);
      if (!permission) {
        return {
          success: false,
          error: '權限不存在',
          timestamp: Date.now(),
        };
      }

      const updatedPermission = { ...permission, ...updates };
      this.permissions.set(id, updatedPermission);
      logger.info(`更新權限: ${permission.name}`);

      return {
        success: true,
        data: updatedPermission,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('更新權限失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  async deletePermission(id: string): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'RBAC 服務未初始化',
          timestamp: Date.now(),
        };
      }

      const permission = this.permissions.get(id);
      if (!permission) {
        return {
          success: false,
          error: '權限不存在',
          timestamp: Date.now(),
        };
      }

      // 檢查是否有角色使用此權限
      const rolesUsingPermission = Array.from(this.roles.values()).filter(
        role => role.permissions.includes(id)
      );

      if (rolesUsingPermission.length > 0) {
        return {
          success: false,
          error: `權限正在被 ${rolesUsingPermission.length} 個角色使用，無法刪除`,
          timestamp: Date.now(),
        };
      }

      this.permissions.delete(id);
      logger.info(`刪除權限: ${permission.name}`);

      return {
        success: true,
        message: '權限已刪除',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('刪除權限失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  // 角色管理
  async createRole(
    role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Role>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'RBAC 服務未初始化',
          timestamp: Date.now(),
        };
      }

      // 驗證權限是否存在
      for (const permissionId of role.permissions) {
        if (!this.permissions.has(permissionId)) {
          return {
            success: false,
            error: `權限 ${permissionId} 不存在`,
            timestamp: Date.now(),
          };
        }
      }

      const id = this.generateId();
      const now = new Date();
      const newRole: Role = {
        ...role,
        id,
        createdAt: now,
        updatedAt: now,
      };

      this.roles.set(id, newRole);
      logger.info(`創建角色: ${role.name}`);

      return {
        success: true,
        data: newRole,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('創建角色失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  async updateRole(
    id: string,
    updates: Partial<Role>
  ): Promise<ApiResponse<Role>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'RBAC 服務未初始化',
          timestamp: Date.now(),
        };
      }

      const role = this.roles.get(id);
      if (!role) {
        return {
          success: false,
          error: '角色不存在',
          timestamp: Date.now(),
        };
      }

      if (role.isSystem && updates.permissions) {
        return {
          success: false,
          error: '系統角色的權限不能修改',
          timestamp: Date.now(),
        };
      }

      // 驗證新權限是否存在
      if (updates.permissions) {
        for (const permissionId of updates.permissions) {
          if (!this.permissions.has(permissionId)) {
            return {
              success: false,
              error: `權限 ${permissionId} 不存在`,
              timestamp: Date.now(),
            };
          }
        }
      }

      const updatedRole = {
        ...role,
        ...updates,
        updatedAt: new Date(),
      };
      this.roles.set(id, updatedRole);
      logger.info(`更新角色: ${role.name}`);

      return {
        success: true,
        data: updatedRole,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('更新角色失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  async deleteRole(id: string): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'RBAC 服務未初始化',
          timestamp: Date.now(),
        };
      }

      const role = this.roles.get(id);
      if (!role) {
        return {
          success: false,
          error: '角色不存在',
          timestamp: Date.now(),
        };
      }

      if (role.isSystem) {
        return {
          success: false,
          error: '系統角色不能刪除',
          timestamp: Date.now(),
        };
      }

      // 檢查是否有用戶使用此角色
      const usersWithRole = Array.from(this.userRoles.entries()).filter(
        ([_, roles]) => roles.some(ur => ur.roleId === id && ur.isActive)
      );

      if (usersWithRole.length > 0) {
        return {
          success: false,
          error: `角色正在被 ${usersWithRole.length} 個用戶使用，無法刪除`,
          timestamp: Date.now(),
        };
      }

      this.roles.delete(id);
      logger.info(`刪除角色: ${role.name}`);

      return {
        success: true,
        message: '角色已刪除',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('刪除角色失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  // 用戶角色分配
  async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: Date
  ): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'RBAC 服務未初始化',
          timestamp: Date.now(),
        };
      }

      const role = this.roles.get(roleId);
      if (!role) {
        return {
          success: false,
          error: '角色不存在',
          timestamp: Date.now(),
        };
      }

      const userRoles = this.userRoles.get(userId) || [];

      // 檢查用戶是否已有此角色
      const existingRole = userRoles.find(
        ur => ur.roleId === roleId && ur.isActive
      );
      if (existingRole) {
        return {
          success: false,
          error: '用戶已擁有此角色',
          timestamp: Date.now(),
        };
      }

      // 檢查角色數量限制
      const activeRoles = userRoles.filter(ur => ur.isActive);
      if (activeRoles.length >= this.config.maxRolesPerUser) {
        return {
          success: false,
          error: `用戶角色數量已達上限 (${this.config.maxRolesPerUser})`,
          timestamp: Date.now(),
        };
      }

      // 檢查臨時角色設置
      if (expiresAt && !this.config.enableTemporaryRoles) {
        return {
          success: false,
          error: '系統未啟用臨時角色功能',
          timestamp: Date.now(),
        };
      }

      const userRole: UserRole = {
        userId,
        roleId,
        assignedBy,
        assignedAt: new Date(),
        expiresAt,
        isActive: true,
      };

      userRoles.push(userRole);
      this.userRoles.set(userId, userRoles);
      logger.info(`為用戶 ${userId} 分配角色 ${role.name}`);

      return {
        success: true,
        message: '角色分配成功',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('分配角色失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  async revokeRole(
    userId: string,
    roleId: string,
    revokedBy: string
  ): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'RBAC 服務未初始化',
          timestamp: Date.now(),
        };
      }

      const userRoles = this.userRoles.get(userId);
      if (!userRoles) {
        return {
          success: false,
          error: '用戶沒有任何角色',
          timestamp: Date.now(),
        };
      }

      const userRole = userRoles.find(
        ur => ur.roleId === roleId && ur.isActive
      );
      if (!userRole) {
        return {
          success: false,
          error: '用戶沒有此角色',
          timestamp: Date.now(),
        };
      }

      // 檢查是否為默認角色
      if (roleId === this.config.defaultRole) {
        return {
          success: false,
          error: '不能撤銷默認角色',
          timestamp: Date.now(),
        };
      }

      userRole.isActive = false;
      const role = this.roles.get(roleId);
      logger.info(`撤銷用戶 ${userId} 的角色 ${role?.name || roleId}`);

      return {
        success: true,
        message: '角色撤銷成功',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('撤銷角色失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  // 權限檢查
  async checkAccess(
    request: AccessRequest
  ): Promise<ApiResponse<AccessResult>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'RBAC 服務未初始化',
          timestamp: Date.now(),
        };
      }

      const { userId, resource, action, context } = request;

      // 獲取用戶角色
      const userRoles = this.getUserActiveRoles(userId);
      const roleNames = userRoles.map(ur => {
        const role = this.roles.get(ur.roleId);
        return role?.name || ur.roleId;
      });

      // 獲取用戶所有權限
      const userPermissions = this.getUserPermissions(userId);

      // 檢查所需權限
      const requiredPermission = `${resource}:${action}`;
      const hasPermission = userPermissions.some(permission => {
        return (
          permission.resource === resource &&
          permission.action === action &&
          this.checkPermissionConditions(permission, context)
        );
      });

      const result: AccessResult = {
        granted: hasPermission,
        reason: hasPermission ? '權限檢查通過' : '權限不足',
        requiredPermissions: [requiredPermission],
        userPermissions: userPermissions.map(p => `${p.resource}:${p.action}`),
        roles: roleNames,
      };

      logger.info(
        `用戶 ${userId} 訪問 ${resource}:${action} - ${hasPermission ? '允許' : '拒絕'}`
      );

      return {
        success: true,
        data: result,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('權限檢查失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  // 獲取用戶信息
  getUserRoles(userId: string): UserRole[] {
    return this.userRoles.get(userId) || [];
  }

  getUserActiveRoles(userId: string): UserRole[] {
    const userRoles = this.userRoles.get(userId) || [];
    const now = new Date();

    return userRoles.filter(ur => {
      if (!ur.isActive) return false;
      if (ur.expiresAt && ur.expiresAt < now) {
        ur.isActive = false; // 自動過期
        return false;
      }
      return true;
    });
  }

  getUserPermissions(userId: string): Permission[] {
    const activeRoles = this.getUserActiveRoles(userId);
    const permissions: Permission[] = [];
    const permissionIds = new Set<string>();

    for (const userRole of activeRoles) {
      const role = this.roles.get(userRole.roleId);
      if (role) {
        // 添加角色權限
        for (const permissionId of role.permissions) {
          if (!permissionIds.has(permissionId)) {
            const permission = this.permissions.get(permissionId);
            if (permission) {
              permissions.push(permission);
              permissionIds.add(permissionId);
            }
          }
        }

        // 添加繼承權限（如果啟用角色層次結構）
        if (this.config.enableRoleHierarchy) {
          const inheritedPermissions = this.getInheritedPermissions(
            userRole.roleId
          );
          for (const permission of inheritedPermissions) {
            if (!permissionIds.has(permission.id)) {
              permissions.push(permission);
              permissionIds.add(permission.id);
            }
          }
        }
      }
    }

    return permissions;
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  // 私有方法
  private async createSystemPermissions(): Promise<void> {
    const systemPermissions = [
      // 用戶管理權限
      {
        name: 'user:read',
        description: '查看用戶信息',
        resource: 'user',
        action: 'read',
      },
      {
        name: 'user:write',
        description: '修改用戶信息',
        resource: 'user',
        action: 'write',
      },
      {
        name: 'user:delete',
        description: '刪除用戶',
        resource: 'user',
        action: 'delete',
      },
      {
        name: 'user:admin',
        description: '用戶管理',
        resource: 'user',
        action: 'admin',
      },

      // 卡牌管理權限
      {
        name: 'card:read',
        description: '查看卡牌',
        resource: 'card',
        action: 'read',
      },
      {
        name: 'card:write',
        description: '編輯卡牌',
        resource: 'card',
        action: 'write',
      },
      {
        name: 'card:delete',
        description: '刪除卡牌',
        resource: 'card',
        action: 'delete',
      },
      {
        name: 'card:admin',
        description: '卡牌管理',
        resource: 'card',
        action: 'admin',
      },

      // 系統管理權限
      {
        name: 'system:read',
        description: '查看系統信息',
        resource: 'system',
        action: 'read',
      },
      {
        name: 'system:write',
        description: '修改系統設置',
        resource: 'system',
        action: 'write',
      },
      {
        name: 'system:admin',
        description: '系統管理',
        resource: 'system',
        action: 'admin',
      },

      // API 權限
      {
        name: 'api:read',
        description: 'API 讀取',
        resource: 'api',
        action: 'read',
      },
      {
        name: 'api:write',
        description: 'API 寫入',
        resource: 'api',
        action: 'write',
      },
      {
        name: 'api:admin',
        description: 'API 管理',
        resource: 'api',
        action: 'admin',
      },
    ];

    for (const perm of systemPermissions) {
      const id = this.generateId();
      const permission: Permission = {
        id,
        name: perm.name,
        description: perm.description,
        resource: perm.resource,
        action: perm.action,
        createdAt: new Date(),
      };
      this.permissions.set(id, permission);
    }
  }

  private async createSystemRoles(): Promise<void> {
    const now = new Date();

    // 獲取權限 ID
    const getPermissionIds = (names: string[]) => {
      return Array.from(this.permissions.values())
        .filter(p => names.includes(p.name))
        .map(p => p.id);
    };

    // 訪客角色
    const guestRole: Role = {
      id: this.generateId(),
      name: 'guest',
      description: '訪客用戶',
      permissions: getPermissionIds(['card:read', 'api:read']),
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    };

    // 普通用戶角色
    const userRole: Role = {
      id: this.generateId(),
      name: 'user',
      description: '普通用戶',
      permissions: getPermissionIds([
        'user:read',
        'user:write',
        'card:read',
        'card:write',
        'api:read',
        'api:write',
      ]),
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    };

    // 管理員角色
    const adminRole: Role = {
      id: this.generateId(),
      name: 'admin',
      description: '系統管理員',
      permissions: Array.from(this.permissions.keys()), // 所有權限
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    };

    this.roles.set(guestRole.id, guestRole);
    this.roles.set(userRole.id, userRole);
    this.roles.set(adminRole.id, adminRole);
  }

  private async setupRoleHierarchy(): Promise<void> {
    // 設置角色層次結構：admin > user > guest
    const adminRole = Array.from(this.roles.values()).find(
      r => r.name === 'admin'
    );
    const userRole = Array.from(this.roles.values()).find(
      r => r.name === 'user'
    );
    const guestRole = Array.from(this.roles.values()).find(
      r => r.name === 'guest'
    );

    if (adminRole && userRole) {
      this.roleHierarchy.set(adminRole.id, [userRole.id]);
    }
    if (userRole && guestRole) {
      this.roleHierarchy.set(userRole.id, [guestRole.id]);
    }
  }

  private getInheritedPermissions(roleId: string): Permission[] {
    const permissions: Permission[] = [];
    const childRoleIds = this.roleHierarchy.get(roleId) || [];

    for (const childRoleId of childRoleIds) {
      const childRole = this.roles.get(childRoleId);
      if (childRole) {
        for (const permissionId of childRole.permissions) {
          const permission = this.permissions.get(permissionId);
          if (permission) {
            permissions.push(permission);
          }
        }
        // 遞歸獲取子角色的權限
        permissions.push(...this.getInheritedPermissions(childRoleId));
      }
    }

    return permissions;
  }

  private checkPermissionConditions(
    permission: Permission,
    context?: Record<string, any>
  ): boolean {
    if (!permission.conditions || !context) {
      return true;
    }

    // 簡化的條件檢查邏輯
    for (const [key, value] of Object.entries(permission.conditions)) {
      if (context[key] !== value) {
        return false;
      }
    }

    return true;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async getServiceStats(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        initialized: this.isInitialized,
        totalRoles: this.roles.size,
        totalPermissions: this.permissions.size,
        totalUsers: this.userRoles.size,
        systemRoles: Array.from(this.roles.values()).filter(r => r.isSystem)
          .length,
        customRoles: Array.from(this.roles.values()).filter(r => !r.isSystem)
          .length,
        config: this.config,
      },
      timestamp: Date.now(),
    };
  }
}

export const rbacService = new RBACService();
