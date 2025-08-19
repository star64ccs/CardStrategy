import React from 'react';
import { Card } from '../../services/cardService';

interface CardGridProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ cards, onCardClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return '#27ae60';
    if (change < 0) return '#e74c3c';
    return '#7f8c8d';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '→';
  };

  return (
    <div style={styles.container}>
      {cards.map((card) => (
        <div
          key={card.id}
          style={styles.card}
          onClick={() => onCardClick?.(card)}
        >
          <div style={styles.imageContainer}>
            <img
              src={card.imageUrl}
              alt={card.name}
              style={styles.image}
              onError={(e) => {
                e.currentTarget.src =
                  'https://via.placeholder.com/300x400/ecf0f1/2c3e50?text=No+Image';
              }}
            />
            <div style={styles.rarityBadge}>
              {card.rarity}
            </div>
          </div>

          <div style={styles.content}>
            <h3 style={styles.name}>{card.name}</h3>
            <p style={styles.setName}>{card.setName}</p>
            <p style={styles.type}>{card.type}</p>

            <div style={styles.priceSection}>
              <div style={styles.currentPrice}>
                {formatPrice(card.price.current)}
              </div>
              <div style={styles.priceChanges}>
                <div style={{
                  ...styles.priceChange,
                  color: getPriceChangeColor(card.price.change24h)
                }}>
                  {getPriceChangeIcon(card.price.change24h)}{' '}
                  {formatPrice(Math.abs(card.price.change24h))}
                </div>
                <div style={{
                  ...styles.priceChange,
                  color: getPriceChangeColor(card.price.change7d)
                }}>
                  7d: {getPriceChangeIcon(card.price.change7d)}{' '}
                  {formatPrice(Math.abs(card.price.change7d))}
                </div>
              </div>
            </div>

            {card.stats && (card.stats.attack || card.stats.defense) && (
              <div style={styles.stats}>
                {card.stats.attack && (
                  <div style={styles.stat}>
                    <span style={styles.statLabel}>攻擊:</span>
                    <span style={styles.statValue}>{card.stats.attack}</span>
                  </div>
                )}
                {card.stats.defense && (
                  <div style={styles.stat}>
                    <span style={styles.statLabel}>防禦:</span>
                    <span style={styles.statValue}>{card.stats.defense}</span>
                  </div>
                )}
              </div>
            )}

            <div style={styles.tags}>
              {card.tags.slice(0, 3).map((tag, index) => (
                <span key={index} style={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    padding: '20px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
    }
  },
  imageContainer: {
    position: 'relative' as const,
    height: '200px',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  rarityBadge: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    backgroundColor: '#f39c12',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  content: {
    padding: '16px'
  },
  name: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 8px 0',
    lineHeight: '1.2'
  },
  setName: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: '0 0 4px 0'
  },
  type: {
    fontSize: '14px',
    color: '#3498db',
    margin: '0 0 12px 0',
    fontWeight: '500'
  },
  priceSection: {
    marginBottom: '12px'
  },
  currentPrice: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '4px'
  },
  priceChanges: {
    display: 'flex',
    gap: '12px'
  },
  priceChange: {
    fontSize: '12px',
    fontWeight: '500'
  },
  stats: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px'
  },
  stat: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },
  statLabel: {
    fontSize: '10px',
    color: '#7f8c8d',
    textTransform: 'uppercase' as const
  },
  statValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '4px'
  },
  tag: {
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '500'
  }
};

export default CardGrid;
