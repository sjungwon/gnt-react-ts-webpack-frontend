import { AxiosResponse } from "axios";
import { TypedForm } from "../classes/TypedForm";
import { ImageType } from "../components/molecules/ImageSlide";
import { PostType } from "../redux/modules/post";
import { API, APIWithToken } from "./basic";

interface PostReqType {
  profile: string;
  text: string;
  newImages?: File[];
}

export interface AddPostReqType extends PostReqType {
  category: string;
}

export interface UpdatePostReqType extends PostReqType {
  _id: string;
  removedImages?: ImageType[];
}

class PostAPI {
  private path: string = "/posts";

  public get = (lastPostDate?: string) => {
    const path = this.path + "?last=" + (lastPostDate || "");
    return API.get<PostType[], AxiosResponse<PostType[]>, void>(path);
  };

  public getByCategoryId = (data: {
    categoryId: string;
    lastPostDate?: string;
  }) => {
    const path =
      this.path +
      "/categories/" +
      data.categoryId +
      "?last=" +
      (data.lastPostDate || "");
    return API.get<PostType[], AxiosResponse<PostType[]>, void>(path);
  };

  public getByProfileId = (data: {
    profileId: string;
    lastPostDate?: string;
  }) => {
    const path =
      this.path +
      "/profiles/" +
      data.profileId +
      "?last=" +
      (data.lastPostDate || "");
    return API.get<PostType[], AxiosResponse<PostType[]>, void>(path);
  };

  public getByUsername = (data: {
    username: string;
    lastPostDate?: string;
  }) => {
    const path =
      this.path +
      "/users/" +
      encodeURIComponent(data.username) +
      "?last=" +
      (data.lastPostDate || "");
    return API.get<PostType[], AxiosResponse<PostType[]>, void>(path);
  };

  public create = (newPost: TypedForm<AddPostReqType>) => {
    return APIWithToken.post<PostType, AxiosResponse<PostType>, FormData>(
      this.path,
      newPost.data,
      {
        headers: {
          "Content-type": "multipart/form-data",
        },
      }
    );
  };

  public update = (updatePost: TypedForm<UpdatePostReqType>) => {
    return APIWithToken.patch<PostType, AxiosResponse<PostType>, FormData>(
      this.path,
      updatePost.data,
      {
        headers: {
          "Content-type": "multipart/form-data",
        },
      }
    );
  };

  public delete = (postId: string) => {
    const path = this.path + "/" + postId;
    return APIWithToken.delete<void, AxiosResponse<void>, void>(path);
  };

  public blockPost = (postId: string) => {
    const path = this.path + "/block/" + postId;
    return APIWithToken.patch<void, AxiosResponse<void>, void>(path);
  };

  public likePost = (postId: string) => {
    const path = this.path + "/likes/" + postId;
    return APIWithToken.patch<PostType, AxiosResponse<PostType>, void>(path);
  };

  public dislikePost = (postId: string) => {
    const path = this.path + "/dislikes/" + postId;
    return APIWithToken.patch<PostType, AxiosResponse<PostType>, void>(path);
  };
}

export default new PostAPI();
