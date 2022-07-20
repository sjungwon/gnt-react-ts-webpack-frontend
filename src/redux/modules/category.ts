import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { addCategoryAPI, getCategoryAPI } from "../../apis/category";
import { SortCategory } from "../../functions/SortFunc";

export interface CategoryType {
  title: string;
  _id: string;
  user: {
    _id: string;
    username: string;
  };
}

//function

//Thunks
export const getCategoryThunk = createAsyncThunk(
  "category/get",
  async (): Promise<CategoryType[] | AxiosError> => {
    try {
      const response = await getCategoryAPI();
      return response.data;
    } catch (err) {
      return Promise.reject(err as AxiosError);
    }
  }
);

export const addCategoryThunk = createAsyncThunk(
  "category/add",
  async (newCategoryTitle: string): Promise<CategoryType | AxiosError> => {
    try {
      const response = await addCategoryAPI(newCategoryTitle);
      return response.data;
    } catch (err) {
      return Promise.reject(err as AxiosError);
    }
  }
);

interface CategoryState {
  status: "idle" | "pending" | "success" | "failed";
  categories: CategoryType[];
  addStatus: "idle" | "pending" | "success" | "failed";
  currentCategoryTitle: string;
}

//initialState
const initialState: CategoryState = {
  status: "idle",
  categories: [],
  addStatus: "idle",
  currentCategoryTitle: "all",
};

//Slice
const categoryslice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCurrentCategoryTitle: (
      state: CategoryState,
      action: PayloadAction<string>
    ) => {
      const findedCategory = state.categories.find(
        (category) => category.title === action.payload
      );
      if (findedCategory) {
        state.currentCategoryTitle = findedCategory.title;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCategoryThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(getCategoryThunk.fulfilled, (state, action) => {
        state.status = "success";

        const categories = action.payload as CategoryType[];
        state.categories = SortCategory(categories);
      })
      .addCase(getCategoryThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(addCategoryThunk.pending, (state, action) => {
        state.addStatus = "pending";
      })
      .addCase(addCategoryThunk.fulfilled, (state, action) => {
        state.addStatus = "success";

        const newCategory = action.payload as CategoryType;
        state.categories = SortCategory([...state.categories, newCategory]);
      })
      .addCase(addCategoryThunk.rejected, (state, action) => {
        state.addStatus = "failed";
      });
  },
});

export const { setCurrentCategoryTitle } = categoryslice.actions;

export default categoryslice.reducer;
