import React from 'react';
import { Card } from '../types';

interface CardDetailProps {
  card: Card;
  onClose?: () => void;
  onAddToCollection?: (card: Card) => void;
  onEdit?: (card: Card) => void;
}

const CardDetail: React.FC<CardDetailProps> = ({
  card,
  onClose,
  onAddToCollection,
  onEdit,
}) => {
  const handleAddToCollection = () => {
    onAddToCollection?.(card);
  };

  const handleEdit = () => {
    onEdit?.(card);
  };

  return (
    <div className="card-detail">
      <div className="card-detail-header">
        <h2>卡片詳情</h2>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="card-detail-content">
        <div className="card-detail-image">
          <img src={card.imageUrl} alt={card.name} />
        </div>

        <div className="card-detail-info">
          <h3 className="card-name">{card.name}</h3>

          <div className="card-info-grid">
            <div className="info-item">
              <label>系列:</label>
              <span>{card.setName}</span>
            </div>

            <div className="info-item">
              <label>卡片編號:</label>
              <span>{card.cardNumber}</span>
            </div>

            <div className="info-item">
              <label>稀有度:</label>
              <span className={`rarity-${card.rarity.toLowerCase()}`}>
                {card.rarity}
              </span>
            </div>

            <div className="info-item">
              <label>類型:</label>
              <span>{card.type}</span>
            </div>

            <div className="info-item">
              <label>語言:</label>
              <span>{card.language}</span>
            </div>

            <div className="info-item">
              <label>遊戲:</label>
              <span>{card.game}</span>
            </div>

            <div className="info-item">
              <label>價格:</label>
              <span className="card-price">
                NT$ {card.price.toLocaleString()}
              </span>
            </div>

            <div className="info-item">
              <label>狀態:</label>
              <span className={`condition-${card.condition.toLowerCase()}`}>
                {card.condition}
              </span>
            </div>
          </div>

          <div className="card-detail-actions">
            <button className="btn btn-primary" onClick={handleAddToCollection}>
              加入收藏
            </button>

            <button className="btn btn-secondary" onClick={handleEdit}>
              編輯卡片
            </button>
          </div>
        </div>
      </div>

      <div className="card-detail-footer">
        <p className="card-timestamps">
          建立時間: {new Date(card.createdAt).toLocaleString('zh-TW')}
          <br />
          更新時間: {new Date(card.updatedAt).toLocaleString('zh-TW')}
        </p>
      </div>
    </div>
  );
};

export default CardDetail;
