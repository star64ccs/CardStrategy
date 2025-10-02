// 反饋Table單Component
import React, { useCallback, useState } from 'react';

import type {
  FeedbackFormData,
  FeedbackFormProps,
  SatisfactionRating,
} from '../../types/feedback';
import {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackType,
} from '../../types/feedback';
import { useFeedback } from '../providers/FeedbackProvider';

// 反饋Table單Component
export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  config = {},
  onSubmit,
  onCancel,
  initialData = {},
  disabled = false,
  loading = false,
  className = '',
  style = {},
}) => {
  const { submitFeedback } = useFeedback();

  // Table單Status
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: FeedbackType.GENERAL_FEEDBACK,
    category: FeedbackCategory.OTHER,
    priority: FeedbackPriority.MEDIUM,
    title: '',
    description: '',
    userEmail: '',
    userName: '',
    satisfactionRating: undefined,
    followUpRequired: false,
    attachments: [],
    tags: [],
    ...initialData,
  });

  // VerifyStatus
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // HandleInput變化
  const _handleInputChange = useCallback(
    (field: keyof FeedbackFormData, value: unknown) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear對應的Error
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    },
    [errors]
  );

  // VerifyTable單
  const _validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '標題不能為空';
    }

    if (!formData.description.trim()) {
      newErrors.description = '描述不能為空';
    }

    if (!formData.type) {
      newErrors.type = '請選擇反饋類型';
    }

    if (!formData.category) {
      newErrors.category = '請選擇反饋分類';
    }

    if (!formData.priority) {
      newErrors.priority = '請選擇優先級';
    }

    if (
      formData.userEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)
    ) {
      newErrors.userEmail = '請輸入有效的郵箱地址';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // HandleTable單Submit
  const _handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        await submitFeedback(formData);

        // ResetTable單
        setFormData({
          type: FeedbackType.GENERAL_FEEDBACK,
          category: FeedbackCategory.OTHER,
          priority: FeedbackPriority.MEDIUM,
          title: '',
          description: '',
          userEmail: '',
          userName: '',
          satisfactionRating: undefined,
          followUpRequired: false,
          attachments: [],
          tags: [],
        });

        setErrors({});

        // 調用ExternalSubmitCallback
        if (onSubmit) {
          onSubmit(formData);
        }
      } catch (error) {
        console.error('提交反饋Failed:', error);
        setErrors({ submit: '提交Failed，請稍後重試' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, submitFeedback, onSubmit]
  );

  // HandleCancel
  const _handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // HandleFileUpload
  const _handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const _files = Array.from(e.target.files || []);
      const _maxFiles = config.maxAttachments || 5;
      const _maxSize = config.maxAttachmentSize || 10 * 1024 * 1024; // 10MB

      if (files.length > maxFiles) {
        setErrors(prev => ({
          ...prev,
          attachments: `最多只能上傳 ${maxFiles} 個文件`,
        }));
        return;
      }

      const _validFiles = files.filter(file => {
        if (file.size > maxSize) {
          setErrors(prev => ({
            ...prev,
            attachments: `文件 ${file.name} 超過大小限制`,
          }));
          return false;
        }
        return true;
      });

      setFormData(prev => ({ ...prev, attachments: validFiles }));
    },
    [config]
  );

  // HandleTagInput
  const _handleTagInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
        e.preventDefault();
        const _newTag = e.currentTarget.value.trim();
        if (!formData.tags?.includes(newTag)) {
          setFormData(prev => ({
            ...prev,
            tags: [...(prev.tags || []), newTag],
          }));
        }
        e.currentTarget.value = '';
      }
    },
    [formData.tags]
  );

  // RemoveTag
  const _removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  }, []);

  const _isFormDisabled = disabled || loading || isSubmitting;

  return (
    <div className={`feedback-form ${className}`} style={style}>
      <form onSubmit={handleSubmit} className='feedback-form__container'>
        <div className='feedback-form__header'>
          <h3 className='feedback-form__title'>提交反饋</h3>
          <p className='feedback-form__subtitle'>
            您的反饋對我們很重要，我們會認真處理每一條建議
          </p>
        </div>

        <div className='feedback-form__content'>
          {/* 反饋Class型 */}
          <div className='feedback-form__field'>
            <label className='feedback-form__label'>
              反饋類型 <span className='feedback-form__required'>*</span>
            </label>
            <select
              className={`feedback-form__select ${errors.type ? 'feedback-form__select--error' : ''}`}
              value={formData.type}
              onChange={e =>
                handleInputChange('type', e.target.value as FeedbackType)
              }
              disabled={isFormDisabled}
            >
              <option value={FeedbackType.GENERAL_FEEDBACK}>一般反饋</option>
              <option value={FeedbackType.FEATURE_REQUEST}>功能請求</option>
              <option value={FeedbackType.BUG_REPORT}>錯誤報告</option>
              <option value={FeedbackType.USER_EXPERIENCE}>用戶體驗</option>
              <option value={FeedbackType.PERFORMANCE_ISSUE}>性能問題</option>
              <option value={FeedbackType.SURVEY_RESPONSE}>調查回應</option>
            </select>
            {errors.type && (
              <span className='feedback-form__error'>{errors.type}</span>
            )}
          </div>

          {/* 反饋分Class */}
          <div className='feedback-form__field'>
            <label className='feedback-form__label'>
              反饋分類 <span className='feedback-form__required'>*</span>
            </label>
            <select
              className={`feedback-form__select ${errors.category ? 'feedback-form__select--error' : ''}`}
              value={formData.category}
              onChange={e =>
                handleInputChange(
                  'category',
                  e.target.value as FeedbackCategory
                )
              }
              disabled={isFormDisabled}
            >
              <option value={FeedbackCategory.OTHER}>其他</option>
              <option value={FeedbackCategory.UI_UX}>用戶界面/體驗</option>
              <option value={FeedbackCategory.FUNCTIONALITY}>功能問題</option>
              <option value={FeedbackCategory.PERFORMANCE}>性能問題</option>
              <option value={FeedbackCategory.SECURITY}>安全問題</option>
              <option value={FeedbackCategory.ACCESSIBILITY}>可訪問性</option>
              <option value={FeedbackCategory.INTEGRATION}>集成問題</option>
              <option value={FeedbackCategory.DOCUMENTATION}>文檔問題</option>
            </select>
            {errors.category && (
              <span className='feedback-form__error'>{errors.category}</span>
            )}
          </div>

          {/* 優先級 */}
          <div className='feedback-form__field'>
            <label className='feedback-form__label'>
              優先級 <span className='feedback-form__required'>*</span>
            </label>
            <select
              className={`feedback-form__select ${errors.priority ? 'feedback-form__select--error' : ''}`}
              value={formData.priority}
              onChange={e =>
                handleInputChange(
                  'priority',
                  e.target.value as FeedbackPriority
                )
              }
              disabled={isFormDisabled}
            >
              <option value={FeedbackPriority.LOW}>低</option>
              <option value={FeedbackPriority.MEDIUM}>中</option>
              <option value={FeedbackPriority.HIGH}>高</option>
              <option value={FeedbackPriority.CRITICAL}>緊急</option>
            </select>
            {errors.priority && (
              <span className='feedback-form__error'>{errors.priority}</span>
            )}
          </div>

          {/* 標題 */}
          <div className='feedback-form__field'>
            <label className='feedback-form__label'>
              標題 <span className='feedback-form__required'>*</span>
            </label>
            <input
              type='text'
              className={`feedback-form__input ${errors.title ? 'feedback-form__input--error' : ''}`}
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              placeholder='請簡要描述您的反饋'
              disabled={isFormDisabled}
              maxLength={100}
            />
            {errors.title && (
              <span className='feedback-form__error'>{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className='feedback-form__field'>
            <label className='feedback-form__label'>
              詳細描述 <span className='feedback-form__required'>*</span>
            </label>
            <textarea
              className={`feedback-form__textarea ${errors.description ? 'feedback-form__textarea--error' : ''}`}
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder='請詳細描述您的問題或建議...'
              disabled={isFormDisabled}
              rows={5}
              maxLength={1000}
            />
            <div className='feedback-form__char-count'>
              {formData.description.length}/1000
            </div>
            {errors.description && (
              <span className='feedback-form__error'>{errors.description}</span>
            )}
          </div>

          {/* UserInformation */}
          <div className='feedback-form__row'>
            <div className='feedback-form__field feedback-form__field--half'>
              <label className='feedback-form__label'>姓名</label>
              <input
                type='text'
                className='feedback-form__input'
                value={formData.userName || ''}
                onChange={e => handleInputChange('userName', e.target.value)}
                placeholder='您的姓名（可選）'
                disabled={isFormDisabled}
              />
            </div>
            <div className='feedback-form__field feedback-form__field--half'>
              <label className='feedback-form__label'>郵箱</label>
              <input
                type='email'
                className={`feedback-form__input ${errors.userEmail ? 'feedback-form__input--error' : ''}`}
                value={formData.userEmail || ''}
                onChange={e => handleInputChange('userEmail', e.target.value)}
                placeholder='您的郵箱（可選）'
                disabled={isFormDisabled}
              />
              {errors.userEmail && (
                <span className='feedback-form__error'>{errors.userEmail}</span>
              )}
            </div>
          </div>

          {/* 滿意度評分 */}
          <div className='feedback-form__field'>
            <label className='feedback-form__label'>滿意度評分</label>
            <div className='feedback-form__rating'>
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type='button'
                  className={`feedback-form__rating-btn ${
                    formData.satisfactionRating === rating
                      ? 'feedback-form__rating-btn--active'
                      : ''
                  }`}
                  onClick={() =>
                    handleInputChange(
                      'satisfactionRating',
                      rating as SatisfactionRating
                    )
                  }
                  disabled={isFormDisabled}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className='feedback-form__rating-labels'>
              <span>非常不滿意</span>
              <span>非常滿意</span>
            </div>
          </div>

          {/* Tag */}
          <div className='feedback-form__field'>
            <label className='feedback-form__label'>標籤</label>
            <input
              type='text'
              className='feedback-form__input'
              placeholder='輸入標籤後按 Enter 添加'
              onKeyDown={handleTagInput}
              disabled={isFormDisabled}
            />
            {formData.tags && formData.tags.length > 0 && (
              <div className='feedback-form__tags'>
                {formData.tags.map((tag, index) => (
                  <span key={index} className='feedback-form__tag'>
                    {tag}
                    <button
                      type='button'
                      className='feedback-form__tag-remove'
                      onClick={() => removeTag(tag)}
                      disabled={isFormDisabled}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 附件 */}
          <div className='feedback-form__field'>
            <label className='feedback-form__label'>附件</label>
            <input
              type='file'
              className='feedback-form__file-input'
              multiple
              onChange={handleFileChange}
              disabled={isFormDisabled}
              accept='image/*,video/*,.pdf,.doc,.docx,.txt,.log'
            />
            {errors.attachments && (
              <span className='feedback-form__error'>{errors.attachments}</span>
            )}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className='feedback-form__attachments'>
                {formData.attachments.map((file, index) => (
                  <div key={index} className='feedback-form__attachment'>
                    <span className='feedback-form__attachment-name'>
                      {file.name}
                    </span>
                    <span className='feedback-form__attachment-size'>
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 後續跟進 */}
          <div className='feedback-form__field'>
            <label className='feedback-form__checkbox-label'>
              <input
                type='checkbox'
                className='feedback-form__checkbox'
                checked={formData.followUpRequired}
                onChange={e =>
                  handleInputChange('followUpRequired', e.target.checked)
                }
                disabled={isFormDisabled}
              />
              <span>需要後續跟進</span>
            </label>
          </div>
        </div>

        {/* ErrorInformation */}
        {errors.submit && (
          <div className='feedback-form__submit-error'>{errors.submit}</div>
        )}

        {/* Table單Operation */}
        <div className='feedback-form__actions'>
          <button
            type='button'
            className='feedback-form__btn feedback-form__btn--secondary'
            onClick={handleCancel}
            disabled={isFormDisabled}
          >
            取消
          </button>
          <button
            type='submit'
            className='feedback-form__btn feedback-form__btn--primary'
            disabled={isFormDisabled}
          >
            {isSubmitting ? '提交中...' : '提交反饋'}
          </button>
        </div>
      </form>

      <style>{`
        .feedback-form {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f9f9f9;
        }
      `}</style>
    </div>
  );
};

// ExportComponent
export default FeedbackForm;
