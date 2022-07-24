import { AxiosResponse } from "axios";
import { TypedForm } from "../classes/TypedForm";
import { ProfileType } from "../redux/modules/profile";
import defaultAPI from "./default";

export interface CreateProfileReqType {
  category: string;
  nickname: string;
  profileImage?: File;
}

export interface UpdateProfileReqType {
  category: string;
  nickname: string;
  profileImage?: File | null;
}

class ProfileAPI {
  private readonly path = "/profiles";
  private readonly API = defaultAPI.API;
  private readonly APIWithToken = defaultAPI.APIWithToken;

  //GET 프로필 (전체)
  public readonly get = (userCredential: string, type: "id" | "username") => {
    const profilesPath = this.path + `/${type}/` + userCredential;
    return this.API.get<ProfileType[], AxiosResponse<ProfileType[]>, void>(
      profilesPath
    );
  };

  //GET 프로필 (ID에 맞는 단일)
  public readonly getById = (profileId: string) => {
    const profilePath = this.path + "/" + profileId;
    return this.API.get<ProfileType, AxiosResponse<ProfileType>, void>(
      profilePath
    );
  };

  //POST 프로필 생성
  public readonly create = (profileData: TypedForm<CreateProfileReqType>) => {
    return this.APIWithToken.post<
      ProfileType,
      AxiosResponse<ProfileType>,
      FormData
    >(this.path, profileData.data, {
      headers: {
        "Content-type": "multipart/form-data",
      },
    });
  };

  //PATCH 프로필 수정
  public readonly update = (
    profileId: string,
    profileData: TypedForm<UpdateProfileReqType>
  ) => {
    const updatePath = this.path + "/" + profileId;
    return this.APIWithToken.patch<
      ProfileType,
      AxiosResponse<ProfileType>,
      FormData
    >(updatePath, profileData.data, {
      headers: {
        "Content-type": "multipart/form-data",
      },
    });
  };

  //DELETE 프로필 제거
  public readonly delete = (profileId: string) => {
    const deletePath = this.path + "/" + profileId;
    return this.APIWithToken.delete<
      ProfileType,
      AxiosResponse<ProfileType>,
      void
    >(deletePath);
  };
}

const profileAPI = new ProfileAPI();

export default profileAPI;
