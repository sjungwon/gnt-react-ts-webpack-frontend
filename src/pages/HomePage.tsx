import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import AddPostElement from "../components/molecules/AddPostElement";
import ProfileCard from "../components/molecules/ProfileCard";
import UserCard from "../components/molecules/UserCard";
import CategoryBar from "../components/organisms/CategoryBar";
import NavBar from "../components/organisms/NavBar";
import PostList from "../components/organisms/PostList";
import UserInfoBar from "../components/organisms/UserInfoBar";
import useScrollLock from "../hooks/useScrollLock";
import { RootState } from "../redux/store";

export default function HomePage() {
  const { scrollLock, scrollRelease } = useScrollLock();
  const [showCategory, setShowCategory] = useState<boolean>(false);
  const showCategoryHandler = useCallback(() => {
    setShowCategory((prev) => {
      if (prev) {
        scrollRelease();
      } else {
        scrollLock();
      }
      return !prev;
    });
  }, [scrollLock, scrollRelease]);

  return (
    <div>
      <NavBar showCategoryHandler={showCategoryHandler} />
      <CategoryBar show={true} />
      <UserInfoBar />
      <UserCard username={"heeho3"} />
      <ProfileCard searchProfile={"62cdc977a541e13dec5f70ae"} />
      <AddPostElement />
      <PostList />
    </div>
  );
}
