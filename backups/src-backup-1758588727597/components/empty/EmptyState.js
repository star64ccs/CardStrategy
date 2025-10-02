import React from 'react';

const EmptyState = ({ 
  icon = '📭', 
  title = '暫無數據', 
  description = '這裡還沒有任何內容',
  action,
  actionText = '開始使用',
  className 
}) => (
  <div 
    className={`empty-state ${className || ''}`}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      color: '#666'
    }}
  >
    <div 
      style={{
        fontSize: '64px',
        marginBottom: '24px',
        opacity: 0.6
      }}
    >
      {icon}
    </div>
    <h3 
      style={{
        margin: '0 0 12px 0',
        fontSize: '20px',
        fontWeight: '500',
        color: '#333'
      }}
    >
      {title}
    </h3>
    <p 
      style={{
        margin: '0 0 24px 0',
        fontSize: '14px',
        lineHeight: '1.5',
        maxWidth: '400px'
      }}
    >
      {description}
    </p>
    {action && (
      <button 
        onClick={action}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
      >
        {actionText}
      </button>
    )}
  </div>
);

const EmptySearchResults = ({ searchTerm, onClearSearch, className }) => (
  <EmptyState
    icon="🔍"
    title="沒有找到相關結果"
    description={`沒有找到與 "${searchTerm}" 相關的內容。請嘗試其他關鍵詞。`}
    action={onClearSearch}
    actionText="清除搜索"
    className={className}
  />
);

const EmptyCollection = ({ type = '卡片', onAdd, className }) => (
  <EmptyState
    icon="📚"
    title={`暫無${type}`}
    description={`您還沒有添加任何${type}。開始建立您的收藏吧！`}
    action={onAdd}
    actionText={`添加${type}`}
    className={className}
  />
);

const EmptyFavorites = ({ onBrowse, className }) => (
  <EmptyState
    icon="❤️"
    title="暫無收藏"
    description="您還沒有收藏任何卡片。瀏覽並收藏您喜歡的卡片吧！"
    action={onBrowse}
    actionText="瀏覽卡片"
    className={className}
  />
);

const EmptyNotifications = ({ className }) => (
  <EmptyState
    icon="🔔"
    title="暫無通知"
    description="您目前沒有未讀通知。有新消息時會在這裡顯示。"
    className={className}
  />
);

export { 
  EmptyState, 
  EmptySearchResults, 
  EmptyCollection, 
  EmptyFavorites, 
  EmptyNotifications 
};