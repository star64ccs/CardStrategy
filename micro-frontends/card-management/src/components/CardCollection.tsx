import React, { useState } from 'react';
import { CardCollection as CollectionType, Card } from '../types';

interface CardCollectionProps {
  collections?: CollectionType[];
  onCollectionSelect?: (collection: CollectionType) => void;
  onCreateCollection?: () => void;
  onAddCardToCollection?: (collectionId: string, card: Card) => void;
}

const CardCollection: React.FC<CardCollectionProps> = ({
  collections = [],
  onCollectionSelect,
  onCreateCollection,
  onAddCardToCollection
}) => {
  const [selectedCollection, setSelectedCollection] = useState<CollectionType | null>(null);

  const handleCollectionClick = (collection: CollectionType) => {
    setSelectedCollection(collection);
    onCollectionSelect?.(collection);
  };

  const handleCreateCollection = () => {
    onCreateCollection?.();
  };

  return (
    <div className="card-collection">
      <div className="collection-header">
        <h2>我的收藏</h2>
        <button
          className="btn btn-primary"
          onClick={handleCreateCollection}
        >
          建立新收藏
        </button>
      </div>

      <div className="collections-grid">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className={`collection-item ${selectedCollection?.id === collection.id ? 'selected' : ''}`}
            onClick={() => handleCollectionClick(collection)}
          >
            <div className="collection-info">
              <h3>{collection.name}</h3>
              <p>{collection.description}</p>
              <span className="card-count">{collection.cards.length} 張卡片</span>
              <span className={`visibility ${collection.isPublic ? 'public' : 'private'}`}>
                {collection.isPublic ? '公開' : '私人'}
              </span>
            </div>

            {collection.cards.length > 0 && (
              <div className="collection-preview">
                {collection.cards.slice(0, 3).map((card) => (
                  <img
                    key={card.id}
                    src={card.imageUrl}
                    alt={card.name}
                    className="preview-card"
                  />
                ))}
                {collection.cards.length > 3 && (
                  <div className="more-cards">
                    +{collection.cards.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="no-collections">
          <p>您還沒有建立任何收藏</p>
          <button
            className="btn btn-primary"
            onClick={handleCreateCollection}
          >
            建立第一個收藏
          </button>
        </div>
      )}

      {selectedCollection && (
        <div className="selected-collection-detail">
          <h3>{selectedCollection.name}</h3>
          <p>{selectedCollection.description}</p>
          <div className="collection-cards">
            {selectedCollection.cards.map((card) => (
              <div key={card.id} className="collection-card">
                <img src={card.imageUrl} alt={card.name} />
                <span className="card-name">{card.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardCollection;
