import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError, AxiosResponse } from "axios";
import {
  addCategoryAPI,
  deleteCategoryAPI,
  getCategoryAPI,
} from "../../apis/category";
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

export const deleteCategoryThunk = createAsyncThunk(
  "category/delete",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      await deleteCategoryAPI(categoryId);
      return categoryId;
    } catch (err) {
      console.log(err);
      return rejectWithValue((err as AxiosError).response);
    }
  }
);

interface CategoryState {
  status: "idle" | "pending" | "success" | "failed";
  categories: CategoryType[];
  addStatus: "idle" | "pending" | "success" | "failed";
  deleteStatus: "idle" | "pending" | "success" | "failed";
  currentCategory: CategoryType;
  initialCategory: CategoryType;
}

//initialState
const initialState: CategoryState = {
  status: "idle",
  categories: [],
  addStatus: "idle",
  deleteStatus: "idle",
  currentCategory: {
    title: "",
    _id: "",
    user: {
      _id: "",
      username: "",
    },
  },
  initialCategory: {
    title: "",
    _id: "",
    user: {
      _id: "",
      username: "",
    },
  },
};

//Slice
const categoryslice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCurrentCategoryByTitle: (
      state: CategoryState,
      action: PayloadAction<string | undefined>
    ) => {
      const categoryTitle = action.payload;
      const all = {
        title: "",
        _id: "",
        user: {
          _id: "",
          username: "",
        },
      };
      if (!categoryTitle) {
        state.currentCategory = all;
        return;
      }
      const findedCategory = state.categories.find(
        (category) => category.title === categoryTitle
      );
      state.currentCategory = findedCategory || all;
    },
    clearAddCategoryStatus: (state: CategoryState) => {
      state.addStatus = "idle";
    },
    clearDeleteCategoryStatus: (state: CategoryState) => {
      state.deleteStatus = "idle";
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
      })
      .addCase(deleteCategoryThunk.pending, (state, action) => {
        state.deleteStatus = "pending";
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.deleteStatus = "success";

        const deletedCategoryId = action.payload as string;
        state.categories = state.categories.filter(
          (category) => category._id !== deletedCategoryId
        );
      })
      .addCase(deleteCategoryThunk.rejected, (state, action) => {
        state.deleteStatus = "failed";
        const error = action.payload as AxiosResponse<{
          type: string;
          error: string;
        }>;
        console.log(error);

        const errorStatus = error.status || 500;
        const errorMessage = error.data.error;
        if (errorStatus === 403) {
          if (errorMessage === "can't delete category with content") {
            window.alert(
              "컨텐츠(프로필, 포스트, 댓글, 대댓글)가 존재하는 카테고리는 제거할 수 없습니다."
            );
            return;
          }
          window.alert("카테고리를 제거할 권한이 없습니다.");
          return;
        }
        window.alert("카테고리 제거에 오류가 발생했습니다. 다시 시도해주세요.");
      });
  },
});

export const {
  setCurrentCategoryByTitle,
  clearAddCategoryStatus,
  clearDeleteCategoryStatus,
} = categoryslice.actions;

export default categoryslice.reducer;
