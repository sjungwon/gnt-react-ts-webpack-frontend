import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import postAPI from "../../apis/post";
import { ProfileType } from "./profile";

//포스트 이미지 타입
interface ImageType {
  URL: string;
  Key: string;
  _id: string;
}

//포스트 데이터 타입
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
  blocked: boolean;
  createdAt: string;
}

//댓글 데이터 타입
export interface CommentType {
  _id: string;
  postId: string;
  user: {
    username: string;
    _id: string;
  };
  category: {
    title: string;
    _id: string;
  };
  profile: ProfileType | null;
  text: string;
  subcomments: SubcommentType[];
  subcommentsCount: number;
  blocked: boolean;
  createdAt: string;
}

//대댓글 데이터 타입
export interface SubcommentType {
  _id: string;
  postId: string;
  commentId: string;
  user: {
    username: string;
    _id: string;
  };
  category: {
    title: string;
    _id: string;
  };
  profile: ProfileType | null;
  text: string;
  blocked: boolean;
  createdAt: string;
}

//상태 타입
type StatusType = "idle" | "pending" | "success" | "failed";

//포스트 상태 타입
interface PostState {
  //가져오기 상태 -> done이면 포스트 더 없음
  status: StatusType | "done";
  //포스트 배열 데이터
  posts: PostType[];
  //포스트, 댓글, 대댓글 수정 시 한번에 하나만 수정하도록 ID로 수정할 데이터 지정, 포스트 추가도 포함
  modifyContentId: "createPost" | string;
  //포스트 제거 상태
  deletePostStatus: StatusType;
}

//초기 포스트 상태
const initialState: PostState = {
  status: "idle",
  posts: [],
  modifyContentId: "",
  deletePostStatus: "idle",
};

//GET 포스트
export const getPostThunk = createAsyncThunk(
  "post/get",
  async (lastPostDate?: string) => {
    const response = await postAPI.get(lastPostDate);
    return response.data;
  }
);

//GET 카테고리에 맞는 포스트(카테고리 선택된 경우)
export const getPostByCategoryIdThunk = createAsyncThunk(
  "post/getByCategory",
  async (data: { categoryId: string; lastPostDate?: string }) => {
    const response = await postAPI.getByCategoryId(data);
    return response.data;
  }
);

//GET 프로필에 맞는 포스트 (프로필 정보를 보는 경우, 특정 프로필에 대한 포스트만 가져옴)
export const getPostByProfileIdThunk = createAsyncThunk(
  "post/getByProfile",
  async (data: { profileId: string; lastPostDate?: string }) => {
    const response = await postAPI.getByProfileId(data);
    return response.data;
  }
);

//GET 유저 이름에 맞는 포스트 (유저 정보를 보는 경우, 유저에 맞는 포스트만 가져옴)
export const getPostByUsernameThunk = createAsyncThunk(
  "post/getByUsername",
  async (data: { username: string; lastPostDate?: string }) => {
    const response = await postAPI.getByUsername(data);
    return response.data;
  }
);

//DELETE 포스트 제거
export const deletePostThunk = createAsyncThunk(
  "post/delete",
  async (postId: string) => {
    await postAPI.delete(postId);
    return postId;
  }
);

//PATCH 포스트 좋아요
//서버에서 좋아요 상태를 판단
//싫어요 있으면 제거 후 좋아요 추가
//좋아요 있으면 좋아요 제거
//좋아요 없으면 좋아요 추가
export const handleLikeThunk = createAsyncThunk(
  "post/like",
  async (postId: string) => {
    const response = await postAPI.like(postId);
    return response.data;
  }
);

//PATHCH 포스트 싫어요
//좋아요와 동일
export const handleDislikeThunk = createAsyncThunk(
  "post/dislike",
  async (postId: string) => {
    const response = await postAPI.dislike(postId);
    return response.data;
  }
);

