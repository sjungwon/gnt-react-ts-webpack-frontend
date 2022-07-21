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
  _id: string;
  postId: string;
  user: {
    username: string;
    _id: string;
  };
  profile: ProfileType | null;
  text: string;
  subcomments: SubcommentType[];
  subcommentsCount: number;
  createdAt: string;
}

export interface SubcommentType {
  _id: string;
  postId: string;
  commentId: string;
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
  posts: PostType[];
  modifyContentId: "addPost" | string;
  deletePostStatus: "idle" | "pending" | "success" | "failed";
}

const initialState: PostState = {
  status: "idle",
  posts: [],
  modifyContentId: "",
  deletePostStatus: "idle",
};

export const getPostThunk = createAsyncThunk(
  "post/get",
  async (lastPostDate?: string) => {
    const response = await PostAPI.get(lastPostDate);
    return response.data;
  }
);

export const getPostByCategoryThunk = createAsyncThunk(
  "post/getByCategory",
  async (data: { categoryId: string; lastPostDate?: string }) => {
    const response = await PostAPI.getByCategoryId(data);
    return response.data;
  }
);

export const getPostByProfileThunk = createAsyncThunk(
  "post/getByProfile",
  async (data: { profileId: string; lastPostDate?: string }) => {
    const response = await PostAPI.getByProfileId(data);
    return response.data;
  }
);

export const getPostByUsernameThunk = createAsyncThunk(
  "post/getByUsername",
  async (data: { username: string; lastPostDate?: string }) => {
    const response = await PostAPI.getByUsername(data);
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
    clearPosts: (state: PostState) => {
      state.posts = [];
      state.status = "idle";
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
    getMoreSubcomments: (
      state: PostState,
      action: PayloadAction<SubcommentType[]>
    ) => {
      const newSubcomments = action.payload;
      if (!newSubcomments.length) {
        return;
      }
      const postId = newSubcomments[0].postId;
      const commentId = newSubcomments[0].commentId;
      state.posts = state.posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  subcomments: [...comment.subcomments, ...newSubcomments],
                };
              }
              return comment;
            }),
          };
        }
        return post;
      });
    },
    createSubcomments: (
      state: PostState,
      action: PayloadAction<SubcommentType>
    ) => {
      const newSubcomment = action.payload;
      if (!newSubcomment.hasOwnProperty("_id")) {
        return;
      }

      const postId = newSubcomment.postId;
      const commentId = newSubcomment.commentId;

      state.posts = state.posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  subcomments: [newSubcomment, ...comment.subcomments],
                  subcommentsCount: comment.subcommentsCount + 1,
                };
              }
              return comment;
            }),
          };
        }

        return post;
      });
    },
    updateSubcomment: (
      state: PostState,
      action: PayloadAction<SubcommentType>
    ) => {
      const updatedSubcomment = action.payload;

      const postId = updatedSubcomment.postId;
      const commentId = updatedSubcomment.commentId;

      state.posts = state.posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  subcomments: comment.subcomments.map((subcomment) => {
                    if (subcomment._id === updatedSubcomment._id) {
                      return updatedSubcomment;
                    }
                    return subcomment;
                  }),
                };
              }
              return comment;
            }),
          };
        }

        return post;
      });
    },
    deleteSubcomment: (
      state: PostState,
      action: PayloadAction<SubcommentType>
    ) => {
      const deletedSubcomment = action.payload;

      const postId = deletedSubcomment.postId;
      const commentId = deletedSubcomment.commentId;

      state.posts = state.posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  subcomments: comment.subcomments.filter(
                    (subcomment) => subcomment._id !== deletedSubcomment._id
                  ),
                  subcommentsCount: comment.subcommentsCount - 1,
                };
              }
              return comment;
            }),
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
          }
          state.posts = [...state.posts, ...newPosts];
          console.log(action.payload);
        }
      )
      .addCase(getPostThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(getPostByCategoryThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(
        getPostByCategoryThunk.fulfilled,
        (state, action: PayloadAction<PostType[]>) => {
          const newPosts = action.payload;
          if (!newPosts.length) {
            state.status = "done";
          } else {
            state.status = "success";
          }
          state.posts = [...state.posts, ...newPosts];
          console.log(action.payload);
        }
      )
      .addCase(getPostByCategoryThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(getPostByProfileThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(
        getPostByProfileThunk.fulfilled,
        (state, action: PayloadAction<PostType[]>) => {
          const newPosts = action.payload;
          if (!newPosts.length) {
            state.status = "done";
          } else {
            state.status = "success";
          }
          state.posts = [...state.posts, ...newPosts];
          console.log(action.payload);
        }
      )
      .addCase(getPostByProfileThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      .addCase(getPostByUsernameThunk.pending, (state, action) => {
        state.status = "pending";
      })
      .addCase(
        getPostByUsernameThunk.fulfilled,
        (state, action: PayloadAction<PostType[]>) => {
          const newPosts = action.payload;
          if (!newPosts.length) {
            state.status = "done";
          } else {
            state.status = "success";
          }
          state.posts = [...state.posts, ...newPosts];
          console.log(action.payload);
        }
      )
      .addCase(getPostByUsernameThunk.rejected, (state, action) => {
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
  clearPosts,
  setModifyContentId,
  clearModifyContentId,
  clearDeletePostStatus,
  createPost,
  updatePost,
  getMoreComments,
  createComment,
  updateComment,
  deleteComment,
  getMoreSubcomments,
  createSubcomments,
  updateSubcomment,
  deleteSubcomment,
} = postSlice.actions;

export default postSlice.reducer;
