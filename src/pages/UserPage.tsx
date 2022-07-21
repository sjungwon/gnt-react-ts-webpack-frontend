import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AddPostElement from "../components/molecules/AddPostElement";
import InfoCard from "../components/molecules/InfoCard";
import UserCard from "../components/molecules/UserCard";
import PostList from "../components/organisms/PostList";
import { RootState } from "../redux/store";
import HomePage from "./HomePage";

export default function UserPage() {
  const params = useParams();

  const username = useSelector((state: RootState) => state.auth.username);

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
