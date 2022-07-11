import CategoryBar from "../components/organisms/CategoryBar";
import UserInfoBar from "../components/organisms/UserInfoBar";

export default function HomePage() {
  return (
    <div>
      <CategoryBar show={true} />
      <UserInfoBar />
    </div>
  );
}
