import { AxiosResponse } from "axios";
import { CategoryType } from "../redux/modules/category";
import { API, APIWithToken } from "./basic";

const path = "/categories";

export const getCategoryAPI = async () => {
  return API.get<CategoryType[], AxiosResponse<CategoryType[]>, void>(path);
};

export const getCategoryByTitle = async (title: string) => {
  const path = "/categories/" + encodeURIComponent(title);
  return API.get<CategoryType, AxiosResponse<CategoryType>, void>(path);
};

interface AddCategoryReqType {
  title: string;
}

export const addCategoryAPI = async (newCategory: string) => {
  return APIWithToken.post<
    CategoryType,
    AxiosResponse<CategoryType>,
    AddCategoryReqType
  >(path, {
    title: newCategory,
  });
};
