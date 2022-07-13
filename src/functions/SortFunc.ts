import { CategoryType } from "../redux/modules/category";
import { ProfileType } from "../redux/modules/profile";

export const SortCategory = (categories: CategoryType[]) => {
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.title < b.title) {
      return -1;
    } else if (a.title > b.title) {
      return 1;
    } else {
      return 0;
    }
  });

  return sortedCategories;
};

export const SortProfiles = (profiles: ProfileType[]) => {
  return [...profiles].sort((a, b) => {
    if (a.category.title < b.category.title) {
      return -1;
    } else if (a.category.title > b.category.title) {
      return 1;
    } else {
      if (a.nickname < b.nickname) {
        return -1;
      } else if (a.nickname > b.nickname) {
        return 1;
      } else {
        return 0;
      }
    }
  });
};
