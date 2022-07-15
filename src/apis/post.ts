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

export class PostAPI {
  private path: string = "/posts";

  public get = () => {
    return API.get<PostType[], AxiosResponse<PostType[]>, void>(this.path);
  };

  public create = (newPost: TypedForm<AddPostReqType>) => {
    return APIWithToken.post(this.path, newPost.data, {
      headers: {
        "Content-type": "multipart/form-data",
      },
    });
  };

  public update = (updatePost: TypedForm<UpdatePostReqType>) => {
    return APIWithToken.patch(this.path, updatePost.data, {
      headers: {
        "Content-type": "multipart/form-data",
      },
    });
  };

  public delete = (postId: string) => {
    const path = this.path + "/" + postId;
    return APIWithToken.delete<void, AxiosResponse<void>, void>(path);
  };
}
