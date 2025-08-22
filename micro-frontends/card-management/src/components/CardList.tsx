import React, { useState, useEffect } from 'react';
import { Card, CardFilters } from '../types';

interface CardListProps {
  cards?: Card[];
  filters?: CardFilters;
  onCardSelect?: (card: Card) => void;
  onFiltersChange?: (filters: CardFilters) => void;
  loading?: boolean;
}

const CardList: React.FC<CardListProps> = ({
  cards = [],
  filters = {},
  onCardSelect,
  onFiltersChange,
  loading = false,
}) => {
  const [filteredCards, setFilteredCards] = useState<Card[]>(cards);

  useEffect(() => {
    let result = cards;

    // Apply search filter
    if (filters.search) {
      result = result.filter(
        (card) =>
          card.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          card.setName.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    // Apply game filter
    if (filters.game) {
      result = result.filter((card) => card.game === filters.game);
    }

    // Apply rarity filter
    if (filters.rarity) {
      result = result.filter((card) => card.rarity === filters.rarity);
    }

    // Apply price filters
    if (filters.priceMin !== undefined) {
      result = result.filter((card) => card.price >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      result = result.filter((card) => card.price <= filters.priceMax!);
    }

    setFilteredCards(result);
  }, [cards, filters]);

  const handleCardClick = (card: Card) => {
    onCardSelect?.(card);
  };

  if (loading) {
    return (
      <div className="card-list-loading">
        <div className="loading-spinner">載入中...</div>
      </div>
    );
  }

  return (
    <div className="card-list">
      <div className="card-list-header">
        <h2>卡片列表</h2>
        <span className="card-count">共 {filteredCards.length} 張卡片</span>
      </div>

      <div className="card-grid">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className="card-item"
            onClick={() => handleCardClick(card)}
          >
            <div className="card-image">
              <img src={card.imageUrl} alt={card.name} />
            </div>
            <div className="card-info">
              <h3 className="card-name">{card.name}</h3>
              <p className="card-set">{card.setName}</p>
              <p className="card-rarity">{card.rarity}</p>
              <p className="card-price">NT$ {card.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && !loading && (
        <div className="no-cards">
          <p>沒有找到符合條件的卡片</p>
        </div>
      )}
    </div>
  );
};

export default CardList;
