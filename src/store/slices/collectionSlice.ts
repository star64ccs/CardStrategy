import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Collection, CollectionState, CollectionItem } from '@/types';
import { collectionService } from '@/services/collectionService';

// 異步 thunk
export const fetchCollections = createAsyncThunk(
  'collection/fetchCollections',
  async () => {
    const response = await collectionService.getCollections();
    return response;
  }
);

export const createCollection = createAsyncThunk(
  'collection/createCollection',
  async (collectionData: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => {
    const response = await collectionService.createCollection(collectionData);
    return response;
  }
);

export const updateCollection = createAsyncThunk(
  'collection/updateCollection',
  async ({
    collectionId,
    data,
  }: {
    collectionId: string;
    data: Partial<Collection>;
  }) => {
    const response = await collectionService.updateCollection(
      collectionId,
      data
    );
    return response;
  }
);

export const deleteCollection = createAsyncThunk(
  'collection/deleteCollection',
  async (collectionId: string) => {
    await collectionService.deleteCollection(collectionId);
    return collectionId;
  }
);

export const addCardToCollection = createAsyncThunk(
  'collection/addCardToCollection',
  async ({
    collectionId,
    cardData,
  }: {
    collectionId: string;
    cardData: {
      cardId: string;
      quantity: number;
      condition: string;
      isFoil: boolean;
      purchasePrice?: number;
      notes?: string;
    };
  }) => {
    const response = await collectionService.addCardToCollection(
      collectionId,
      cardData
    );
    return { ...response, collectionId };
  }
);

export const removeCardFromCollection = createAsyncThunk(
  'collection/removeCardFromCollection',
  async ({
    collectionId,
    cardId,
  }: {
    collectionId: string;
    cardId: string;
  }) => {
    await collectionService.removeCardFromCollection(collectionId, cardId);
    return { collectionId, cardId };
  }
);

export const updateCardInCollection = createAsyncThunk(
  'collection/updateCardInCollection',
  async ({
    collectionId,
    cardId,
    data,
  }: {
    collectionId: string;
    cardId: string;
    data: Partial<CollectionItem>;
  }) => {
    const response = await collectionService.updateCardInCollection(
      collectionId,
      cardId,
      data
    );
    return { ...response, collectionId, cardId };
  }
);

export const getCollectionStatistics = createAsyncThunk(
  'collection/getCollectionStatistics',
  async (collectionId: string) => {
    const response =
      await collectionService.getCollectionStatistics(collectionId);
    return response;
  }
);

// 初始狀態
const initialState: CollectionState = {
  collections: [],
  selectedCollection: null,
  isLoading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  statistics: {
    totalCards: 0,
    totalValue: 0,
    averageCondition: 0,
    mostValuableCard: '',
    recentAdditions: 0,
    completionRate: 0,
  },
};

// Collection slice
const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCollection: (
      state,
      action: PayloadAction<Collection | null>
    ) => {
      state.selectedCollection = action.payload;
    },
    updateCollectionItem: (
      state,
      action: PayloadAction<{ collectionId: string; item: CollectionItem }>
    ) => {
      const { collectionId, item } = action.payload;
      const collection = state.collections.find(
        (c: any) => c.id === collectionId
      );
      if (collection) {
        const itemIndex = collection.items.findIndex(
          (i: any) => i.cardId === item.cardId
        );
        if (itemIndex !== -1) {
          collection.items[itemIndex] = item;
        }
      }
    },
    calculateStatistics: (state) => {
      const allCards = state.collections.flatMap((c) => c.items);
      const totalCards = allCards.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = allCards.reduce(
        (sum, item) => sum + item.currentValue * item.quantity,
        0
      );

      state.statistics = {
        totalCards,
        totalValue,
        averageCondition:
          allCards.length > 0
            ? allCards.reduce((sum, item) => {
                const conditionScore =
                  item.condition === 'mint'
                    ? 10
                    : item.condition === 'near-mint'
                      ? 9
                      : item.condition === 'excellent'
                        ? 8
                        : item.condition === 'good'
                          ? 7
                          : item.condition === 'light-played'
                            ? 6
                            : item.condition === 'played'
                              ? 5
                              : 4;
                return sum + conditionScore;
              }, 0) / allCards.length
            : 0,
        mostValuableCard:
          allCards.length > 0
            ? allCards.reduce((max, item) =>
                item.currentValue > max.currentValue ? item : max
              ).cardId
            : '',
        recentAdditions: allCards.length,
        completionRate: 0, // 需要根據實際邏輯計算
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch User Collections
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.collections = action.payload;
        state.error = null;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Collection
    builder
      .addCase(createCollection.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.isCreating = false;
        state.collections.unshift(action.payload);
        state.error = null;
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update Collection
    builder
      .addCase(updateCollection.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.collections.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.collections[index] = action.payload;
        }
        if (
          state.selectedCollection &&
          state.selectedCollection.id === action.payload.id
        ) {
          state.selectedCollection = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCollection.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete Collection
    builder
      .addCase(deleteCollection.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.collections = state.collections.filter(
          (c) => c.id !== action.payload
        );
        if (
          state.selectedCollection &&
          state.selectedCollection.id === action.payload
        ) {
          state.selectedCollection = null;
        }
        state.error = null;
      })
      .addCase(deleteCollection.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });

    // Add Card to Collection
    builder
      .addCase(addCardToCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCardToCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        // 更新對應的收藏
        const collection = state.collections.find(
          (c) => c.id === action.payload.collectionId
        );
        if (collection) {
          // 將新的卡牌項目添加到 items 數組
          const newItem = {
            cardId: action.payload.cardId,
            quantity: action.payload.quantity,
            condition: action.payload.condition as any,
            isFoil: action.payload.isFoil,
            purchasePrice: action.payload.purchasePrice,
            notes: action.payload.notes,
            location: '',
            isForSale: false,
            currentValue: 0,
            addedAt: new Date(),
          } as CollectionItem;
          collection.items.push(newItem);
        }
        if (
          state.selectedCollection &&
          state.selectedCollection.id === action.payload.collectionId
        ) {
          // 同樣更新選中的收藏
          const newItem = {
            cardId: action.payload.cardId,
            quantity: action.payload.quantity,
            condition: action.payload.condition as any,
            isFoil: action.payload.isFoil,
            purchasePrice: action.payload.purchasePrice,
            notes: action.payload.notes,
            location: '',
            isForSale: false,
            currentValue: 0,
            addedAt: new Date(),
          } as CollectionItem;
          state.selectedCollection.items.push(newItem);
        }
        state.error = null;
      })
      .addCase(addCardToCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove Card from Collection
    builder
      .addCase(removeCardFromCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeCardFromCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        const { collectionId, cardId } = action.payload;
        const collection = state.collections.find((c) => c.id === collectionId);
        if (collection) {
          collection.items = collection.items.filter(
            (item) => item.cardId !== cardId
          );
        }
        if (
          state.selectedCollection &&
          state.selectedCollection.id === collectionId
        ) {
          state.selectedCollection.items =
            state.selectedCollection.items.filter(
              (item) => item.cardId !== cardId
            );
        }
        state.error = null;
      })
      .addCase(removeCardFromCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Card in Collection
    builder
      .addCase(updateCardInCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCardInCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        // 更新對應的收藏
        const collection = state.collections.find(
          (c) => c.id === action.payload.collectionId
        );
        if (collection) {
          // 更新 items 數組中的對應項目
          const itemIndex = collection.items.findIndex(
            (item) => item.cardId === action.payload.cardId
          );
          if (itemIndex !== -1 && collection.items[itemIndex]) {
            const updatedItem = {
              ...collection.items[itemIndex],
              ...action.payload,
            };
            // 確保 currentValue 有值
            if (updatedItem.currentValue === undefined) {
              updatedItem.currentValue =
                collection.items[itemIndex]!.currentValue;
            }
            collection.items[itemIndex] = updatedItem as CollectionItem;
          }
        }
        if (
          state.selectedCollection &&
          state.selectedCollection.id === action.payload.collectionId
        ) {
          // 同樣更新選中的收藏
          const itemIndex = state.selectedCollection.items.findIndex(
            (item) => item.cardId === action.payload.cardId
          );
          if (itemIndex !== -1 && state.selectedCollection.items[itemIndex]) {
            const updatedItem = {
              ...state.selectedCollection.items[itemIndex],
              ...action.payload,
            };
            // 確保 currentValue 有值
            if (updatedItem.currentValue === undefined) {
              updatedItem.currentValue =
                state.selectedCollection.items[itemIndex]!.currentValue;
            }
            state.selectedCollection.items[itemIndex] =
              updatedItem as CollectionItem;
          }
        }
        state.error = null;
      })
      .addCase(updateCardInCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Collection Statistics
    builder
      .addCase(getCollectionStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCollectionStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = {
          ...action.payload,
          completionRate: (action.payload as any).completionRate || 0,
        };
        state.error = null;
      })
      .addCase(getCollectionStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSelectedCollection,
  updateCollectionItem,
  calculateStatistics,
} = collectionSlice.actions;

export default collectionSlice.reducer;
