import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AddPostReqType, PostAPI, UpdatePostReqType } from "../../apis/post";
import { TypedForm } from "../../classes/TypedForm";
import { ProfileType } from "./profile";

interface ImageType {
  URL: string;
  Key: string;
  _id: string;
}

export interface PostType {
  _id: string;
  category: {
    _id: string;
    title: string;
  };
  profile: ProfileType;
  user: {
    _id: string;
    username: string;
  };
  text: string;
  postImages: ImageType[];
  createdAt?: string;
}

interface PostState {
  status: "idle" | "pending" | "success" | "failed";
  posts: PostType[];
}

const initialState: PostState = {
  status: "idle",
  posts: [],
};

const API = new PostAPI();

export const getPostThunk = createAsyncThunk("post/get", async () => {
  const response = await API.get();
  return response.data;
});

export const addPostThunk = createAsyncThunk(
  "post/add",
  async (newPost: TypedForm<AddPostReqType>) => {
    const response = await API.create(newPost);
    return response.data;
  }
);

export const updatePostThunk = createAsyncThunk(
  "post/update",
  async (updatePost: TypedForm<UpdatePostReqType>) => {
    const response = await API.update(updatePost);
    return response.data;
  }
);

export const deletePostThunk = createAsyncThunk(
  "post/delete",
  async (postId: string) => {
    await API.delete(postId);
    return postId;
  }
);

//status 쪼개야함 -> get, (add, modify)
const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(addPostThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(
        addPostThunk.fulfilled,
        (state, action: PayloadAction<PostType>) => {
          state.status = "success";
          state.posts = [...state.posts, action.payload];
          console.log(action.payload);
        }
      )
      .addCase(addPostThunk.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(updatePostThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(
        updatePostThunk.fulfilled,
        (state, action: PayloadAction<PostType>) => {
          state.status = "success";
          const updatedPost = action.payload;
          state.posts = state.posts.map((post) => {
            if (post._id === updatedPost._id) {
              return updatedPost;
            }
            return post;
          });
          console.log(action.payload);
        }
      )
      .addCase(updatePostThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(getPostThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(
        getPostThunk.fulfilled,
        (state, action: PayloadAction<PostType[]>) => {
          state.status = "success";
          const posts = action.payload;
          state.posts = posts;
          console.log(action.payload);
        }
      )
      .addCase(getPostThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(deletePostThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(
        deletePostThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.status = "success";
          const removedPostId = action.payload;
          state.posts = state.posts.filter(
            (post) => post._id !== removedPostId
          );
        }
      )
      .addCase(deletePostThunk.rejected, (state, action) => {
        state.status = "failed";
      });
  },
});

export default postSlice.reducer;
