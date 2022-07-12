import { ReactNode } from "react";
import { ProfileType } from "../../redux/modules/profile";
import NavLinkBlock from "../atoms/NavLinkBlock";
import styles from "./scss/ProfileBlock.module.scss";

interface PropsType {
  children?: ReactNode;
  profile: ProfileType;
  hideUsername?: true;
  disableNavigate?: true;
  size?: "md" | "lg";
  vertical?: true;
}

export default function ProfileBlock({
  profile,
  hideUsername,
  disableNavigate,
  children,
  size = "md",
  vertical,
}: PropsType) {
  // const profileImage = useProfileImage(profile.profileImage);

  // const loadError = useImgLoadError();

  if (disableNavigate) {
    return (
      <>
        <img
          src={"/default_profile.png"}
          className={`${styles.profile_img} ${vertical ? styles.vertical : ""}`}
          alt="profile"
          // onError={loadError}
        />
        <div className={styles.profile_nickname}>
          {profile.name}
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
          src={"/default_profile.png"}
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
          {profile.name}
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
