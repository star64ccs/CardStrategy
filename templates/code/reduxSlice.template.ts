import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface {{SliceName}}State {
  // 定義狀態類型
}

const initialState: {{SliceName}}State = {
  // 初始狀態
};

// 異步操作
export const {{asyncActionName}} = createAsyncThunk(
  '{{sliceName}}/{{asyncActionName}}',
  async (payload: any) => {
    // 異步邏輯
    return payload;
  }
);

const {{sliceName}}Slice = createSlice({
  name: '{{sliceName}}',
  initialState,
  reducers: {
    // 同步操作
  },
  extraReducers: (builder) => {
    // 異步操作處理
  },
});

export const { actions } = {{sliceName}}Slice;
export default {{sliceName}}Slice.reducer;