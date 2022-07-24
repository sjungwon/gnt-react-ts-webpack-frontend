import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import CreatePostElement from "../components/molecules/CreatePostElement";
import CategoryCard from "../components/molecules/CategoryCard";
import InfoCard from "../components/molecules/InfoCard";
import PostList from "../components/organisms/PostList";
import { setCurrentCategoryByTitle } from "../redux/modules/category";
import { AppDispatch } from "../redux/store";
import HomePage from "./HomePage";

export default function CategoryPage() {
  const params = useParams();

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setCurrentCategoryByTitle(params.title ? params.title : ""));
  }, [dispatch, params]);

  if (!params.title) {
    return <HomePage />;
  }

  return (
    <>
      <InfoCard text={params.title} />
      <CategoryCard title={params.title} />
      <CreatePostElement categoryTitle={params.title} />
      <PostList type={"category"} params={params.title} />
    </>
  );
}
