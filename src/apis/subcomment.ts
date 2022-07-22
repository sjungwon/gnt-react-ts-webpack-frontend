import { AxiosResponse } from "axios";
import { SubcommentType } from "../redux/modules/post";
import { API, APIWithToken } from "./basic";

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

  public getMore = (commentId: string, lastSubcommentDate: string) => {
    const path = this.path + "/" + commentId + "/" + lastSubcommentDate;
    return API.get<SubcommentType[], AxiosResponse<SubcommentType[]>, void>(
      path
    );
  };

  public create = (data: CreateSubcommentData) => {
    return APIWithToken.post<
      SubcommentType,
      AxiosResponse<SubcommentType>,
      CreateSubcommentData
    >(this.path, data);
  };

  public update = (data: UpdateSubcommentData) => {
    return APIWithToken.patch<
      SubcommentType,
      AxiosResponse<SubcommentType>,
      UpdateSubcommentData
    >(this.path, data);
  };

  public block = (subcommentId: string) => {
    const path = this.path + "/block/" + subcommentId;
    return APIWithToken.patch<void, AxiosResponse<void>, void>(path);
  };

  public delete = (subcommentId: string) => {
    const path = this.path + "/" + subcommentId;
    return APIWithToken.delete<
      SubcommentType,
      AxiosResponse<SubcommentType>,
      void
    >(path);
  };
}

export default new SubcommentAPI();
