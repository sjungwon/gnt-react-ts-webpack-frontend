import { AxiosResponse } from "axios";
import { CommentType } from "../redux/modules/post";
import defaultAPI from "./default";

export interface CreateCommentReqData {
  postId: string;
  category: string;
  profile: string;
  text: string;
}

interface UpdateCommentReq {
  text: string;
  profile: string;
}

export interface UpdateCommentReqData extends UpdateCommentReq {
  commentId: string;
}

export interface GetCommentData {
  postId: string;
  lastCommentDate: string;
}

class CommentAPI {
  private readonly path: string = "/comments";
  private readonly API = defaultAPI.API;
  private readonly APIWithToken = defaultAPI.APIWithToken;

  //GET 댓글 (더보기)
  public readonly get = (data: GetCommentData) => {
    const path = this.path + "/" + data.postId + "/" + data.lastCommentDate;
    return this.API.get<CommentType[], AxiosResponse<CommentType[]>, void>(
      path
    );
  };

  //POST 댓글 생성
  public readonly create = (data: CreateCommentReqData) => {
    return this.APIWithToken.post<
      CommentType,
      AxiosResponse<CommentType>,
      CreateCommentReqData
    >(this.path, data);
  };

  //PATCH 댓글 수정
  public readonly update = (data: UpdateCommentReqData) => {
    const path = this.path + "/" + data.commentId;
    return this.APIWithToken.patch<
      CommentType,
      AxiosResponse<CommentType>,
      UpdateCommentReq
    >(path, {
      text: data.text,
      profile: data.profile,
    });
  };

  //DELETE 댓글 제거
  public readonly delete = (commentId: string) => {
    const path = this.path + "/" + commentId;
    return this.APIWithToken.delete<
      CommentType,
      AxiosResponse<CommentType>,
      void
    >(path);
  };

  //PATCH 댓글 차단
  public readonly block = (commentId: string) => {
    const path = this.path + "/block/" + commentId;
    return this.APIWithToken.patch<void, AxiosResponse<void>, void>(path);
  };
}

const commentAPI = new CommentAPI();

export default commentAPI;
