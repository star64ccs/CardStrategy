import React, { forwardRef, useMemo } from 'react';

import { useResponsive } from '../../hooks/useResponsive';
import type { GridItemProps } from '../../types/layout';

// GridItem 組件
export const _GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      children,
      column,
      row,
      columnSpan,
      rowSpan,
      area,
      alignSelf = 'stretch',
      justifySelf = 'start',
      order,
      className = '',
      style,
      id,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    const { getResponsiveValue } = useResponsive();

    // 計算樣式
    const _gridItemStyle = useMemo(() => {
      const _responsiveColumn = getResponsiveValue(column);
      const _responsiveRow = getResponsiveValue(row);
      const _responsiveColumnSpan = getResponsiveValue(columnSpan);
      const _responsiveRowSpan = getResponsiveValue(rowSpan);
      const _responsiveArea = getResponsiveValue(area);
      const _responsiveAlignSelf = getResponsiveValue(alignSelf);
      const _responsiveJustifySelf = getResponsiveValue(justifySelf);
      const _responsiveOrder = getResponsiveValue(order);

      // 對齊方式映射
      const _alignmentMap = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        stretch: 'stretch',
        baseline: 'baseline',
      };

      // 網格位置計算
      let gridColumn = undefined;
      let gridRow = undefined;

      if (responsiveColumn !== undefined) {
        if (typeof responsiveColumn === 'number') {
          gridColumn = responsiveColumn;
        } else {
          gridColumn = responsiveColumn;
        }
      }

      if (responsiveRow !== undefined) {
        if (typeof responsiveRow === 'number') {
          gridRow = responsiveRow;
        } else {
          gridRow = responsiveRow;
        }
      }

      // 網格跨度計算
      if (responsiveColumnSpan !== undefined) {
        if (gridColumn !== undefined) {
          gridColumn = `${gridColumn} / span ${responsiveColumnSpan}`;
        } else {
          gridColumn = `span ${responsiveColumnSpan}`;
        }
      }

      if (responsiveRowSpan !== undefined) {
        if (gridRow !== undefined) {
          gridRow = `${gridRow} / span ${responsiveRowSpan}`;
        } else {
          gridRow = `span ${responsiveRowSpan}`;
        }
      }

      return {
        gridColumn,
        gridRow,
        gridArea: responsiveArea,
        alignSelf: alignmentMap[responsiveAlignSelf] || 'stretch',
        justifySelf:
          alignmentMap[responsiveJustifySelf as keyof typeof alignmentMap] ||
          'start',
        order: responsiveOrder,
        ...style,
      };
    }, [
      getResponsiveValue,
      column,
      row,
      columnSpan,
      rowSpan,
      area,
      alignSelf,
      justifySelf,
      order,
      style,
    ]);

    // 生成 CSS 類名
    const _gridItemClassName = useMemo(() => {
      const _classes = ['layout-grid-item'];

      const _responsiveColumn = getResponsiveValue(column);
      if (responsiveColumn !== undefined) {
        classes.push(`layout-grid-item--column-${responsiveColumn}`);
      }

      const _responsiveRow = getResponsiveValue(row);
      if (responsiveRow !== undefined) {
        classes.push(`layout-grid-item--row-${responsiveRow}`);
      }

      const _responsiveColumnSpan = getResponsiveValue(columnSpan);
      if (responsiveColumnSpan !== undefined) {
        classes.push(`layout-grid-item--column-span-${responsiveColumnSpan}`);
      }

      const _responsiveRowSpan = getResponsiveValue(rowSpan);
      if (responsiveRowSpan !== undefined) {
        classes.push(`layout-grid-item--row-span-${responsiveRowSpan}`);
      }

      const _responsiveArea = getResponsiveValue(area);
      if (responsiveArea) {
        classes.push(`layout-grid-item--area-${responsiveArea}`);
      }

      return `${classes.join(' ')} ${className}`.trim();
    }, [column, row, columnSpan, rowSpan, area, className, getResponsiveValue]);

    return (
      <div
        ref={ref}
        id={id}
        className={gridItemClassName}
        style={gridItemStyle}
        data-testid={dataTestId || 'layout-grid-item'}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';
