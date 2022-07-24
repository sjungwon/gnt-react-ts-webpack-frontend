import { AxiosResponse } from "axios";
import { CategoryType } from "../redux/modules/category";
import defaultAPI from "./default";

// const path = "/categories";

interface CreateCategoryReqType {
  title: string;
}

class CategoryAPI {
  private path = "/categories";
  private API = defaultAPI.API;
  private APIWithToken = defaultAPI.APIWithToken;

  //GET 카테고리 (전체)
  public readonly get = () => {
    return this.API.get<CategoryType[], AxiosResponse<CategoryType[]>, void>(
      this.path
    );
  };

  //GET 카테고리 (title -> 단일카테고리)
  public readonly getByTitle = (title: string) => {
    const path = "/categories/" + encodeURIComponent(title);
    return this.API.get<CategoryType, AxiosResponse<CategoryType>, void>(path);
  };

  //POST 카테고리 생성
  public readonly create = (newCategory: string) => {
    return this.APIWithToken.post<
      CategoryType,
      AxiosResponse<CategoryType>,
      CreateCategoryReqType
    >(this.path, {
      title: newCategory,
    });
  };

  //DELETE 카테고리 제거
  public readonly delete = (categoryId: string) => {
    const path = "/categories/" + categoryId;
    return this.APIWithToken.delete<void, AxiosResponse<void>>(path);
  };
}

const categoryAPI = new CategoryAPI();

export default categoryAPI;
