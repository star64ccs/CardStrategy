// 響應式表單組件

import React, { useCallback, useMemo, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useResponsive } from '../../hooks/useResponsive';
import type {
  ResponsiveFormItemProps,
  ResponsiveFormProps,
  ResponsiveFormRule,
} from '../../types/responsive';

// 表單上下文
interface FormContextType {
  layout: 'horizontal' | 'vertical' | 'inline';
  labelCol: { span: number; offset?: number };
  wrapperCol: { span: number; offset?: number };
  labelAlign: 'left' | 'right';
  colon: boolean;
  requiredMark: boolean | 'optional';
  validateOnChange: boolean;
  validateOnBlur: boolean;
  values: Record<string, any>;
  errors: Record<string, string>;
  setValue: (name: string, value: unknown) => void;
  setError: (name: string, error: string) => void;
  validateField: (name: string) => void;
}

const _FormContext = React.createContext<FormContextType | null>(null);

// 響應式表單組件
export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  layout = 'horizontal',
  labelCol,
  wrapperCol,
  labelAlign = 'right',
  colon = true,
  requiredMark = true,
  scrollToFirstError = false,
  validateOnChange = true,
  validateOnBlur = true,
  children,
  onSubmit,
  onValuesChange,
  className = '',
  style = {},
  'data-testid': dataTestId,
}) => {
  const { getResponsiveValue } = useResponsive();
  const { currentTheme, currentThemeData } = useDesignSystem();

  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 響應式佈局處理
  const _responsiveLayout = useMemo(
    () => getResponsiveValue(layout),
    [layout, getResponsiveValue]
  );

  const _responsiveLabelCol = useMemo(
    () => getResponsiveValue(labelCol) || { span: 6 },
    [labelCol, getResponsiveValue]
  );

  const _responsiveWrapperCol = useMemo(
    () => getResponsiveValue(wrapperCol) || { span: 18 },
    [wrapperCol, getResponsiveValue]
  );

  const _responsiveLabelAlign = useMemo(
    () => getResponsiveValue(labelAlign),
    [labelAlign, getResponsiveValue]
  );

  // 設置表單值
  const _setValue = useCallback(
    (name: string, value: unknown) => {
      setValues(prev => {
        const _newValues = { ...prev, [name]: value };
        onValuesChange?.({ [name]: value }, newValues);
        return newValues;
      });
    },
    [onValuesChange]
  );

  // 設置錯誤
  const _setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // 驗證字段
  const _validateField = useCallback(
    (name: string) => {
      // 這裡可以實現具體的驗證邏輯
      // 暫時返回空字符串表示驗證通過
      setError(name, '');
    },
    [setError]
  );

  // 表單提交
  const _handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // 驗證所有字段
      const _fieldNames = Object.keys(values);
      let hasErrors = false;

      fieldNames.forEach(name => {
        validateField(name);
        if (errors[name]) {
          hasErrors = true;
        }
      });

      if (!hasErrors) {
        onSubmit?.(values);
      } else if (scrollToFirstError) {
        // 滾動到第一個錯誤字段
        const _firstErrorField = document.querySelector('.form-item-error');
        firstErrorField?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    },
    [values, errors, onSubmit, validateField, scrollToFirstError]
  );

  // 表單樣式
  const _formStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      backgroundColor:
        currentThemeData?.colors?.background?.primary || '#ffffff',
      borderRadius: currentThemeData?.borderRadius?.md || '8px',
      padding: '24px',
      boxShadow: currentThemeData?.shadow?.sm || '0 1px 3px rgba(0, 0, 0, 0.1)',
      ...style,
    };

    // 響應式佈局樣式
    if (responsiveLayout === 'inline') {
      baseStyle.display = 'flex';
      baseStyle.flexWrap = 'wrap';
      baseStyle.alignItems = 'center';
      baseStyle.gap = '16px';
    }

    return baseStyle;
  }, [responsiveLayout, currentTheme, style]);

  // 上下文值
  const _contextValue = useMemo<FormContextType>(
    () => ({
      layout: responsiveLayout,
      labelCol: responsiveLabelCol,
      wrapperCol: responsiveWrapperCol,
      labelAlign: responsiveLabelAlign,
      colon,
      requiredMark,
      validateOnChange,
      validateOnBlur,
      values,
      errors,
      setValue,
      setError,
      validateField,
    }),
    [
      responsiveLayout,
      responsiveLabelCol,
      responsiveWrapperCol,
      responsiveLabelAlign,
      colon,
      requiredMark,
      validateOnChange,
      validateOnBlur,
      values,
      errors,
      setValue,
      setError,
      validateField,
    ]
  );

  return (
    <FormContext.Provider value={contextValue}>
      <form
        className={`responsive-form responsive-form-${responsiveLayout} ${className}`}
        style={formStyle}
        onSubmit={handleSubmit}
        data-testid={dataTestId}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

// 表單項目組件
export const ResponsiveFormItem: React.FC<ResponsiveFormItemProps> = ({
  label,
  name,
  rules = [],
  validateStatus,
  help,
  extra,
  required = false,
  hidden,
  span,
  offset,
  children,
  className = '',
  style = {},
  'data-testid': dataTestId,
}) => {
  const _context = React.useContext(FormContext);
  const { getResponsiveValue } = useResponsive();
  const { currentTheme, currentThemeData } = useDesignSystem();

  if (!context) {
    throw new Error('ResponsiveFormItem must be used within ResponsiveForm');
  }

  const {
    layout,
    labelCol,
    wrapperCol,
    labelAlign,
    colon,
    requiredMark,
    values,
    errors,
    setValue,
    setError,
    validateField,
  } = context;

  // 響應式處理
  const _responsiveHidden = useMemo(
    () => getResponsiveValue(hidden),
    [hidden, getResponsiveValue]
  );

  const _responsiveSpan = useMemo(
    () => getResponsiveValue(span),
    [span, getResponsiveValue]
  );

  const _responsiveOffset = useMemo(
    () => getResponsiveValue(offset),
    [offset, getResponsiveValue]
  );

  // 如果隱藏，不渲染
  if (responsiveHidden) {
    return null;
  }

  // 處理子組件
  const _enhancedChildren = React.useMemo(() => {
    if (!name) return children;

    return React.cloneElement(children as React.ReactElement<any>, {
      value: values[name as keyof typeof values] || '',
      onChange: (value: unknown) => {
        setValue(name as keyof typeof values, value);
        if (context.validateOnChange) {
          validateField(name as keyof typeof values);
        }
      },
      onBlur: () => {
        if (context.validateOnBlur) {
          validateField(name as keyof typeof values);
        }
      },
    });
  }, [children, name, values, setValue, validateField, context]);

  // 驗證狀態
  const _currentError = errors[name as keyof typeof errors] || '';
  const _currentValidateStatus =
    validateStatus || (currentError ? 'error' : undefined);

  // 項目樣式
  const _itemStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      marginBottom: '24px',
      ...style,
    };

    // 響應式佈局
    if (layout === 'horizontal') {
      baseStyle.display = 'flex';
      baseStyle.alignItems = 'flex-start';
      baseStyle.gap = '8px';
    } else if (layout === 'vertical') {
      baseStyle.display = 'flex';
      baseStyle.flexDirection = 'column';
      baseStyle.gap = '8px';
    } else if (layout === 'inline') {
      baseStyle.display = 'flex';
      baseStyle.alignItems = 'center';
      baseStyle.gap = '8px';
      baseStyle.marginBottom = '0';
    }

    // 響應式寬度
    if (responsiveSpan) {
      baseStyle.flex = `0 0 ${(responsiveSpan / 24) * 100}%`;
    }

    if (responsiveOffset) {
      baseStyle.marginLeft = `${(responsiveOffset / 24) * 100}%`;
    }

    return baseStyle;
  }, [layout, responsiveSpan, responsiveOffset, style]);

  // 標籤樣式
  const _labelStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      color: currentThemeData?.colors?.text?.primary || '#000000',
      fontSize: currentThemeData?.typography?.sizes?.base || '16px',
      fontWeight: currentThemeData?.typography?.weights?.normal || 'normal',
      lineHeight: currentThemeData?.typography?.lineHeights?.normal || '1.5',
      textAlign: labelAlign,
      flexShrink: 0,
    };

    if (layout === 'horizontal') {
      baseStyle.width = `${(labelCol.span / 24) * 100}%`;
      if (labelCol.offset) {
        baseStyle.marginLeft = `${(labelCol.offset / 24) * 100}%`;
      }
    }

    return baseStyle;
  }, [layout, labelCol, labelAlign, currentTheme]);

  // 內容區域樣式
  const _contentStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      flex: 1,
      minWidth: 0,
    };

    if (layout === 'horizontal') {
      baseStyle.width = `${(wrapperCol.span / 24) * 100}%`;
      if (wrapperCol.offset) {
        baseStyle.marginLeft = `${(wrapperCol.offset / 24) * 100}%`;
      }
    }

    return baseStyle;
  }, [layout, wrapperCol]);

  // 渲染標籤
  const _renderLabel = () => {
    if (!label) return null;

    const _labelText = typeof label === 'string' ? label : 'Label';
    const _requiredSymbol = required && requiredMark ? '*' : '';
    const _colonSymbol = colon ? ':' : '';

    return (
      <label
        style={labelStyle}
        className={required ? 'form-item-required' : ''}
      >
        {labelText}
        {requiredSymbol}
        {colonSymbol}
      </label>
    );
  };

  // 渲染幫助文本
  const _renderHelp = () => {
    if (!help && !currentError) return null;

    const _helpText = currentError || help;
    const _helpColor = currentError
      ? currentThemeData?.colors?.brand?.error || '#dc3545'
      : currentThemeData?.colors?.text?.secondary || '#666666';

    return (
      <div
        style={{
          color: helpColor,
          fontSize: currentThemeData?.typography?.sizes?.xs || '12px',
          marginTop: '4px',
          lineHeight: currentThemeData?.typography?.lineHeights?.tight || '1.2',
        }}
        className={currentError ? 'form-item-error' : 'form-item-help'}
      >
        {helpText}
      </div>
    );
  };

  // 渲染額外內容
  const _renderExtra = () => {
    if (!extra) return null;

    return (
      <div
        style={{
          color: currentThemeData?.colors?.text?.secondary || '#666666',
          fontSize: currentThemeData?.typography?.sizes?.xs || '12px',
          marginTop: '4px',
          lineHeight: currentThemeData?.typography?.lineHeights?.tight || '1.2',
        }}
        className='form-item-extra'
      >
        {extra}
      </div>
    );
  };

  return (
    <div
      className={`form-item form-item-${currentValidateStatus || 'normal'} ${className}`}
      style={itemStyle}
      data-testid={dataTestId}
    >
      {renderLabel()}
      <div style={contentStyle}>
        {enhancedChildren}
        {renderHelp()}
        {renderExtra()}
      </div>
    </div>
  );
};

// 導出類型
export type {
  ResponsiveFormItemProps,
  ResponsiveFormProps,
  ResponsiveFormRule,
};
