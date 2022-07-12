import { AxiosResponse } from "axios";
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
  name: string;
}

export const addProfileAPI = (profileData: AddProfileReqType) => {
  return APIWithToken.post<
    ProfileType,
    AxiosResponse<ProfileType>,
    AddProfileReqType
  >(path, profileData);
};

export interface UpdateProfileReqType {
  name: string;
}

export const updateProfileAPI = (profileId: string, newProfileName: string) => {
  const updatePath = path + "/" + profileId;
  return APIWithToken.patch<
    ProfileType,
    AxiosResponse<ProfileType>,
    UpdateProfileReqType
  >(updatePath, { name: newProfileName });
};

export const deleteProfileAPI = (profileId: string) => {
  const deletePath = path + "/" + profileId;
  return APIWithToken.delete<ProfileType, AxiosResponse<ProfileType>, void>(
    deletePath
  );
};
