import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import { touchService } from '../../services/touchService';
import type {
  SwipeDirection,
  TouchEventData,
  TouchGestureConfig,
  TouchGestureProps,
  TouchGestureType,
} from '../../types/touch';

/**
 * 觸控手勢Component
 * Support多種觸控手勢識別：點擊、雙擊、長按、滑動、縮放、旋轉
 */
export const TouchGesture: React.FC<TouchGestureProps> = ({
  children,
  onTap,
  onDoubleTap,
  onLongPress,
  onSwipe,
  onPinch,
  onRotate,
  onPan,
  config = {},
  className = '',
  style = {},
  disabled = false,
}) => {
  const { theme } = useDesignSystem();
  const _containerRef = useRef<HTMLDivElement>(null);
  const _componentId = useRef(`touch-gesture-${Date.now()}-${Math.random()}`);

  // StatusManage
  const [isPressed, setIsPressed] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [currentPoint, setCurrentPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [touchCount, setTouchCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialAngle, setInitialAngle] = useState(0);
  const [initialScale, setInitialScale] = useState(1);

  // DefaultConfigure
  const defaultConfig: TouchGestureConfig = {
    type: 'tap',
    enabled: true,
    threshold: 10,
    timeout: 300,
    minDistance: 5,
    maxDistance: 1000,
    minDuration: 50,
    maxDuration: 5000,
    preventDefault: true,
    stopPropagation: false,
  };

  const _finalConfig = { ...defaultConfig, ...config };

  // RegisterComponent到Service
  useEffect(() => {
    if (!disabled) {
      touchService.registerGesture(componentId.current, finalConfig);
    }

    return () => {
      touchService.unregisterGesture(componentId.current);
    };
  }, [disabled, finalConfig]);

  // ToolFunction
  const _getTouchPoint = useCallback(
    (event: React.TouchEvent | React.MouseEvent): { x: number; y: number } => {
      if ('touches' in event && event.touches.length > 0) {
        const _touch = event.touches[0];
        return { x: touch.clientX, y: touch.clientY };
      } else if ('clientX' in event) {
        return { x: event.clientX, y: event.clientY };
      }
      return { x: 0, y: 0 };
    },
    []
  );

  const _getTouchPoints = useCallback(
    (event: React.TouchEvent): { x: number; y: number }[] => {
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < event.touches.length; i++) {
        const _touch = event.touches[i];
        points.push({ x: touch.clientX, y: touch.clientY });
      }
      return points;
    },
    []
  );

  const _calculateDistance = useCallback(
    (
      point1: { x: number; y: number },
      point2: { x: number; y: number }
    ): number => {
      const _dx = point2.x - point1.x;
      const _dy = point2.y - point1.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    []
  );

  const _calculateAngle = useCallback(
    (
      point1: { x: number; y: number },
      point2: { x: number; y: number }
    ): number => {
      return (
        (Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180) / Math.PI
      );
    },
    []
  );

  const _calculateCenter = useCallback(
    (points: { x: number; y: number }[]): { x: number; y: number } => {
      const _sumX = points.reduce((sum, point) => sum + point.x, 0);
      const _sumY = points.reduce((sum, point) => sum + point.y, 0);
      return { x: sumX / points.length, y: sumY / points.length };
    },
    []
  );

  const _getSwipeDirection = useCallback(
    (
      startPoint: { x: number; y: number },
      endPoint: { x: number; y: number }
    ): SwipeDirection => {
      const _deltaX = endPoint.x - startPoint.x;
      const _deltaY = endPoint.y - startPoint.y;
      const _absDeltaX = Math.abs(deltaX);
      const _absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY) {
        return deltaX > 0 ? 'right' : 'left';
      } else {
        return deltaY > 0 ? 'down' : 'up';
      }
    },
    []
  );

  const _createTouchEventData = useCallback(
    (
      type: TouchGestureType,
      event: React.TouchEvent | React.MouseEvent,
      additionalData: unknown = {}
    ): TouchEventData => {
      const _point = getTouchPoint(event);
      const _touches = 'touches' in event ? Array.from(event.touches) : [];

      return {
        type,
        x: point.x,
        y: point.y,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
        touches,
        target: event.target,
        ...additionalData,
      };
    },
    [getTouchPoint, startTime]
  );

  // EventHandle器
  const _handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || finalConfig.preventDefault) {
        event.preventDefault();
      }
      if (finalConfig.stopPropagation) {
        event.stopPropagation();
      }

      const _point = getTouchPoint(event);
      const _points = getTouchPoints(event);

      setIsPressed(true);
      setStartPoint(point);
      setCurrentPoint(point);
      setStartTime(Date.now());
      setTouchCount(points.length);

      // Settings長按計時器
      if (onLongPress) {
        const _timer = setTimeout(() => {
          const _touchData = createTouchEventData('longPress', event);
          onLongPress(touchData);
          touchService.trackPerformance(componentId.current, {
            gesture: 'longPress',
            latency: Date.now() - startTime,
          });
        }, finalConfig.timeout || 500);
        setLongPressTimer(timer);
      }

      // 多點觸控Initialize
      if (points.length === 2) {
        const _distance = calculateDistance(points[0], points[1]);
        const _angle = calculateAngle(points[0], points[1]);
        setInitialDistance(distance);
        setInitialAngle(angle);
        setInitialScale(1);
      }
    },
    [
      disabled,
      finalConfig,
      onLongPress,
      getTouchPoint,
      getTouchPoints,
      calculateDistance,
      calculateAngle,
      createTouchEventData,
      startTime,
    ]
  );

  const _handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (disabled) return;

      const _point = getTouchPoint(event);
      const _points = getTouchPoints(event);

      setCurrentPoint(point);

      // Cancel長按計時器
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      // Handle多點觸控手勢
      if (points.length === 2 && startPoint && initialDistance > 0) {
        const _currentDistance = calculateDistance(points[0], points[1]);
        const _currentAngle = calculateAngle(points[0], points[1]);

        // 縮放手勢
        if (
          onPinch &&
          Math.abs(currentDistance - initialDistance) >
            (finalConfig.threshold || 10)
        ) {
          const _scale = currentDistance / initialDistance;
          const _touchData = createTouchEventData('pinch', event, { scale });
          onPinch(scale, touchData);
          setInitialDistance(currentDistance);
          setInitialScale(scale);
        }

        // 旋轉手勢
        if (onRotate && Math.abs(currentAngle - initialAngle) > 5) {
          const _rotation = currentAngle - initialAngle;
          const _touchData = createTouchEventData('rotate', event, {
            rotation,
          });
          onRotate(rotation, touchData);
          setInitialAngle(currentAngle);
        }
      }

      // 平移手勢
      if (onPan && startPoint && point) {
        const _deltaX = point.x - startPoint.x;
        const _deltaY = point.y - startPoint.y;
        const _distance = calculateDistance(startPoint, point);

        if (distance > (finalConfig.minDistance || 5)) {
          const _touchData = createTouchEventData('pan', event, {
            deltaX,
            deltaY,
          });
          onPan(deltaX, deltaY, touchData);
        }
      }
    },
    [
      disabled,
      finalConfig,
      onPinch,
      onRotate,
      onPan,
      getTouchPoint,
      getTouchPoints,
      calculateDistance,
      calculateAngle,
      createTouchEventData,
      startPoint,
      initialDistance,
      initialAngle,
      longPressTimer,
    ]
  );

  const _handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (disabled) return;

      const _point = getTouchPoint(event);
      const _duration = Date.now() - startTime;

      setIsPressed(false);
      setCurrentPoint(null);

      // Cancel長按計時器
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      // CheckYesNo為點擊
      if (startPoint && point && duration < (finalConfig.maxDuration || 5000)) {
        const _distance = calculateDistance(startPoint, point);

        if (distance < (finalConfig.threshold || 10)) {
          const _now = Date.now();
          const _timeSinceLastTap = now - lastTapTime;

          // 雙擊檢測
          if (timeSinceLastTap < 300 && onDoubleTap) {
            const _touchData = createTouchEventData('doubleTap', event);
            onDoubleTap(touchData);
            touchService.trackPerformance(componentId.current, {
              gesture: 'doubleTap',
              latency: timeSinceLastTap,
            });
            setLastTapTime(0);
          } else {
            // 單擊
            if (onTap) {
              const _touchData = createTouchEventData('tap', event);
              onTap(touchData);
              touchService.trackPerformance(componentId.current, {
                gesture: 'tap',
                latency: duration,
              });
            }
            setLastTapTime(now);
          }
        } else if (distance > (finalConfig.minDistance || 5) && onSwipe) {
          // 滑動手勢
          const _direction = getSwipeDirection(startPoint, point);
          const _touchData = createTouchEventData('swipe', event, {
            deltaX: point.x - startPoint.x,
            deltaY: point.y - startPoint.y,
          });
          onSwipe(direction, touchData);
          touchService.trackPerformance(componentId.current, {
            gesture: 'swipe',
            direction,
            latency: duration,
          });
        }
      }

      // ResetStatus
      setStartPoint(null);
      setTouchCount(0);
      setInitialDistance(0);
      setInitialAngle(0);
      setInitialScale(1);
    },
    [
      disabled,
      finalConfig,
      onTap,
      onDoubleTap,
      onSwipe,
      getTouchPoint,
      calculateDistance,
      createTouchEventData,
      startPoint,
      startTime,
      lastTapTime,
      getSwipeDirection,
      longPressTimer,
    ]
  );

  // 滑鼠EventHandle（用於桌面端）
  const _handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;

      const _point = getTouchPoint(event);
      setIsPressed(true);
      setStartPoint(point);
      setCurrentPoint(point);
      setStartTime(Date.now());
      setTouchCount(1);
    },
    [disabled, getTouchPoint]
  );

  const _handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (disabled || !isPressed) return;

      const _point = getTouchPoint(event);
      setCurrentPoint(point);
    },
    [disabled, isPressed, getTouchPoint]
  );

  const _handleMouseUp = useCallback(
    (event: React.MouseEvent) => {
      if (disabled || !isPressed) return;

      const _point = getTouchPoint(event);
      const _duration = Date.now() - startTime;

      setIsPressed(false);
      setCurrentPoint(null);

      // Handle點擊
      if (startPoint && point && onTap) {
        const _distance = calculateDistance(startPoint, point);
        if (distance < (finalConfig.threshold || 10)) {
          const _touchData = createTouchEventData('tap', event);
          onTap(touchData);
          touchService.trackPerformance(componentId.current, {
            gesture: 'tap',
            latency: duration,
          });
        }
      }

      setStartPoint(null);
      setTouchCount(0);
    },
    [
      disabled,
      isPressed,
      finalConfig,
      onTap,
      getTouchPoint,
      calculateDistance,
      createTouchEventData,
      startPoint,
      startTime,
    ]
  );

  // Key盤EventHandle（可訪問性）
  const _handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (onTap) {
          const _touchData = createTouchEventData('tap', event as any);
          onTap(touchData);
        }
      }
    },
    [disabled, onTap, createTouchEventData]
  );

  // 樣式計算
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    userSelect: 'none',
    touchAction: 'manipulation',
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`touch-gesture ${className}`}
      style={containerStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role='button'
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};
