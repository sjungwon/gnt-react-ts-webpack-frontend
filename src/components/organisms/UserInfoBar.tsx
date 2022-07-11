import styles from "./scss/UserInfoBar.module.scss";
import ProfileList from "../molecules/ProfileList";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export default function UserInfoBar() {
  const profiles = useSelector((state: RootState) => state.profile.profiles);

  return (
    <div className={styles.container}>
      <ProfileList profileArr={profiles} />
    </div>
  );
}
