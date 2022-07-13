import ProfileCard from "../components/molecules/ProfileCard";
import UserCard from "../components/molecules/UserCard";
import CategoryBar from "../components/organisms/CategoryBar";
import UserInfoBar from "../components/organisms/UserInfoBar";

export default function HomePage() {
  return (
    <div>
      <CategoryBar show={true} />
      <UserInfoBar />
      <UserCard username={"heeho3"} />
      <ProfileCard searchProfile={"62cdc977a541e13dec5f70ae"} />
    </div>
  );
}
