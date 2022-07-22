import { AxiosResponse } from "axios";
import { CommentType } from "../redux/modules/post";
import { API, APIWithToken } from "./basic";

export interface AddCommentReqData {
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

export interface GetMoreCommentData {
  postId: string;
  lastCommentDate: string;
}

class CommentAPI {
  private path: string = "/comments";

  public createComment = (data: AddCommentReqData) => {
    return APIWithToken.post<
      CommentType,
      AxiosResponse<CommentType>,
      AddCommentReqData
    >(this.path, data);
  };

  public updateComment = (data: UpdateCommentReqData) => {
    const path = this.path + "/" + data.commentId;
    return APIWithToken.patch<
      CommentType,
      AxiosResponse<CommentType>,
      UpdateCommentReq
    >(path, {
      text: data.text,
      profile: data.profile,
    });
  };

  public blockComment = (commentId: string) => {
    const path = this.path + "/block/" + commentId;
    return APIWithToken.patch<void, AxiosResponse<void>, void>(path);
  };

  public deleteComment = (commentId: string) => {
    const path = this.path + "/" + commentId;
    return APIWithToken.delete<CommentType, AxiosResponse<CommentType>, void>(
      path
    );
  };

  public getMoreComments = (data: GetMoreCommentData) => {
    const path = this.path + "/" + data.postId + "/" + data.lastCommentDate;
    return API.get<CommentType[], AxiosResponse<CommentType[]>, void>(path);
  };
}

export default new CommentAPI();
