import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import PostAPI from "../../apis/post";
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
  profile: ProfileType | null;
  user: {
    _id: string;
    username: string;
  };
  text: string;
  postImages: ImageType[];
  likes: number;
  dislikes: number;
  likeUsers: string[];
  dislikeUsers: string[];
  comments: CommentType[];
  commentsCount: number;
  createdAt: string;
}

export interface CommentType {
  postId: string;
  _id: string;
  user: {
    username: string;
    _id: string;
  };
  profile: ProfileType | null;
  text: string;
  createdAt: string;
}

type StatusType = "idle" | "pending" | "success" | "failed" | "done";

interface PostState {
  status: StatusType;
  lastPostDate: string;
  posts: PostType[];
  modifyContentId: "addPost" | string;
  deletePostStatus: "idle" | "pending" | "success" | "failed";
}

const initialState: PostState = {
  status: "idle",
  lastPostDate: "",
  posts: [],
  modifyContentId: "",
  deletePostStatus: "idle",
};

export const getPostThunk = createAsyncThunk(
  "post/get",
  async (lastPostData?: string) => {
    const response = await PostAPI.get(lastPostData);
    return response.data;
  }
);

export const deletePostThunk = createAsyncThunk(
  "post/delete",
  async (postId: string) => {
    await PostAPI.delete(postId);
    return postId;
  }
);

export const handleLikeThunk = createAsyncThunk(
  "post/like",
  async (postId: string) => {
    const response = await PostAPI.likePost(postId);
    return response.data;
  }
);

export const handleDislikeThunk = createAsyncThunk(
  "post/dislike",
  async (postId: string) => {
    const response = await PostAPI.dislikePost(postId);
    return response.data;
  }
);

//status 쪼개야함 -> get, (add, modify)
const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setModifyContentId: (state: PostState, action: PayloadAction<string>) => {
      state.modifyContentId = action.payload;
    },
    clearModifyContentId: (state: PostState) => {
      state.modifyContentId = "";
    },
    clearDeletePostStatus: (state: PostState) => {
      state.deletePostStatus = "idle";
    },
    createPost: (state: PostState, action: PayloadAction<PostType>) => {
      const newPost = action.payload;
      state.posts = [newPost, ...state.posts];
    },
    updatePost: (state: PostState, action: PayloadAction<PostType>) => {
      const updatedPost = action.payload;
      state.posts = state.posts.map((post) => {
        if (post._id === updatedPost._id) {
          return updatedPost;
        }
        return post;
      });
    },
    getMoreComments: (
      state: PostState,
      action: PayloadAction<{ postId: string; newComments: CommentType[] }>
    ) => {
      const postId = action.payload.postId;
      const newComments = action.payload.newComments;
      state.posts = state.posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [...post.comments, ...newComments],
          };
        }
        return post;
      });
    },
    createComment: (
      state: PostState,
      action: PayloadAction<{ postId: string; newComment: CommentType }>
    ) => {
      state.posts = state.posts.map((post) => {
        if (post._id === action.payload.postId) {
          return {
            ...post,
            comments: [action.payload.newComment, ...post.comments],
            commentsCount: post.commentsCount + 1,
          };
        }
        return post;
      });
    },
    updateComment: (
      state: PostState,
      action: PayloadAction<{ postId: string; updatedComment: CommentType }>
    ) => {
      state.posts = state.posts.map((post) => {
        if (post._id === action.payload.postId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment._id === action.payload.updatedComment._id) {
                return action.payload.updatedComment;
              }

              return comment;
            }),
          };
        }

        return post;
      });
    },
    deleteComment: (
      state: PostState,
      action: PayloadAction<{ postId: string; deletedComment: CommentType }>
    ) => {
      state.posts = state.posts.map((post) => {
        if (post._id === action.payload.postId) {
          return {
            ...post,
            comments: post.comments.filter(
              (comment) => comment._id !== action.payload.deletedComment._id
            ),
            commentsCount: post.commentsCount - 1,
          };
        }

        return post;
      });
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getPostThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(
        getPostThunk.fulfilled,
        (state, action: PayloadAction<PostType[]>) => {
          const newPosts = action.payload;
          if (!newPosts.length) {
            state.status = "done";
          } else {
            state.status = "success";
            state.lastPostDate = newPosts[newPosts.length - 1].createdAt;
          }
          state.posts = [...state.posts, ...newPosts];
          console.log(action.payload);
        }
      )
      .addCase(getPostThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(deletePostThunk.pending, (state, action) => {
        state.deletePostStatus = "pending";
      })
      .addCase(
        deletePostThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.deletePostStatus = "success";
          const removedPostId = action.payload;
          state.posts = state.posts.filter(
            (post) => post._id !== removedPostId
          );
        }
      )
      .addCase(deletePostThunk.rejected, (state, action) => {
        state.deletePostStatus = "failed";
      })
      .addCase(handleLikeThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(handleLikeThunk.fulfilled, (state, action) => {
        state.status = "success";
        const handlePost = action.payload;
        state.posts = state.posts.map((post) => {
          if (post._id === handlePost._id) {
            return handlePost;
          }

          return post;
        });
      })
      .addCase(handleLikeThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(handleDislikeThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(handleDislikeThunk.fulfilled, (state, action) => {
        state.status = "success";
        const handlePost = action.payload;
        state.posts = state.posts.map((post) => {
          if (post._id === handlePost._id) {
            return handlePost;
          }

          return post;
        });
      })
      .addCase(handleDislikeThunk.rejected, (state, action) => {
        state.status = "failed";
      });
  },
});

export const {
  setModifyContentId,
  clearModifyContentId,
  clearDeletePostStatus,
  createPost,
  updatePost,
  getMoreComments,
  createComment,
  updateComment,
  deleteComment,
} = postSlice.actions;

export default postSlice.reducer;
