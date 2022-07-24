import { AxiosResponse } from "axios";
import { TypedForm } from "../classes/TypedForm";
import { ImageType } from "../components/molecules/ImageSlide";
import { PostType } from "../redux/modules/post";
import defaultAPI from "./default";

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
  private readonly API = defaultAPI.API;
  private readonly APIWithToken = defaultAPI.APIWithToken;

  //GET 포스트 (최신 포스트 6개)
  public readonly get = (lastPostDate?: string) => {
    const path = this.path + "?last=" + (lastPostDate || "");
    return this.API.get<PostType[], AxiosResponse<PostType[]>, void>(path);
  };

  //GET 포스트 (카테고리별 포스트 6개)
  public readonly getByCategoryId = (data: {
    categoryId: string;
    lastPostDate?: string;
  }) => {
    const path =
      this.path +
      "/categories/" +
      data.categoryId +
      "?last=" +
      (data.lastPostDate || "");
    return this.API.get<PostType[], AxiosResponse<PostType[]>, void>(path);
  };

  //GET 포스트 (프로필에 맞는 포스트 6개)
  public readonly getByProfileId = (data: {
    profileId: string;
    lastPostDate?: string;
  }) => {
    const path =
      this.path +
      "/profiles/" +
      data.profileId +
      "?last=" +
      (data.lastPostDate || "");
    return this.API.get<PostType[], AxiosResponse<PostType[]>, void>(path);
  };

  //GET 포스트 (유저 이름에 맞는 포스트 6개)
  public readonly getByUsername = (data: {
    username: string;
    lastPostDate?: string;
  }) => {
    const path =
      this.path +
      "/users/" +
      encodeURIComponent(data.username) +
      "?last=" +
      (data.lastPostDate || "");
    return this.API.get<PostType[], AxiosResponse<PostType[]>, void>(path);
  };

  //POST 포스트 생성
  public readonly create = (newPost: TypedForm<AddPostReqType>) => {
    return this.APIWithToken.post<PostType, AxiosResponse<PostType>, FormData>(
      this.path,
      newPost.data,
      {
        headers: {
          "Content-type": "multipart/form-data",
        },
      }
    );
  };

  //PATCH 포스트 수정
  public readonly update = (updatePost: TypedForm<UpdatePostReqType>) => {
    return this.APIWithToken.patch<PostType, AxiosResponse<PostType>, FormData>(
      this.path,
      updatePost.data,
      {
        headers: {
          "Content-type": "multipart/form-data",
        },
      }
    );
  };

  //DELETE 포스트 제거
  public readonly delete = (postId: string) => {
    const path = this.path + "/" + postId;
    return this.APIWithToken.delete<void, AxiosResponse<void>, void>(path);
  };

  //PATCH 포스트 차단
  public readonly block = (postId: string) => {
    const path = this.path + "/block/" + postId;
    return this.APIWithToken.patch<void, AxiosResponse<void>, void>(path);
  };

  //PATCH 포스트 좋아요
  public readonly like = (postId: string) => {
    const path = this.path + "/likes/" + postId;
    return this.APIWithToken.patch<PostType, AxiosResponse<PostType>, void>(
      path
    );
  };

  //PATCH 포스트 싫어요
  public readonly dislike = (postId: string) => {
    const path = this.path + "/dislikes/" + postId;
    return this.APIWithToken.patch<PostType, AxiosResponse<PostType>, void>(
      path
    );
  };
}

const postAPI = new PostAPI();

export default postAPI;
