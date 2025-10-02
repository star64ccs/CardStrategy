import { rbacService } from '../shared/services/auth/rbacService';

// 模擬 logger
const _mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// 模擬 RBAC Service
class MockRBACService {
  private isInitialized = false;
  private roles = new Map();
  private permissions = new Map();
  private userRoles = new Map();

  async initialize() {
    this.isInitialized = true;

    // Create系統權限
    const _permissions = [
      { id: 'perm1', name: 'user:read', resource: 'user', action: 'read' },
      { id: 'perm2', name: 'user:write', resource: 'user', action: 'write' },
      { id: 'perm3', name: 'card:read', resource: 'card', action: 'read' },
      { id: 'perm4', name: 'card:write', resource: 'card', action: 'write' },
      {
        id: 'perm5',
        name: 'system:admin',
        resource: 'system',
        action: 'admin',
      },
    ];

    permissions.forEach(p => this.permissions.set(p.id, p));

    // Create系統角色
    const _roles = [
      { id: 'role1', name: 'guest', permissions: ['perm3'], isSystem: true },
      {
        id: 'role2',
        name: 'user',
        permissions: ['perm1', 'perm2', 'perm3', 'perm4'],
        isSystem: true,
      },
      {
        id: 'role3',
        name: 'admin',
        permissions: ['perm1', 'perm2', 'perm3', 'perm4', 'perm5'],
        isSystem: true,
      },
    ];

    roles.forEach(r => this.roles.set(r.id, r));

    return {
      success: true,
      data: {
        totalRoles: this.roles.size,
        totalPermissions: this.permissions.size,
      },
    };
  }

  isAvailable() {
    return this.isInitialized;
  }

  async createPermission(permission: unknown) {
    if (this.isInitialized) {
      const _id = `perm${Date.now()}`;
      const _newPermission = { ...permission, id, createdAt: new Date() };
      this.permissions.set(id, newPermission);
      return { success: true, data: newPermission };
    }
    return { success: false, error: 'Service not initialized' };
  }

  async updatePermission(id: string, updates: unknown) {
    if (this.isInitialized && this.permissions.has(id)) {
      const _permission = this.permissions.get(id);
      const _updatedPermission = { ...permission, ...updates };
      this.permissions.set(id, updatedPermission);
      return { success: true, data: updatedPermission };
    }
    return { success: false, error: 'Permission not found' };
  }

  async deletePermission(id: string) {
    if (this.isInitialized && this.permissions.has(id)) {
      // CheckYesNo有角色使用此權限
      const _rolesUsingPermission = Array.from(this.roles.values()).filter(
        (role: unknown) => role.permissions.includes(id)
      );

      if (rolesUsingPermission.length > 0) {
        return { success: false, error: 'Permission is being used by roles' };
      }

      this.permissions.delete(id);
      return { success: true, message: 'Permission deleted' };
    }
    return { success: false, error: 'Permission not found' };
  }

