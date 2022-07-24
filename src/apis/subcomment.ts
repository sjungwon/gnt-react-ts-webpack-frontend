import { AxiosResponse } from "axios";
import { SubcommentType } from "../redux/modules/post";
import defaultAPI from "./default";

export interface CreateSubcommentData {
  postId: string;
  commentId: string;
  category: string;
  profile: string;
  text: string;
}

export interface UpdateSubcommentData {
  _id: string;
  profile: string;
  text: string;
}

class SubcommentAPI {
  private path = "/subcomments";
  private readonly API = defaultAPI.API;
  private readonly APIWithToken = defaultAPI.APIWithToken;

  //GET 대댓글 (댓글에 대한 대댓글 6개)
  public get = (commentId: string, lastSubcommentDate: string) => {
    const path = this.path + "/" + commentId + "/" + lastSubcommentDate;
    return this.API.get<
      SubcommentType[],
      AxiosResponse<SubcommentType[]>,
      void
    >(path);
  };

  //POST 대댓글 생성
  public create = (data: CreateSubcommentData) => {
    return this.APIWithToken.post<
      SubcommentType,
      AxiosResponse<SubcommentType>,
      CreateSubcommentData
    >(this.path, data);
  };

  //PATCH 대댓글 수정
  public update = (data: UpdateSubcommentData) => {
    return this.APIWithToken.patch<
      SubcommentType,
      AxiosResponse<SubcommentType>,
      UpdateSubcommentData
    >(this.path, data);
  };

  //PATCH 대댓글 차단
  public block = (subcommentId: string) => {
    const path = this.path + "/block/" + subcommentId;
    return this.APIWithToken.patch<void, AxiosResponse<void>, void>(path);
  };

  //대댓글 삭제
  public delete = (subcommentId: string) => {
    const path = this.path + "/" + subcommentId;
    return this.APIWithToken.delete<
      SubcommentType,
      AxiosResponse<SubcommentType>,
      void
    >(path);
  };
}

const subcommentAPI = new SubcommentAPI();

export default subcommentAPI;