//포스트 redux slice
const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    //수정할 데이터 id 지정
    setModifyContentId: (state: PostState, action: PayloadAction<string>) => {
      state.modifyContentId = action.payload;
    },
    //수정 모드인 id clear
    clearModifyContentId: (state: PostState) => {
      state.modifyContentId = "";
    },
    //포스트 제거 상태 clear
    clearDeletePostStatus: (state: PostState) => {
      state.deletePostStatus = "idle";
    },
    //페이지 이동시 (카테고리, 프로필, 유저 등 선택된 경우) 포스트 데이터와 GET 상태 clear
    clearPosts: (state: PostState) => {
      state.posts = [];
      state.status = "idle";
    },
    //포스트 추가 - thunk로 처리 안하고 컴포넌트에서
    //API로 바로 처리 후 성공하면 데이터 전달
    //이전 amplify + context로 구현한 front 기반이라
    //thunk로 모두 이전하기엔 상태 처리가 복잡함
    //+ post에 comment에 subcomment로 중첩 구조라
    //각 post별 상태를 따로 두고 추가, 수정, 차단등의 상황에 대응해야하는 것 보다
    //각 컴포넌트에서 데이터를 알아서 처리하고 redux 쪽으로 데이터 전달하는 것이 이해하기 편함
    createPost: (state: PostState, action: PayloadAction<PostType>) => {
      const newPost = action.payload;
      state.posts = [newPost, ...state.posts];
    },
    //포스트 수정
    updatePost: (state: PostState, action: PayloadAction<PostType>) => {
      const updatedPost = action.payload;
      state.posts = state.posts.map((post) => {
        if (post._id === updatedPost._id) {
          return updatedPost;
        }
        return post;
      });
    },
    //포스트 차단
    blockPost: (state: PostState, action: PayloadAction<string>) => {
      const blockPostId = action.payload;
      state.posts = state.posts.map((post) => {
        if (post._id === blockPostId) {
          return {
            ...post,
            text: "차단된 포스트",
            postImages: [],
            blocked: true,
          };
        }

        return post;
      });
    },
    //댓글 더보기
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
    //댓글 생성
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
    //댓글 수정
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
    //댓글 차단
    blockComment: (
      state: PostState,
      action: PayloadAction<{ postId: string; commentId: string }>
    ) => {
      const postId = action.payload.postId;
      const commentId = action.payload.commentId;

      state.posts = state.posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  text: "차단된 댓글",
                  blocked: true,
                };
              }

              return comment;
            }),
          };
        }

        return post;
      });
    },
    //댓글 제거
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
    //대댓글 더보기
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
    //대댓글 생성
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
    //대댓글 수정
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
    //대댓글 차단
    blockSubcomment: (
      state: PostState,
      action: PayloadAction<{
        postId: string;
        commentId: string;
        subcommentId: string;
      }>
    ) => {
      const postId = action.payload.postId;
      const commentId = action.payload.commentId;
      const subcommentId = action.payload.subcommentId;
      state.posts = state.posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  subcomments: comment.subcomments.map((subcomment) => {
                    if (subcomment._id === subcommentId) {
                      return {
                        ...subcomment,
                        text: "차단된 댓글",
                        blocked: true,
                      };
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
    //대댓글 제거
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
      //포스트 가져오기 진행
      .addCase(getPostThunk.pending, (state, action) => {
        state.status = "pending";
      })
      //포스트 가져오기 성공
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
        }
      )
      //포스트 가져오기 실패
      .addCase(getPostThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      //카테고리별 포스트 가져오기 진행
      .addCase(getPostByCategoryIdThunk.pending, (state, action) => {
        state.status = "pending";
      })
      //카테고리별 포스트 가져오기 성공
      .addCase(
        getPostByCategoryIdThunk.fulfilled,
        (state, action: PayloadAction<PostType[]>) => {
          const newPosts = action.payload;
          if (!newPosts.length) {
            state.status = "done";
          } else {
            state.status = "success";
          }
          state.posts = [...state.posts, ...newPosts];
        }
      )
      //카테고리별 포스트 가져오기 실패
      .addCase(getPostByCategoryIdThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      //프로필별 포스트 가져오기 진행
      .addCase(getPostByProfileIdThunk.pending, (state, action) => {
        state.status = "pending";
      })
      //프로필별 포스트 가져오기 성공
      .addCase(
        getPostByProfileIdThunk.fulfilled,
        (state, action: PayloadAction<PostType[]>) => {
          const newPosts = action.payload;
          if (!newPosts.length) {
            state.status = "done";
          } else {
            state.status = "success";
          }
          state.posts = [...state.posts, ...newPosts];
        }
      )
      //프로필별 포스트 가져오기 실패
      .addCase(getPostByProfileIdThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      //사용자별 포스트 가져오기 진행
      .addCase(getPostByUsernameThunk.pending, (state, action) => {
        state.status = "pending";
      })
      //사용자별 포스트 가져오기 성공
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
        }
      )
      //사용자별 포스트 가져오기 실패
      .addCase(getPostByUsernameThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      //포스트 제거
      .addCase(deletePostThunk.pending, (state, action) => {
        state.deletePostStatus = "pending";
      })
      //포스트 제거 성공
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
      //포스트 제거 실패
      .addCase(deletePostThunk.rejected, (state, action) => {
        state.deletePostStatus = "failed";
      })
      //좋아요 진행
      .addCase(handleLikeThunk.pending, (state, action) => {
        state.status = "pending";
      })
      //좋아요 성공
      //좋아요 처리(있으면 제거, 없으면 추가, 싫어요 있으면 제거후 좋아요 추가)된 포스트를
      //response로 받음 -> 이전 post 데이터 교체
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
      //좋아요 실패
      .addCase(handleLikeThunk.rejected, (state, action) => {
        state.status = "failed";
      })
      //싫어요 진행
      .addCase(handleDislikeThunk.pending, (state, action) => {
        state.status = "pending";
      })
      //싫어요 성공
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
      //싫어요 실패
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
  blockPost,
  blockComment,
  blockSubcomment,
} = postSlice.actions;

export default postSlice.reducer;