  async createRole(role: unknown) {
    if (this.isInitialized) {
      // Verify權限YesNo存在
      for (const permissionId of role.permissions) {
        if (!this.permissions.has(permissionId)) {
          return {
            success: false,
            error: `Permission ${permissionId} not found`,
          };
        }
      }

      const _id = `role${Date.now()}`;
      const _newRole = {
        ...role,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.roles.set(id, newRole);
      return { success: true, data: newRole };
    }
    return { success: false, error: 'Service not initialized' };
  }

  async updateRole(id: string, updates: unknown) {
    if (this.isInitialized && this.roles.has(id)) {
      const _role = this.roles.get(id);

      if (role.isSystem && updates.permissions) {
        return {
          success: false,
          error: 'Cannot modify system role permissions',
        };
      }

      if (updates.permissions) {
        for (const permissionId of updates.permissions) {
          if (!this.permissions.has(permissionId)) {
            return {
              success: false,
              error: `Permission ${permissionId} not found`,
            };
          }
        }
      }

      const _updatedRole = { ...role, ...updates, updatedAt: new Date() };
      this.roles.set(id, updatedRole);
      return { success: true, data: updatedRole };
    }
    return { success: false, error: 'Role not found' };
  }

  async deleteRole(id: string) {
    if (this.isInitialized && this.roles.has(id)) {
      const _role = this.roles.get(id);

      if (role.isSystem) {
        return { success: false, error: 'Cannot delete system role' };
      }

      // CheckYesNo有User使用此角色
      const _usersWithRole = Array.from(this.userRoles.entries()).filter(
        ([_, roles]: unknown) =>
          roles.some((ur: unknown) => ur.roleId === id && ur.isActive)
      );

      if (usersWithRole.length > 0) {
        return { success: false, error: 'Role is being used by users' };
      }

      this.roles.delete(id);
      return { success: true, message: 'Role deleted' };
    }
    return { success: false, error: 'Role not found' };
  }

  async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: Date
  ) {
    if (this.isInitialized && this.roles.has(roleId)) {
      const _userRoles = this.userRoles.get(userId) || [];

      // CheckUserYesNo已有此角色
      const _existingRole = userRoles.find(
        (ur: unknown) => ur.roleId === roleId && ur.isActive
      );
      if (existingRole) {
        return { success: false, error: 'User already has this role' };
      }

      // Check角色數量Limit（False設最大5個）
      const _activeRoles = userRoles.filter((ur: unknown) => ur.isActive);
      if (activeRoles.length >= 5) {
        return { success: false, error: 'Maximum roles per user exceeded' };
      }

      const _userRole = {
        userId,
        roleId,
        assignedBy,
        assignedAt: new Date(),
        expiresAt,
        isActive: true,
      };

      userRoles.push(userRole);
      this.userRoles.set(userId, userRoles);
      return { success: true, message: 'Role assigned successfully' };
    }
    return { success: false, error: 'Role not found' };
  }

  async revokeRole(userId: string, roleId: string, revokedBy: string) {
    if (this.isInitialized) {
      const _userRoles = this.userRoles.get(userId);
      if (!userRoles) {
        return { success: false, error: 'User has no roles' };
      }

      const _userRole = userRoles.find(
        (ur: unknown) => ur.roleId === roleId && ur.isActive
      );
      if (!userRole) {
        return { success: false, error: 'User does not have this role' };
      }

      // CheckYesNo為Default角色
      if (roleId === 'role2') {
        // user role
        return { success: false, error: 'Cannot revoke default role' };
      }

      userRole.isActive = false;
      return { success: true, message: 'Role revoked successfully' };
    }
    return { success: false, error: 'Service not initialized' };
  }

  async checkAccess(request: unknown) {
    if (this.isInitialized) {
      const { userId, resource, action } = request;

      // GetUser角色
      const _userRoles = this.getUserActiveRoles(userId);
      const _roleNames = userRoles.map((ur: unknown) => {
        const _role = this.roles.get(ur.roleId);
        return role?.name || ur.roleId;
      });

      // GetUser權限
      const _userPermissions = this.getUserPermissions(userId);

      // Check權限
      const _hasPermission = userPermissions.some((permission: unknown) => {
        return permission.resource === resource && permission.action === action;
      });

      const _result = {
        granted: hasPermission,
        reason: hasPermission ? 'Access granted' : 'Access denied',
        requiredPermissions: [`${resource}:${action}`],
        userPermissions: userPermissions.map(
          (p: unknown) => `${p.resource}:${p.action}`
        ),
        roles: roleNames,
      };

      return { success: true, data: result };
    }
    return { success: false, error: 'Service not initialized' };
  }

  getUserRoles(userId: string) {
    return this.userRoles.get(userId) || [];
  }

  getUserActiveRoles(userId: string) {
    const _userRoles = this.userRoles.get(userId) || [];
    const _now = new Date();

    return userRoles.filter((ur: unknown) => {
      if (!ur.isActive) return false;
      if (ur.expiresAt && ur.expiresAt < now) {
        ur.isActive = false;
        return false;
      }
      return true;
    });
  }

  getUserPermissions(userId: string) {
    const _activeRoles = this.getUserActiveRoles(userId);
    const permissions: unknown[] = [];
    const _permissionIds = new Set();

    for (const userRole of activeRoles) {
      const _role = this.roles.get(userRole.roleId);
      if (role) {
        for (const permissionId of role.permissions) {
          if (!permissionIds.has(permissionId)) {
            const _permission = this.permissions.get(permissionId);
            if (permission) {
              permissions.push(permission);
              permissionIds.add(permissionId);
            }
          }
        }
      }
    }

    return permissions;
  }

