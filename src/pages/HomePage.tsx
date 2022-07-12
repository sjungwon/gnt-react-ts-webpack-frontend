import UserCard from "../components/molecules/UserCard";
import CategoryBar from "../components/organisms/CategoryBar";
import UserInfoBar from "../components/organisms/UserInfoBar";

export default function HomePage() {
  return (
    <div>
      <CategoryBar show={true} />
      <UserInfoBar />
      <UserCard username={"heeho3"} />
    </div>
  );
}
