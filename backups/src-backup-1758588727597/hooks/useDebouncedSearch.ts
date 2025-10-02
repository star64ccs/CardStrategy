/**
 * 智能搜索防抖 Hook
 * 提供基於用戶行為的智能防抖策略
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface DebounceConfig {
  delay?: number;
  minLength?: number;
  maxLength?: number;
  immediate?: boolean;
  leading?: boolean;
  trailing?: boolean;
  adaptiveDelay?: boolean;
  userBehaviorAnalysis?: boolean;
}

export interface SearchBehavior {
  averageSearchLength: number;
  searchFrequency: number;
  preferredDelay: number;
  lastSearchTime: number;
}

export interface DebouncedSearchResult<T> {
  searchTerm: string;
  debouncedTerm: string;
  isLoading: boolean;
  results: T[];
  behavior: SearchBehavior;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  updateBehavior: (newBehavior: Partial<SearchBehavior>) => void;
}

export function useDebouncedSearch<T>(
  searchFunction: (term: string) => Promise<T[]> | T[],
  config: DebounceConfig = {}
): DebouncedSearchResult<T> {
  const {
    delay = 300,
    minLength = 1,
    maxLength = 100,
    immediate = false,
    leading = false,
    trailing = true,
    adaptiveDelay = true,
    userBehaviorAnalysis = true,
  } = config;

  const [searchTerm, setSearchTermState] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<T[]>([]);
  const [behavior, setBehavior] = useState<SearchBehavior>({
    averageSearchLength: 0,
    searchFrequency: 0,
    preferredDelay: delay,
    lastSearchTime: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const searchHistoryRef = useRef<string[]>([]);
  const behaviorRef = useRef<SearchBehavior>(behavior);
  const lastSearchTimeRef = useRef<number>(0);
  const searchCountRef = useRef<number>(0);

  // 更新行為分析
  const updateBehavior = useCallback((newBehavior: Partial<SearchBehavior>) => {
    setBehavior(prev => {
      const updated = { ...prev, ...newBehavior };
      behaviorRef.current = updated;
      return updated;
    });
  }, []);

  // 計算自適應延遲
  const calculateAdaptiveDelay = useCallback(
    (term: string): number => {
      if (!adaptiveDelay) return delay;

      const currentBehavior = behaviorRef.current;
      const termLength = term.length;
      const timeSinceLastSearch = Date.now() - lastSearchTimeRef.current;

      // 基於搜索長度調整延遲
      let lengthFactor = 1;
      if (termLength <= 3)
        lengthFactor = 0.7; // 短搜索更快響應
      else if (termLength >= 10) lengthFactor = 1.3; // 長搜索稍慢響應

      // 基於搜索頻率調整延遲
      let frequencyFactor = 1;
      if (currentBehavior.searchFrequency > 10)
        frequencyFactor = 0.8; // 高頻搜索減少延遲
      else if (currentBehavior.searchFrequency < 3) frequencyFactor = 1.2; // 低頻搜索增加延遲

      // 基於時間間隔調整延遲
      let timeFactor = 1;
      if (timeSinceLastSearch < 1000)
        timeFactor = 0.6; // 快速連續搜索減少延遲
      else if (timeSinceLastSearch > 5000) timeFactor = 1.4; // 長時間間隔增加延遲

      const adaptiveDelay = Math.max(
        100,
        Math.min(1000, delay * lengthFactor * frequencyFactor * timeFactor)
      );

      return Math.round(adaptiveDelay);
    },
    [delay, adaptiveDelay]
  );

  // 執行搜索
  const performSearch = useCallback(
    async (term: string) => {
      if (!term || term.length < minLength || term.length > maxLength) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      lastSearchTimeRef.current = Date.now();

      try {
        const searchResults = await searchFunction(term);
        setResults(searchResults);

        // 更新搜索歷史
        searchHistoryRef.current.push(term);
        if (searchHistoryRef.current.length > 50) {
          searchHistoryRef.current = searchHistoryRef.current.slice(-50);
        }

        // 更新行為統計
        searchCountRef.current++;
        const currentTime = Date.now();
        const timeDiff = currentTime - behaviorRef.current.lastSearchTime;

        const newBehavior: Partial<SearchBehavior> = {
          averageSearchLength:
            (behaviorRef.current.averageSearchLength *
              (searchCountRef.current - 1) +
              term.length) /
            searchCountRef.current,
          searchFrequency:
            searchCountRef.current /
            Math.max(
              1,
              (currentTime - behaviorRef.current.lastSearchTime) / 60000
            ), // 每分鐘搜索次數
          lastSearchTime: currentTime,
        };

        // 基於用戶行為調整偏好延遲
        if (userBehaviorAnalysis && searchHistoryRef.current.length > 5) {
          const recentSearches = searchHistoryRef.current.slice(-5);
          const avgLength =
            recentSearches.reduce((sum, s) => sum + s.length, 0) /
            recentSearches.length;

          if (avgLength < 4) {
            newBehavior.preferredDelay = Math.max(100, delay * 0.7); // 短搜索偏好更快響應
          } else if (avgLength > 8) {
            newBehavior.preferredDelay = Math.min(800, delay * 1.3); // 長搜索偏好更穩定響應
          }
        }

        updateBehavior(newBehavior);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      searchFunction,
      minLength,
      maxLength,
      delay,
      userBehaviorAnalysis,
      updateBehavior,
    ]
  );

  // 防抖搜索
  const debouncedSearch = useCallback(
    (term: string) => {
      // 清除之前的定時器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 立即搜索（如果配置了 leading）
      if (leading && term.length >= minLength) {
        performSearch(term);
        return;
      }

      // 計算自適應延遲
      const adaptiveDelay = calculateAdaptiveDelay(term);

      // 設置防抖定時器
      timeoutRef.current = setTimeout(() => {
        if (trailing) {
          performSearch(term);
        }
      }, adaptiveDelay);

      // 立即執行（如果配置了 immediate）
      if (immediate && term.length >= minLength) {
        performSearch(term);
      }
    },
    [
      performSearch,
      calculateAdaptiveDelay,
      leading,
      trailing,
      immediate,
      minLength,
    ]
  );

  // 搜索詞設置
  const setSearchTerm = useCallback(
    (term: string) => {
      setSearchTermState(term);

      if (term.length === 0) {
        setDebouncedTerm('');
        setResults([]);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        return;
      }

      debouncedSearch(term);
    },
    [debouncedSearch]
  );

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [setSearchTerm]);

  // 更新防抖詞
  useEffect(() => {
    setDebouncedTerm(searchTerm);
  }, [searchTerm]);

  // 清理定時器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    searchTerm,
    debouncedTerm,
    isLoading,
    results,
    behavior,
    setSearchTerm,
    clearSearch,
    updateBehavior,
  };
}

export default useDebouncedSearch;
