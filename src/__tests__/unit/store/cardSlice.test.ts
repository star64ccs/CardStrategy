/* global jest, describe, it, expect, beforeEach, afterEach */
import cardSlice, {
  setCards,
  addCard,
  updateCard,
  deleteCard,
  setSelectedCard,
  setLoading,
  setError,
  clearError,
  toggleFavorite,
  updateCardPrice,
  setCardCondition,
  addCardToCollection,
  removeCardFromCollection,
} from '../../../store/slices/cardSlice';

describe('CardSlice', () => {
  const _initialState = {
    cards: [],
    selectedCard: null,
    loading: false,
    error: null,
    favorites: [],
    collections: {},
  };

  const _mockCard = {
    id: 'card1',
    name: '測試卡片',
    image: 'test.jpg',
    rarity: 'Rare',
    price: 1000,
    condition: 'Near Mint',
  };

  beforeEach(() => {
    // 重置狀態
    jest.clearAllMocks();
  });

  describe('初始狀態', () => {
    it('應該返回正確的初始狀態', () => {
      const _state = cardSlice(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });
  });

  describe('setCards', () => {
    it('應該正確設置卡片列表', () => {
      const _cards = [mockCard, { ...mockCard, id: 'card2' }];
      const _action = setCards(cards);
      const _state = cardSlice(initialState, action);

      expect(state.cards).toEqual(cards);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('addCard', () => {
    it('應該正確添加新卡片', () => {
      const _action = addCard(mockCard);
      const _state = cardSlice(initialState, action);

      expect(state.cards).toHaveLength(1);
      expect(state.cards[0]).toEqual(mockCard);
    });

    it('應該避免重複添加相同卡片', () => {
      const _stateWithCard = { ...initialState, cards: [mockCard] };
      const _action = addCard(mockCard);
      const _state = cardSlice(stateWithCard, action);

      expect(state.cards).toHaveLength(1);
    });
  });

  describe('updateCard', () => {
    it('應該正確更新卡片', () => {
      const _stateWithCard = { ...initialState, cards: [mockCard] };
      const _updatedCard = {
        ...mockCard,
        price: 1500,
        condition: 'Light Played',
      };
      const _action = updateCard(updatedCard);
      const _state = cardSlice(stateWithCard, action);

      expect(state.cards[0]).toEqual(updatedCard);
    });

    it('應該處理更新不存在的卡片', () => {
      const _nonExistentCard = { ...mockCard, id: 'non_existent' };
      const _action = updateCard(nonExistentCard);
      const _state = cardSlice(initialState, action);

      expect(state.cards).toHaveLength(0);
    });
  });

  describe('deleteCard', () => {
    it('應該正確刪除卡片', () => {
      const _stateWithCards = {
        ...initialState,
        cards: [mockCard, { ...mockCard, id: 'card2' }],
      };
      const _action = deleteCard('card1');
      const _state = cardSlice(stateWithCards, action);

      expect(state.cards).toHaveLength(1);
      expect(state.cards[0].id).toBe('card2');
    });

    it('應該處理刪除不存在的卡片', () => {
      const _action = deleteCard('non_existent');
      const _state = cardSlice(initialState, action);

      expect(state.cards).toHaveLength(0);
    });
  });

  describe('setSelectedCard', () => {
    it('應該正確設置選中的卡片', () => {
      const _action = setSelectedCard(mockCard);
      const _state = cardSlice(initialState, action);

      expect(state.selectedCard).toEqual(mockCard);
    });

    it('應該處理清除選中的卡片', () => {
      const _stateWithSelected = { ...initialState, selectedCard: mockCard };
      const _action = setSelectedCard(null);
      const _state = cardSlice(stateWithSelected, action);

      expect(state.selectedCard).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('應該正確設置載入狀態', () => {
      const _action = setLoading(true);
      const _state = cardSlice(initialState, action);

      expect(state.loading).toBe(true);
    });

    it('應該正確清除載入狀態', () => {
      const _stateWithLoading = { ...initialState, loading: true };
      const _action = setLoading(false);
      const _state = cardSlice(stateWithLoading, action);

      expect(state.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('應該正確設置錯誤信息', () => {
      const _errorMessage = '載入失敗';
      const _action = setError(errorMessage);
      const _state = cardSlice(initialState, action);

      expect(state.error).toBe(errorMessage);
      expect(state.loading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('應該正確清除錯誤信息', () => {
      const _stateWithError = { ...initialState, error: '錯誤信息' };
      const _action = clearError();
      const _state = cardSlice(stateWithError, action);

      expect(state.error).toBeNull();
    });
  });

  describe('toggleFavorite', () => {
    it('應該正確添加卡片到收藏', () => {
      const _action = toggleFavorite('card1');
      const _state = cardSlice(initialState, action);

      expect(state.favorites).toContain('card1');
    });

    it('應該正確從收藏移除卡片', () => {
      const _stateWithFavorites = {
        ...initialState,
        favorites: ['card1', 'card2'],
      };
      const _action = toggleFavorite('card1');
      const _state = cardSlice(stateWithFavorites, action);

      expect(state.favorites).not.toContain('card1');
      expect(state.favorites).toContain('card2');
    });
  });

  describe('updateCardPrice', () => {
    it('應該正確更新卡片價格', () => {
      const _stateWithCard = { ...initialState, cards: [mockCard] };
      const _newPrice = 1500;
      const _action = updateCardPrice({ cardId: 'card1', price: newPrice });
      const _state = cardSlice(stateWithCard, action);

      expect(state.cards[0].price).toBe(newPrice);
    });

    it('應該處理更新不存在的卡片價格', () => {
      const _action = updateCardPrice({ cardId: 'non_existent', price: 1500 });
      const _state = cardSlice(initialState, action);

      expect(state.cards).toHaveLength(0);
    });
  });

  describe('setCardCondition', () => {
    it('應該正確設置卡片條件', () => {
      const _stateWithCard = { ...initialState, cards: [mockCard] };
      const _newCondition = 'Light Played';
      const _action = setCardCondition({
        cardId: 'card1',
        condition: newCondition,
      });
      const _state = cardSlice(stateWithCard, action);

      expect(state.cards[0].condition).toBe(newCondition);
    });
  });

  describe('addCardToCollection', () => {
    it('應該正確添加卡片到收藏集', () => {
      const _collectionId = 'collection1';
      const _action = addCardToCollection({ cardId: 'card1', collectionId });
      const _state = cardSlice(initialState, action);

      expect(state.collections[collectionId]).toContain('card1');
    });

    it('應該避免重複添加卡片到同一收藏集', () => {
      const _collectionId = 'collection1';
      const _stateWithCollection = {
        ...initialState,
        collections: { [collectionId]: ['card1'] },
      };
      const _action = addCardToCollection({ cardId: 'card1', collectionId });
      const _state = cardSlice(stateWithCollection, action);

      expect(state.collections[collectionId]).toHaveLength(1);
    });
  });

  describe('removeCardFromCollection', () => {
    it('應該正確從收藏集移除卡片', () => {
      const _collectionId = 'collection1';
      const _stateWithCollection = {
        ...initialState,
        collections: { [collectionId]: ['card1', 'card2'] },
      };
      const _action = removeCardFromCollection({
        cardId: 'card1',
        collectionId,
      });
      const _state = cardSlice(stateWithCollection, action);

      expect(state.collections[collectionId]).not.toContain('card1');
      expect(state.collections[collectionId]).toContain('card2');
    });
  });

  describe('選擇器測試', () => {
    it('應該正確選擇收藏的卡片', () => {
      const _stateWithFavorites = {
        ...initialState,
        cards: [mockCard, { ...mockCard, id: 'card2' }],
        favorites: ['card1'],
      };

      const _favoriteCards = stateWithFavorites.cards.filter(card =>
        stateWithFavorites.favorites.includes(card.id)
      );

      expect(favoriteCards).toHaveLength(1);
      expect(favoriteCards[0].id).toBe('card1');
    });

    it('應該正確選擇收藏集中的卡片', () => {
      const _collectionId = 'collection1';
      const _stateWithCollection = {
        ...initialState,
        cards: [mockCard, { ...mockCard, id: 'card2' }],
        collections: { [collectionId]: ['card1'] },
      };

      const _collectionCards = stateWithCollection.cards.filter(card =>
        stateWithCollection.collections[collectionId].includes(card.id)
      );

      expect(collectionCards).toHaveLength(1);
      expect(collectionCards[0].id).toBe('card1');
    });
  });

  describe('狀態持久化', () => {
    it('應該正確處理狀態重置', () => {
      const _stateWithData = {
        ...initialState,
        cards: [mockCard],
        selectedCard: mockCard,
        favorites: ['card1'],
        collections: { collection1: ['card1'] },
      };

      // 模擬重置操作
      const _resetAction = { type: 'RESET_STATE' };
      const _state = cardSlice(stateWithData, resetAction);

      // 如果沒有重置reducer，狀態應該保持不變
      expect(state).toEqual(stateWithData);
    });
  });
});
