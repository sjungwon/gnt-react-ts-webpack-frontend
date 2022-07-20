import { ReactNode } from "react";
import { ProfileType } from "../../redux/modules/profile";
import NavLinkBlock from "../atoms/NavLinkBlock";
import styles from "./scss/ProfileBlock.module.scss";

interface PropsType {
  children?: ReactNode;
  profile: ProfileType | null;
  user?: {
    username: string;
    _id: string;
  };
  hideUsername?: true;
  disableNavigate?: true;
  size?: "md" | "lg";
  vertical?: true;
}

export default function ProfileBlock({
  profile,
  user,
  hideUsername,
  disableNavigate,
  children,
  size = "md",
  vertical,
}: PropsType) {
  if (!profile) {
    return (
      <>
        <img
          src={"/default_profile.png"}
          className={`${styles.profile_img} ${
            size === "lg" ? styles.profile_img_lg : ""
          } ${vertical ? styles.vertical : ""}`}
          alt="profile"
        />
        <div
          className={`${styles.profile_nickname} ${
            size === "lg" ? styles.profile_nickname_lg : ""
          }`}
        >
          {"삭제된 프로필"}
          {hideUsername ? null : (
            <span className={styles.profile_username}>{` (${
              user ? user.username : "유저 정보 없음"
            })`}</span>
          )}
          {children}
        </div>
      </>
    );
  }
  if (disableNavigate) {
    return (
      <>
        <img
          src={profile.profileImage.URL || "/default_profile.png"}
          className={`${styles.profile_img} ${
            size === "lg" ? styles.profile_img_lg : ""
          } ${vertical ? styles.vertical : ""}`}
          alt="profile"
        />
        <div
          className={`${styles.profile_nickname} ${
            size === "lg" ? styles.profile_nickname_lg : ""
          }`}
        >
          {profile.nickname}
          {hideUsername ? null : (
            <span
              className={styles.profile_username}
            >{` (${profile.user.username})`}</span>
          )}
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <NavLinkBlock to={`/profiles/${profile._id}`}>
        <img
          src={profile.profileImage.URL || "/default_profile.png"}
          className={`${styles.profile_img} ${
            size === "lg" ? styles.profile_img_lg : ""
          } ${vertical ? styles.vertical : ""}`}
          alt="profile"
          // onError={loadError}
        />
      </NavLinkBlock>
      <NavLinkBlock to={`/profiles/${profile._id}`}>
        <div
          className={`${styles.profile_nickname} ${
            size === "lg" ? styles.profile_nickname_lg : ""
          }`}
        >
          {profile.nickname}
          {hideUsername ? null : (
            <span
              className={styles.profile_username}
            >{` (${profile.user.username})`}</span>
          )}
        </div>
        {children}
      </NavLinkBlock>
    </>
  );
}