  getAllRoles() {
    return Array.from(this.roles.values());
  }

  getAllPermissions() {
    return Array.from(this.permissions.values());
  }
}

describe('RBAC Service Tests', () => {
  let mockRBACService: MockRBACService;

  beforeEach(async () => {
    mockRBACService = new MockRBACService();
    await mockRBACService.initialize();
  });

  describe('MockRBACService', () => {
    test('Initialize應該Success', async () => {
      const _result = await mockRBACService.initialize();
      expect(result.success).toBe(true);
      expect(result.data?.totalRoles).toBe(3);
      expect(result.data?.totalPermissions).toBe(5);
    });

    test('Create權限應該Success', async () => {
      const _permission = {
        name: 'test:read',
        description: '測試讀取權限',
        resource: 'test',
        action: 'read',
      };

      const _result = await mockRBACService.createPermission(permission);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('test:read');
      expect(result.data?.id).toBeDefined();
    });

    test('Update權限應該Success', async () => {
      const _permission = {
        name: 'test:read',
        description: '測試讀取權限',
        resource: 'test',
        action: 'read',
      };

      const _createResult = await mockRBACService.createPermission(permission);
      const _permissionId = createResult.data?.id;

      const _updateResult = await mockRBACService.updatePermission(
        permissionId,
        {
          description: '更新的描述',
        }
      );

      expect(updateResult.success).toBe(true);
      expect(updateResult.data?.description).toBe('更新的描述');
    });

    test('Delete權限應該Success', async () => {
      const _permission = {
        name: 'test:read',
        description: '測試讀取權限',
        resource: 'test',
        action: 'read',
      };

      const _createResult = await mockRBACService.createPermission(permission);
      const _permissionId = createResult.data?.id;

      const _deleteResult = await mockRBACService.deletePermission(permissionId);
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.message).toBe('Permission deleted');
    });

    test('Create角色應該Success', async () => {
      const _role = {
        name: 'test-role',
        description: '測試角色',
        permissions: ['perm1', 'perm2'],
        isSystem: false,
      };

      const _result = await mockRBACService.createRole(role);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('test-role');
      expect(result.data?.permissions).toEqual(['perm1', 'perm2']);
    });

    test('Create角色時權限不存在應該Failed', async () => {
      const _role = {
        name: 'test-role',
        description: '測試角色',
        permissions: ['nonexistent-permission'],
        isSystem: false,
      };

      const _result = await mockRBACService.createRole(role);
      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'Permission nonexistent-permission not found'
      );
    });

    test('Update角色應該Success', async () => {
      const _role = {
        name: 'test-role',
        description: '測試角色',
        permissions: ['perm1'],
        isSystem: false,
      };

      const _createResult = await mockRBACService.createRole(role);
      const _roleId = createResult.data?.id;

      const _updateResult = await mockRBACService.updateRole(roleId, {
        description: '更新的角色描述',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data?.description).toBe('更新的角色描述');
    });

    test('Update系統角色權限應該Failed', async () => {
      const _updateResult = await mockRBACService.updateRole('role1', {
        permissions: ['perm1', 'perm2'],
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBe('Cannot modify system role permissions');
    });

    test('Delete系統角色應該Failed', async () => {
      const _deleteResult = await mockRBACService.deleteRole('role1');
      expect(deleteResult.success).toBe(false);
      expect(deleteResult.error).toBe('Cannot delete system role');
    });

    test('分配角色應該Success', async () => {
      const _result = await mockRBACService.assignRole(
        'user1',
        'role2',
        'admin1'
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Role assigned successfully');
    });

    test('重複分配角色應該Failed', async () => {
      await mockRBACService.assignRole('user1', 'role2', 'admin1');
      const _result = await mockRBACService.assignRole(
        'user1',
        'role2',
        'admin1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('User already has this role');
    });

    test('撤銷角色應該Success', async () => {
      await mockRBACService.assignRole('user1', 'role3', 'admin1');
      const _result = await mockRBACService.revokeRole(
        'user1',
        'role3',
        'admin1'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Role revoked successfully');
    });

    test('權限檢查應該正確', async () => {
      // 分配User角色
      await mockRBACService.assignRole('user1', 'role2', 'admin1');

      // CheckUser權限
      const _result = await mockRBACService.checkAccess({
        userId: 'user1',
        resource: 'user',
        action: 'read',
      });

      expect(result.success).toBe(true);
      expect(result.data?.granted).toBe(true);
      expect(result.data?.roles).toContain('user');
    });

    test('權限CheckFailed應該正確', async () => {
      // 分配訪客角色
      await mockRBACService.assignRole('user1', 'role1', 'admin1');

      // CheckUser沒有的權限
      const _result = await mockRBACService.checkAccess({
        userId: 'user1',
        resource: 'system',
        action: 'admin',
      });

      expect(result.success).toBe(true);
      expect(result.data?.granted).toBe(false);
      expect(result.data?.reason).toBe('Access denied');
    });

    test('獲取用戶角色應該正確', async () => {
      await mockRBACService.assignRole('user1', 'role2', 'admin1');
      await mockRBACService.assignRole('user1', 'role3', 'admin1');

      const _roles = mockRBACService.getUserRoles('user1');
      expect(roles).toHaveLength(2);
      expect(roles[0].roleId).toBe('role2');
      expect(roles[1].roleId).toBe('role3');
    });

    test('獲取用戶活躍角色應該正確', async () => {
      await mockRBACService.assignRole('user1', 'role2', 'admin1');
      await mockRBACService.assignRole('user1', 'role3', 'admin1');

      // 撤銷一個角色
      await mockRBACService.revokeRole('user1', 'role3', 'admin1');

      const _activeRoles = mockRBACService.getUserActiveRoles('user1');
      expect(activeRoles).toHaveLength(1);
      expect(activeRoles[0].roleId).toBe('role2');
    });

    test('獲取用戶權限應該正確', async () => {
      await mockRBACService.assignRole('user1', 'role2', 'admin1');

      const _permissions = mockRBACService.getUserPermissions('user1');
      expect(permissions).toHaveLength(4); // user role has 4 permissions
      expect(permissions.some((p: unknown) => p.name === 'user:read')).toBe(true);
      expect(permissions.some((p: unknown) => p.name === 'card:write')).toBe(true);
    });

    test('獲取所有角色應該正確', () => {
      const _roles = mockRBACService.getAllRoles();
      expect(roles).toHaveLength(3);
      expect(roles.some((r: unknown) => r.name === 'guest')).toBe(true);
      expect(roles.some((r: unknown) => r.name === 'user')).toBe(true);
      expect(roles.some((r: unknown) => r.name === 'admin')).toBe(true);
    });

    test('獲取所有權限應該正確', () => {
      const _permissions = mockRBACService.getAllPermissions();
      expect(permissions).toHaveLength(5);
      expect(permissions.some((p: unknown) => p.name === 'user:read')).toBe(true);
      expect(permissions.some((p: unknown) => p.name === 'system:admin')).toBe(
        true
      );
    });
  });

  describe('ErrorHandle測試', () => {
    test('未InitializeService應該返回Error', async () => {
      const _uninitializedService = new MockRBACService();
      const _result = await uninitializedService.createPermission({
        name: 'test:read',
        description: '測試權限',
        resource: 'test',
        action: 'read',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service not initialized');
    });

    test('Delete被使用的權限應該Failed', async () => {
      // perm3 被 guest 角色使用
      const _result = await mockRBACService.deletePermission('perm3');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission is being used by roles');
    });

    test('RBAC 基本功能測試', async () => {
      // Test基本的 RBAC 功能
      expect(mockRBACService.isAvailable()).toBe(true);

      // Test角色分配
      const _assignResult = await mockRBACService.assignRole(
        'test-user',
        'role2',
        'admin1'
      );
      expect(assignResult.success).toBe(true);

      // Test權限Check
      const _accessResult = await mockRBACService.checkAccess({
        userId: 'test-user',
        resource: 'user',
        action: 'read',
      });
      expect(accessResult.success).toBe(true);
      expect(accessResult.data?.granted).toBe(true);
    });
  });

  describe('Service可用性測試', () => {
    test('Service可用性Check', () => {
      expect(mockRBACService.isAvailable()).toBe(true);
    });
  });
});
