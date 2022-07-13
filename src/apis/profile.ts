import { AxiosResponse } from "axios";
import { TypedForm } from "../classes/TypedForm";
import { ProfileType } from "../redux/modules/profile";
import { API, APIWithToken } from "./basic";

const path = "/profiles";

export const getProfilesAPI = (
  userCredential: string,
  type: "id" | "username"
) => {
  const profilesPath = path + `/${type}/` + userCredential;
  return API.get<ProfileType[], AxiosResponse<ProfileType[]>, void>(
    profilesPath
  );
};

export interface AddProfileReqType {
  category: string;
  nickname: string;
  profileImage?: File;
}

export const getProfileByIdAPI = (profileId: string) => {
  const profilePath = path + "/" + profileId;
  return API.get<ProfileType, AxiosResponse<ProfileType>, void>(profilePath);
};

export const addProfileAPI = (profileData: TypedForm<AddProfileReqType>) => {
  return APIWithToken.post<ProfileType, AxiosResponse<ProfileType>, FormData>(
    path,
    profileData.data,
    {
      headers: {
        "Content-type": "multipart/form-data",
      },
    }
  );
};

export interface UpdateProfileReqType {
  category: string;
  nickname: string;
  profileImage?: File | null;
}

export const updateProfileAPI = (
  profileId: string,
  profileData: TypedForm<UpdateProfileReqType>
) => {
  const updatePath = path + "/" + profileId;
  return APIWithToken.patch<ProfileType, AxiosResponse<ProfileType>, FormData>(
    updatePath,
    profileData.data,
    {
      headers: {
        "Content-type": "multipart/form-data",
      },
    }
  );
};

export const deleteProfileAPI = (profileId: string) => {
  const deletePath = path + "/" + profileId;
  return APIWithToken.delete<ProfileType, AxiosResponse<ProfileType>, void>(
    deletePath
  );
};
