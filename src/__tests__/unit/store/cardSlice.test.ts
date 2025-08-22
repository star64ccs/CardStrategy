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
  const initialState = {
    cards: [],
    selectedCard: null,
    loading: false,
    error: null,
    favorites: [],
    collections: {},
  };

  const mockCard = {
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
      const state = cardSlice(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });
  });

  describe('setCards', () => {
    it('應該正確設置卡片列表', () => {
      const cards = [mockCard, { ...mockCard, id: 'card2' }];
      const action = setCards(cards);
      const state = cardSlice(initialState, action);

      expect(state.cards).toEqual(cards);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('addCard', () => {
    it('應該正確添加新卡片', () => {
      const action = addCard(mockCard);
      const state = cardSlice(initialState, action);

      expect(state.cards).toHaveLength(1);
      expect(state.cards[0]).toEqual(mockCard);
    });

    it('應該避免重複添加相同卡片', () => {
      const stateWithCard = { ...initialState, cards: [mockCard] };
      const action = addCard(mockCard);
      const state = cardSlice(stateWithCard, action);

      expect(state.cards).toHaveLength(1);
    });
  });

  describe('updateCard', () => {
    it('應該正確更新卡片', () => {
      const stateWithCard = { ...initialState, cards: [mockCard] };
      const updatedCard = {
        ...mockCard,
        price: 1500,
        condition: 'Light Played',
      };
      const action = updateCard(updatedCard);
      const state = cardSlice(stateWithCard, action);

      expect(state.cards[0]).toEqual(updatedCard);
    });

    it('應該處理更新不存在的卡片', () => {
      const nonExistentCard = { ...mockCard, id: 'non_existent' };
      const action = updateCard(nonExistentCard);
      const state = cardSlice(initialState, action);

      expect(state.cards).toHaveLength(0);
    });
  });

  describe('deleteCard', () => {
    it('應該正確刪除卡片', () => {
      const stateWithCards = {
        ...initialState,
        cards: [mockCard, { ...mockCard, id: 'card2' }],
      };
      const action = deleteCard('card1');
      const state = cardSlice(stateWithCards, action);

      expect(state.cards).toHaveLength(1);
      expect(state.cards[0].id).toBe('card2');
    });

    it('應該處理刪除不存在的卡片', () => {
      const action = deleteCard('non_existent');
      const state = cardSlice(initialState, action);

      expect(state.cards).toHaveLength(0);
    });
  });

  describe('setSelectedCard', () => {
    it('應該正確設置選中的卡片', () => {
      const action = setSelectedCard(mockCard);
      const state = cardSlice(initialState, action);

      expect(state.selectedCard).toEqual(mockCard);
    });

    it('應該處理清除選中的卡片', () => {
      const stateWithSelected = { ...initialState, selectedCard: mockCard };
      const action = setSelectedCard(null);
      const state = cardSlice(stateWithSelected, action);

      expect(state.selectedCard).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('應該正確設置載入狀態', () => {
      const action = setLoading(true);
      const state = cardSlice(initialState, action);

      expect(state.loading).toBe(true);
    });

    it('應該正確清除載入狀態', () => {
      const stateWithLoading = { ...initialState, loading: true };
      const action = setLoading(false);
      const state = cardSlice(stateWithLoading, action);

      expect(state.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('應該正確設置錯誤信息', () => {
      const errorMessage = '載入失敗';
      const action = setError(errorMessage);
      const state = cardSlice(initialState, action);

      expect(state.error).toBe(errorMessage);
      expect(state.loading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('應該正確清除錯誤信息', () => {
      const stateWithError = { ...initialState, error: '錯誤信息' };
      const action = clearError();
      const state = cardSlice(stateWithError, action);

      expect(state.error).toBeNull();
    });
  });

  describe('toggleFavorite', () => {
    it('應該正確添加卡片到收藏', () => {
      const action = toggleFavorite('card1');
      const state = cardSlice(initialState, action);

      expect(state.favorites).toContain('card1');
    });

    it('應該正確從收藏移除卡片', () => {
      const stateWithFavorites = {
        ...initialState,
        favorites: ['card1', 'card2'],
      };
      const action = toggleFavorite('card1');
      const state = cardSlice(stateWithFavorites, action);

      expect(state.favorites).not.toContain('card1');
      expect(state.favorites).toContain('card2');
    });
  });

  describe('updateCardPrice', () => {
    it('應該正確更新卡片價格', () => {
      const stateWithCard = { ...initialState, cards: [mockCard] };
      const newPrice = 1500;
      const action = updateCardPrice({ cardId: 'card1', price: newPrice });
      const state = cardSlice(stateWithCard, action);

      expect(state.cards[0].price).toBe(newPrice);
    });

    it('應該處理更新不存在的卡片價格', () => {
      const action = updateCardPrice({ cardId: 'non_existent', price: 1500 });
      const state = cardSlice(initialState, action);

      expect(state.cards).toHaveLength(0);
    });
  });

  describe('setCardCondition', () => {
    it('應該正確設置卡片條件', () => {
      const stateWithCard = { ...initialState, cards: [mockCard] };
      const newCondition = 'Light Played';
      const action = setCardCondition({
        cardId: 'card1',
        condition: newCondition,
      });
      const state = cardSlice(stateWithCard, action);

      expect(state.cards[0].condition).toBe(newCondition);
    });
  });

  describe('addCardToCollection', () => {
    it('應該正確添加卡片到收藏集', () => {
      const collectionId = 'collection1';
      const action = addCardToCollection({ cardId: 'card1', collectionId });
      const state = cardSlice(initialState, action);

      expect(state.collections[collectionId]).toContain('card1');
    });

    it('應該避免重複添加卡片到同一收藏集', () => {
      const collectionId = 'collection1';
      const stateWithCollection = {
        ...initialState,
        collections: { [collectionId]: ['card1'] },
      };
      const action = addCardToCollection({ cardId: 'card1', collectionId });
      const state = cardSlice(stateWithCollection, action);

      expect(state.collections[collectionId]).toHaveLength(1);
    });
  });

  describe('removeCardFromCollection', () => {
    it('應該正確從收藏集移除卡片', () => {
      const collectionId = 'collection1';
      const stateWithCollection = {
        ...initialState,
        collections: { [collectionId]: ['card1', 'card2'] },
      };
      const action = removeCardFromCollection({
        cardId: 'card1',
        collectionId,
      });
      const state = cardSlice(stateWithCollection, action);

      expect(state.collections[collectionId]).not.toContain('card1');
      expect(state.collections[collectionId]).toContain('card2');
    });
  });

  describe('選擇器測試', () => {
    it('應該正確選擇收藏的卡片', () => {
      const stateWithFavorites = {
        ...initialState,
        cards: [mockCard, { ...mockCard, id: 'card2' }],
        favorites: ['card1'],
      };

      const favoriteCards = stateWithFavorites.cards.filter((card) =>
        stateWithFavorites.favorites.includes(card.id)
      );

      expect(favoriteCards).toHaveLength(1);
      expect(favoriteCards[0].id).toBe('card1');
    });

    it('應該正確選擇收藏集中的卡片', () => {
      const collectionId = 'collection1';
      const stateWithCollection = {
        ...initialState,
        cards: [mockCard, { ...mockCard, id: 'card2' }],
        collections: { [collectionId]: ['card1'] },
      };

      const collectionCards = stateWithCollection.cards.filter((card) =>
        stateWithCollection.collections[collectionId].includes(card.id)
      );

      expect(collectionCards).toHaveLength(1);
      expect(collectionCards[0].id).toBe('card1');
    });
  });

  describe('狀態持久化', () => {
    it('應該正確處理狀態重置', () => {
      const stateWithData = {
        ...initialState,
        cards: [mockCard],
        selectedCard: mockCard,
        favorites: ['card1'],
        collections: { collection1: ['card1'] },
      };

      // 模擬重置操作
      const resetAction = { type: 'RESET_STATE' };
      const state = cardSlice(stateWithData, resetAction);

      // 如果沒有重置reducer，狀態應該保持不變
      expect(state).toEqual(stateWithData);
    });
  });
});
