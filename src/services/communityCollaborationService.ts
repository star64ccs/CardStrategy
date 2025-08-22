import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput } from '../utils/validationService';
import { z } from 'zod';

// 社區合作夥伴類型
export interface CommunityPartner {
  id: string;
  name: string;
  type: 'forum' | 'discord' | 'reddit' | 'facebook' | 'instagram' | 'youtube' | 'website';
  url: string;
  memberCount: number;
  description: string;
  contactEmail: string;
  status: 'pending' | 'active' | 'inactive';
  partnershipDate?: string;
  contributionCount: number;
  lastContribution: string;
}

// 合作項目類型
export interface CollaborationProject {
  id: string;
  partnerId: string;
  title: string;
  description: string;
  type: 'data_collection' | 'awareness_campaign' | 'joint_research' | 'event_sponsorship';
  startDate: string;
  endDate?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  targetCards: number;
  collectedCards: number;
  budget?: number;
  results?: string;
}

// 社區合作服務類
class CommunityCollaborationService {
  private config = {
    maxPartners: 50,
    minMemberCount: 100,
    contributionRewards: {
      data_collection: 50,
      awareness_campaign: 30,
      joint_research: 100,
      event_sponsorship: 200,
    },
  };

  // 申請成為合作夥伴
  async applyForPartnership(
    request: Omit<CommunityPartner, 'id' | 'status' | 'contributionCount' | 'lastContribution'>
  ): Promise<ApiResponse<CommunityPartner>> {
    try {
      const validationResult = validateInput(
        z.object({
          name: z.string().min(2, '名稱至少2個字符'),
          type: z.enum(['forum', 'discord', 'reddit', 'facebook', 'instagram', 'youtube', 'website']),
          url: z.string().url('無效的URL'),
          memberCount: z.number().min(this.config.minMemberCount, `成員數量至少${this.config.minMemberCount}人`),
          description: z.string().min(20, '描述至少20個字符'),
          contactEmail: z.string().email('無效的郵箱地址'),
        }),
        request
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '輸入驗證失敗');
      }

      const response = await apiService.post<CommunityPartner>(
        API_ENDPOINTS.COMMUNITY.APPLY || '/community/apply',
        request
      );

      logger.info('✅ 合作夥伴申請提交成功', {
        name: request.name,
        type: request.type,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 合作夥伴申請失敗:', { error: error.message });
      throw error;
    }
  }

  // 獲取合作夥伴列表
  async getPartners(status?: 'pending' | 'active' | 'inactive'): Promise<ApiResponse<CommunityPartner[]>> {
    try {
      const params = status ? { status } : {};
      const response = await apiService.get<CommunityPartner[]>(
        API_ENDPOINTS.COMMUNITY.PARTNERS || '/community/partners',
        { params }
      );

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取合作夥伴列表失敗:', { error: error.message });
      throw error;
    }
  }

  // 創建合作項目
  async createProject(
    request: Omit<CollaborationProject, 'id' | 'collectedCards' | 'results'>
  ): Promise<ApiResponse<CollaborationProject>> {
    try {
      const validationResult = validateInput(
        z.object({
          partnerId: z.string().uuid('無效的合作夥伴ID'),
          title: z.string().min(5, '標題至少5個字符'),
          description: z.string().min(50, '描述至少50個字符'),
          type: z.enum(['data_collection', 'awareness_campaign', 'joint_research', 'event_sponsorship']),
          startDate: z.string().datetime('無效的開始日期'),
          endDate: z.string().datetime('無效的結束日期').optional(),
          status: z.enum(['planning', 'active', 'completed', 'cancelled']),
          targetCards: z.number().min(1, '目標卡牌數量至少1張'),
          budget: z.number().min(0, '預算不能為負數').optional(),
        }),
        request
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '輸入驗證失敗');
      }

      const response = await apiService.post<CollaborationProject>(
        API_ENDPOINTS.COMMUNITY.PROJECTS || '/community/projects',
        request
      );

      logger.info('✅ 合作項目創建成功', {
        title: request.title,
        partnerId: request.partnerId,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 合作項目創建失敗:', { error: error.message });
      throw error;
    }
  }

  // 獲取合作項目列表
  async getProjects(partnerId?: string): Promise<ApiResponse<CollaborationProject[]>> {
    try {
      const params = partnerId ? { partnerId } : {};
      const response = await apiService.get<CollaborationProject[]>(
        API_ENDPOINTS.COMMUNITY.PROJECTS || '/community/projects',
        { params }
      );

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取合作項目列表失敗:', { error: error.message });
      throw error;
    }
  }

  // 更新項目進度
  async updateProjectProgress(
    projectId: string,
    collectedCards: number,
    notes?: string
  ): Promise<ApiResponse<CollaborationProject>> {
    try {
      const response = await apiService.patch<CollaborationProject>(
        `${API_ENDPOINTS.COMMUNITY.PROJECTS}/${projectId}/progress` || `/community/projects/${projectId}/progress`,
        { collectedCards, notes }
      );

      logger.info('✅ 項目進度更新成功', {
        projectId,
        collectedCards,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 項目進度更新失敗:', { error: error.message, projectId });
      throw error;
    }
  }

  // 獲取合作統計
  async getCollaborationStats(): Promise<ApiResponse<{
    totalPartners: number;
    activePartners: number;
    totalProjects: number;
    activeProjects: number;
    totalCardsCollected: number;
    totalRewardsDistributed: number;
  }>> {
    try {
      const response = await apiService.get<{
        totalPartners: number;
        activePartners: number;
        totalProjects: number;
        activeProjects: number;
        totalCardsCollected: number;
        totalRewardsDistributed: number;
      }>(API_ENDPOINTS.COMMUNITY.STATS || '/community/stats');

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取合作統計失敗:', { error: error.message });
      throw error;
    }
  }
}

export const communityCollaborationService = new CommunityCollaborationService();
export default communityCollaborationService;
