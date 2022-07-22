import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AddPostElement from "../components/molecules/AddPostElement";
import InfoCard from "../components/molecules/InfoCard";
import UserCard from "../components/molecules/UserCard";
import PostList from "../components/organisms/PostList";
import { setCurrentCategoryByTitle } from "../redux/modules/category";
import { AppDispatch, RootState } from "../redux/store";
import HomePage from "./HomePage";

export default function UserPage() {
  const params = useParams();

  const username = useSelector((state: RootState) => state.auth.username);

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(setCurrentCategoryByTitle(""));
  }, [dispatch]);

  if (!params.username) {
    return <HomePage />;
  }

  return (
    <>
      <InfoCard text={params.username} />
      {username === params.username ? (
        <AddPostElement category="" />
      ) : (
        <UserCard username={params.username} />
      )}
      <PostList type="username" params={params.username} />
    </>
  );
}
