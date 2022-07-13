import styles from "./scss/UserInfoBar.module.scss";
import UserProfileList from "../molecules/UserProfileList";

export default function UserInfoBar() {
  return (
    <div className={styles.container}>
      <UserProfileList />
    </div>
  );
}
