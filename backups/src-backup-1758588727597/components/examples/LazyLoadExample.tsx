// 懶加載示例組件
import React, { useState } from 'react';

import {
  useLazyComponentSimple,
  useLazyDataSimple,
  useLazyImageSimple,
} from '../../hooks/useLazyLoad';
import { LazyLoadPriority, LazyLoadStrategy } from '../../types/lazyLoading';
import { LazyComponent, LazyData, LazyImage } from '../ui/LazyLoadComponent';

// 示例組件
const ExampleComponent: React.FC<{ title: string; content: string }> = ({
  title,
  content,
}) => (
  <div
    style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      margin: '10px 0',
    }}
  >
    <h3>{title}</h3>
    <p>{content}</p>
  </div>
);

// 自定義加載組件
const CustomLoadingComponent: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px',
      backgroundColor: '#e3f2fd',
      border: '2px dashed #2196f3',
      borderRadius: '8px',
      margin: '10px 0',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '30px',
          height: '30px',
          border: '3px solid #e3f2fd',
          borderTop: '3px solid #2196f3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 10px',
        }}
      />
      <div style={{ color: '#2196f3', fontWeight: 'bold' }}>加載中...</div>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// 自定義錯誤組件
const CustomErrorComponent: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div
    style={{
      padding: '20px',
      backgroundColor: '#ffebee',
      border: '1px solid #f44336',
      borderRadius: '8px',
      margin: '10px 0',
      textAlign: 'center',
    }}
  >
    <div style={{ color: '#d32f2f', fontSize: '18px', marginBottom: '10px' }}>
      ❌ 加載失敗
    </div>
    <div style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
      {error.message}
    </div>
    <button
      onClick={retry}
      style={{
        padding: '10px 20px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      重新加載
    </button>
  </div>
);

// 模擬數據加載函數
const _mockDataLoader = async (): Promise<any[]> => {
  // 模擬網絡延遲
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 模擬隨機錯誤
  if (Math.random() < 0.3) {
    throw new Error('模擬的網絡錯誤');
  }

  return [
    { id: 1, name: '項目 1', description: '這是第一個項目的描述' },
    { id: 2, name: '項目 2', description: '這是第二個項目的描述' },
    { id: 3, name: '項目 3', description: '這是第三個項目的描述' },
    { id: 4, name: '項目 4', description: '這是第四個項目的描述' },
    { id: 5, name: '項目 5', description: '這是第五個項目的描述' },
  ];
};

// 模擬組件加載函數
const _mockComponentLoader = async (): Promise<React.ComponentType<any>> => {
  // 模擬網絡延遲
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 模擬隨機錯誤
  if (Math.random() < 0.2) {
    throw new Error('模擬的組件加載錯誤');
  }

  return ExampleComponent;
};

/**
 * 懶加載示例組件
 */
export const LazyLoadExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'component' | 'image' | 'data' | 'hook'
  >('component');
  const [showPerformance, setShowPerformance] = useState(false);

  // Hook 示例
  const _componentHook = useLazyComponentSimple('./ExampleComponent', {
    strategy: LazyLoadStrategy.MANUAL,
    priority: LazyLoadPriority.HIGH,
  });

  const _imageHook = useLazyImageSimple('https://picsum.photos/400/300', {
    strategy: LazyLoadStrategy.INTERSECTION_OBSERVER,
    priority: LazyLoadPriority.NORMAL,
  });

  const _dataHook = useLazyDataSimple(_mockDataLoader, {
    strategy: LazyLoadStrategy.MANUAL,
    priority: LazyLoadPriority.NORMAL,
  });

  const _tabs = [
    { id: 'component', label: '組件懶加載' },
    { id: 'image', label: '圖片懶加載' },
    { id: 'data', label: '數據懶加載' },
    { id: 'hook', label: 'Hook 示例' },
  ] as const;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        懶加載功能示例
      </h1>

      {/* 性能監控切換 */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          <input
            type='checkbox'
            checked={showPerformance}
            onChange={e => setShowPerformance(e.target.checked)}
          />
          顯示性能監控
        </label>
      </div>

      {/* 標籤頁 */}
      <div style={{ marginBottom: '20px' }}>
        {_tabs.map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              margin: '0 5px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.id ? '#007bff' : '#f8f9fa',
              color: activeTab === tab.id ? 'white' : '#333',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 內容區域 */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'component' && (
          <div>
            <h2>組件懶加載示例</h2>
            <p>以下組件會在滾動到可視區域時自動加載：</p>

            {/* 使用組件方式 */}
            <div style={{ marginBottom: '30px' }}>
              <h3>使用 LazyComponent 組件</h3>
              <LazyComponent
                path='./ExampleComponent'
                componentProps={{
                  title: '動態加載的組件',
                  content:
                    '這個組件是通過懶加載方式加載的，只有在滾動到可視區域時才會開始加載。',
                }}
                loadingComponent={CustomLoadingComponent}
                errorComponent={CustomErrorComponent}
                strategy={LazyLoadStrategy.INTERSECTION_OBSERVER}
                priority='high'
                preloadDistance={200}
                onBeforeLoad={() => console.log('開始加載組件')}
                onLoadSuccess={() => console.log('組件加載成功')}
                onLoadError={error => console.log('組件加載失敗:', error)}
                onLoadComplete={() => console.log('組件加載完成')}
              />
            </div>

            {/* 使用 Hook 方式 */}
            <div style={{ marginBottom: '30px' }}>
              <h3>使用 useLazyComponent Hook</h3>
              <div>
                <button
                  onClick={() => _componentHook.load()}
                  disabled={_componentHook.isLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: _componentHook.isLoading
                      ? 'not-allowed'
                      : 'pointer',
                    marginBottom: '10px',
                  }}
                >
                  {_componentHook.isLoading ? '加載中...' : '手動加載組件'}
                </button>

                {_componentHook.isLoading && <CustomLoadingComponent />}
                {_componentHook.hasError && _componentHook.state.error && (
                  <CustomErrorComponent
                    error={_componentHook.state.error}
                    retry={_componentHook.retry}
                  />
                )}
                {_componentHook.isLoaded && _componentHook.state.component && (
                  <div>
                    <h4>Hook 加載的組件：</h4>
                    <_componentHook.state.component
                      title='Hook 加載的組件'
                      content='這個組件是通過 useLazyComponent Hook 加載的。'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div>
            <h2>圖片懶加載示例</h2>
            <p>以下圖片會在滾動到可視區域時自動加載：</p>

            {/* 使用組件方式 */}
            <div style={{ marginBottom: '30px' }}>
              <h3>使用 LazyImage 組件</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                }}
              >
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <LazyImage
                    key={i}
                    src={`https://picsum.photos/400/300?random=${i}`}
                    alt={`示例圖片 ${i}`}
                    style={{ width: '100%' }}
                    loadingComponent={CustomLoadingComponent}
                    errorComponent={CustomErrorComponent}
                    strategy={LazyLoadStrategy.INTERSECTION_OBSERVER}
                    priority='normal'
                    preloadDistance={100}
                    quality='medium'
                    onBeforeLoad={() => console.log(`開始加載圖片 ${i}`)}
                    onLoadSuccess={() => console.log(`圖片 ${i} 加載成功`)}
                    onLoadError={error =>
                      console.log(`圖片 ${i} 加載失敗:`, error)
                    }
                    onLoadComplete={() => console.log(`圖片 ${i} 加載完成`)}
                  />
                ))}
              </div>
            </div>

            {/* 使用 Hook 方式 */}
            <div style={{ marginBottom: '30px' }}>
              <h3>使用 useLazyImage Hook</h3>
              <div>
                <button
                  onClick={() => imageHook.load()}
                  disabled={imageHook.isLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: imageHook.isLoading ? 'not-allowed' : 'pointer',
                    marginBottom: '10px',
                  }}
                >
                  {imageHook.isLoading ? '加載中...' : '手動加載圖片'}
                </button>

                {imageHook.isLoading && <CustomLoadingComponent />}
                {imageHook.hasError && imageHook.state.error && (
                  <CustomErrorComponent
                    error={imageHook.state.error}
                    retry={imageHook.retry}
                  />
                )}
                {imageHook.isLoaded && imageHook.state.currentSrc && (
                  <div>
                    <h4>Hook 加載的圖片：</h4>
                    <img
                      src={imageHook.state.currentSrc}
                      alt='Hook 加載的圖片'
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div>
            <h2>數據懶加載示例</h2>
            <p>以下數據會在點擊按鈕時加載：</p>

            {/* 使用組件方式 */}
            <div style={{ marginBottom: '30px' }}>
              <h3>使用 LazyData 組件</h3>
              <LazyData
                loader={mockDataLoader}
                strategy={LazyLoadStrategy.MANUAL}
                priority='normal'
                loadingComponent={CustomLoadingComponent}
                errorComponent={CustomErrorComponent}
                onBeforeLoad={() => console.log('開始加載數據')}
                onLoadSuccess={data => console.log('數據加載成功:', data)}
                onLoadError={error => console.log('數據加載失敗:', error)}
                onLoadComplete={() => console.log('數據加載完成')}
              >
                {(data, state) => (
                  <div>
                    {data && (
                      <div>
                        <h4>加載的數據：</h4>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {data.map((item: unknown) => (
                            <div
                              key={item.id}
                              style={{
                                padding: '15px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#f9f9f9',
                              }}
                            >
                              <h5>{item.name}</h5>
                              <p>{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </LazyData>
            </div>

            {/* 使用 Hook 方式 */}
            <div style={{ marginBottom: '30px' }}>
              <h3>使用 useLazyData Hook</h3>
              <div>
                <button
                  onClick={() => dataHook.load()}
                  disabled={dataHook.isLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: dataHook.isLoading ? 'not-allowed' : 'pointer',
                    marginBottom: '10px',
                  }}
                >
                  {dataHook.isLoading ? '加載中...' : '手動加載數據'}
                </button>

                {dataHook.isLoading && <CustomLoadingComponent />}
                {dataHook.hasError && dataHook.state.error && (
                  <CustomErrorComponent
                    error={dataHook.state.error}
                    retry={dataHook.retry}
                  />
                )}
                {dataHook.isLoaded && dataHook.state.data && (
                  <div>
                    <h4>Hook 加載的數據：</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {dataHook.state.data.map((item: unknown) => (
                        <div
                          key={item.id}
                          style={{
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#f9f9f9',
                          }}
                        >
                          <h5>{item.name}</h5>
                          <p>{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hook' && (
          <div>
            <h2>Hook 使用示例</h2>
            <p>展示如何使用各種懶加載 Hook：</p>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* 組件 Hook */}
              <div
                style={{
                  border: '1px solid #ddd',
                  padding: '20px',
                  borderRadius: '8px',
                }}
              >
                <h3>useLazyComponentSimple</h3>
                <div>
                  <button
                    onClick={() => componentHook.load()}
                    disabled={componentHook.isLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: componentHook.isLoading
                        ? 'not-allowed'
                        : 'pointer',
                      marginBottom: '10px',
                    }}
                  >
                    {componentHook.isLoading ? '加載中...' : '加載組件'}
                  </button>

                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <div>狀態: {componentHook.state.status}</div>
                    <div>
                      加載時間:{' '}
                      {componentHook.state.loadDuration
                        ? `${componentHook.state.loadDuration}ms`
                        : 'N/A'}
                    </div>
                    <div>重試次數: {componentHook.state.retryAttempts}</div>
                  </div>
                </div>
              </div>

              {/* 圖片 Hook */}
              <div
                style={{
                  border: '1px solid #ddd',
                  padding: '20px',
                  borderRadius: '8px',
                }}
              >
                <h3>useLazyImageSimple</h3>
                <div>
                  <button
                    onClick={() => imageHook.load()}
                    disabled={imageHook.isLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: imageHook.isLoading ? 'not-allowed' : 'pointer',
                      marginBottom: '10px',
                    }}
                  >
                    {imageHook.isLoading ? '加載中...' : '加載圖片'}
                  </button>

                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <div>狀態: {imageHook.state.status}</div>
                    <div>
                      加載時間:{' '}
                      {imageHook.state.loadDuration
                        ? `${imageHook.state.loadDuration}ms`
                        : 'N/A'}
                    </div>
                    <div>重試次數: {imageHook.state.retryAttempts}</div>
                  </div>
                </div>
              </div>

              {/* 數據 Hook */}
              <div
                style={{
                  border: '1px solid #ddd',
                  padding: '20px',
                  borderRadius: '8px',
                }}
              >
                <h3>useLazyDataSimple</h3>
                <div>
                  <button
                    onClick={() => dataHook.load()}
                    disabled={dataHook.isLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: dataHook.isLoading ? 'not-allowed' : 'pointer',
                      marginBottom: '10px',
                    }}
                  >
                    {dataHook.isLoading ? '加載中...' : '加載數據'}
                  </button>

                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <div>狀態: {dataHook.state.status}</div>
                    <div>
                      加載時間:{' '}
                      {dataHook.state.loadDuration
                        ? `${dataHook.state.loadDuration}ms`
                        : 'N/A'}
                    </div>
                    <div>重試次數: {dataHook.state.retryAttempts}</div>
                    <div>
                      數據條數:{' '}
                      {dataHook.state.data ? dataHook.state.data.length : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 性能監控 */}
      {showPerformance && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h3>性能監控</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
            }}
          >
            <div>
              <strong>組件 Hook:</strong>
              <div>狀態: {componentHook.state.status}</div>
              <div>
                加載時間:{' '}
                {componentHook.state.loadDuration
                  ? `${componentHook.state.loadDuration}ms`
                  : 'N/A'}
              </div>
            </div>
            <div>
              <strong>圖片 Hook:</strong>
              <div>狀態: {imageHook.state.status}</div>
              <div>
                加載時間:{' '}
                {imageHook.state.loadDuration
                  ? `${imageHook.state.loadDuration}ms`
                  : 'N/A'}
              </div>
            </div>
            <div>
              <strong>數據 Hook:</strong>
              <div>狀態: {dataHook.state.status}</div>
              <div>
                加載時間:{' '}
                {dataHook.state.loadDuration
                  ? `${dataHook.state.loadDuration}ms`
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用說明 */}
      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
        }}
      >
        <h3>使用說明</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li>
            <strong>組件懶加載:</strong> 使用 LazyComponent 或 useLazyComponent
            來動態加載 React 組件
          </li>
          <li>
            <strong>圖片懶加載:</strong> 使用 LazyImage 或 useLazyImage
            來優化圖片加載性能
          </li>
          <li>
            <strong>數據懶加載:</strong> 使用 LazyData 或 useLazyData
            來按需加載數據
          </li>
          <li>
            <strong>策略選擇:</strong> 支持
            INTERSECTION_OBSERVER、SCROLL_EVENT、MANUAL、IMMEDIATE 等加載策略
          </li>
          <li>
            <strong>優先級控制:</strong> 支持 LOW、NORMAL、HIGH、CRITICAL
            四種優先級
          </li>
          <li>
            <strong>緩存機制:</strong> 自動緩存已加載的資源，提升重複訪問性能
          </li>
          <li>
            <strong>錯誤處理:</strong> 提供完整的錯誤處理和重試機制
          </li>
        </ul>
      </div>
    </div>
  );
};
