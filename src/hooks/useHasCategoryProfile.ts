import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function useHasCategoryProfile(category: string) {
  const profile = useSelector((state: RootState) => state.profile.profiles);

  return !!profile.find((profile) => profile.category.title === category);
}
