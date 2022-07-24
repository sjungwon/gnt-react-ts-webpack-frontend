import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import categoryAPI from "../../apis/category";

const SortCategory = (categories: CategoryType[]) => {
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.title < b.title) {
      return -1;
    } else if (a.title > b.title) {
      return 1;
    } else {
      return 0;
    }
  });

  return sortedCategories;
};

//카테고리 데이터 타입
export interface CategoryType {
  title: string;
  _id: string;
  user: {
    _id: string;
    username: string;
  };
}

//카테고리 상태 타입
interface CategoryState {
  //카테고리 가져오기 상태
  status: "idle" | "pending" | "success" | "failed";
  //카테고리 배열 데이터
  categories: CategoryType[];
  //카테고리 추가 상태
  createStatus: "idle" | "pending" | "success" | "failed";
  //카테고리 삭제 상태
  deleteStatus: "idle" | "pending" | "success" | "failed";
  //현재 선택된 카테고리
  currentCategory: CategoryType;
  //초기 카테고리 상태 값
  initialCategory: CategoryType;
}

//카테고리 초기 상태
const initialState: CategoryState = {
  status: "idle",
  categories: [],
  createStatus: "idle",
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

//Thunks
//GET 카테고리
export const getCategoryThunk = createAsyncThunk(
  "category/get",
  async (): Promise<CategoryType[] | AxiosError> => {
    try {
      const response = await categoryAPI.get();
      return response.data;
    } catch (err) {
      return Promise.reject(err as AxiosError);
    }
  }
);

//카테고리 추가
export const createCategoryThunk = createAsyncThunk(
  "category/add",
  async (newCategoryTitle: string): Promise<CategoryType | AxiosError> => {
    try {
      const response = await categoryAPI.create(newCategoryTitle);
      return response.data;
    } catch (err) {
      return Promise.reject(err as AxiosError);
    }
  }
);

//카테고리 제거
export const deleteCategoryThunk = createAsyncThunk(
  "category/delete",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      await categoryAPI.delete(categoryId);
      return categoryId;
    } catch (err) {
      const errResponse = (err as AxiosError).response;
      const errData = {
        status: errResponse?.status,
        data: errResponse?.data,
      };
      return rejectWithValue(errData);
    }
  }
);

//카테고리 redux slice
const categoryslice = createSlice({
  name: "category",
  initialState,
  reducers: {
    //현재 카테고리 title로 설정
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
    //카테고리 추가 상태 clear
    clearCreateCategoryStatus: (state: CategoryState) => {
      state.createStatus = "idle";
    },
    //카테고리 삭제 상태 clear
    clearDeleteCategoryStatus: (state: CategoryState) => {
      state.deleteStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      //카테고리 가져오기 진행
      .addCase(getCategoryThunk.pending, (state, action) => {
        state.status = "pending";
      })
      //가져오기 성공
      .addCase(getCategoryThunk.fulfilled, (state, action) => {
        state.status = "success";

        const categories = action.payload as CategoryType[];
        //카테고리 서버에서 정렬된 배열로 들어옴
        state.categories = categories;
      })
      //가져오기 실패
      .addCase(getCategoryThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      //카테고리 추가 진행
      .addCase(createCategoryThunk.pending, (state, action) => {
        state.createStatus = "pending";
      })
      //카테고리 추가 성공
      .addCase(createCategoryThunk.fulfilled, (state, action) => {
        state.createStatus = "success";

        const newCategory = action.payload as CategoryType;
        //새로 추가된 카테고리 순서 정렬
        state.categories = SortCategory([...state.categories, newCategory]);
      })
      //카테고리 추가 실패
      .addCase(createCategoryThunk.rejected, (state, action) => {
        state.createStatus = "failed";
      })
      //카테고리 제거 진행
      .addCase(deleteCategoryThunk.pending, (state, action) => {
        state.deleteStatus = "pending";
      })
      //카테고리 제거 성공
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.deleteStatus = "success";

        const deletedCategoryId = action.payload as string;
        state.categories = state.categories.filter(
          (category) => category._id !== deletedCategoryId
        );
      })
      //카테고리 제거 실패
      .addCase(deleteCategoryThunk.rejected, (state, action) => {
        state.deleteStatus = "failed";
        const error = action.payload as {
          status: number;
          data: { type: string; error: string };
        };
        console.log(error);

        const errorStatus = error.status;
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
  clearCreateCategoryStatus,
  clearDeleteCategoryStatus,
} = categoryslice.actions;

export default categoryslice.reducer;
