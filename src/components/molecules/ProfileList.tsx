import { FC, ReactNode } from "react";
import styles from "./scss/ProfileList.module.scss";
import { NavLink } from "react-router-dom";
import ProfileBlock from "./ProfileBlock";
import { ProfileType } from "../../redux/modules/profile";

interface PropsType {
  profileArr: ProfileType[];
}

export default function ProfileList({ profileArr }: PropsType) {
  return (
    <>
      <div className={styles.profile_list_container}>
        <div className={styles.title_container}>
          <h3 className={styles.title}>
            {profileArr.length ? "프로필" : "프로필 없음"}
          </h3>
        </div>
        {profileArr.length ? (
          <CategorizedProfileList profileArr={profileArr} />
        ) : null}
      </div>
    </>
  );
}

const CategorizedProfileList: FC<{
  profileArr: ProfileType[];
}> = ({ profileArr }) => {
  return (
    <>
      {
        profileArr.reduce(
          (
            total: { node: ReactNode[]; profileArr: ProfileType[] },
            profile: ProfileType,
            i: number,
            origArr: ProfileType[]
          ) => {
            if (i === profileArr.length - 1) {
              if (
                i > 0 &&
                origArr[i].category.title !== origArr[i - 1].category.title
              ) {
                const ulEl = (
                  <ProfileWithMenu
                    profileArr={[...total.profileArr]}
                    key={total.profileArr[0]._id}
                  />
                );
                const myUlEl = (
                  <ProfileWithMenu profileArr={[profile]} key={profile._id} />
                );
                return {
                  node: [...total.node, ulEl, myUlEl],
                  profileArr: [],
                };
              }
              const ulEl = (
                <ProfileWithMenu
                  profileArr={[...total.profileArr, profile]}
                  key={profile._id}
                />
              );
              return {
                node: [...total.node, ulEl],
                profileArr: [],
              };
            }
            if (
              i !== 0 &&
              origArr[i].category.title !== origArr[i - 1].category.title
            ) {
              const ulEl = (
                <ProfileWithMenu
                  profileArr={total.profileArr}
                  key={total.profileArr[0]._id}
                />
              );
              return {
                node: [...total.node, ulEl],
                profileArr: [profile],
              };
            }
            return {
              ...total,
              profileArr: [...total.profileArr, profile],
            };
          },
          { node: [], profileArr: [] }
        ).node
      }
    </>
  );
};

const ProfileWithMenu: FC<{
  profileArr: ProfileType[];
}> = ({ profileArr }) => {
  return (
    <>
      <p className={styles.profile_category_title_other}>
        {profileArr.length ? profileArr[0].category.title : null}
      </p>
      <ul className={styles.profile_container_other}>
        {profileArr.map((profile) => (
          <ProfileLiEl profile={profile} key={profile._id} />
        ))}
      </ul>
    </>
  );
};

const ProfileLiEl: FC<{
  profile: ProfileType;
}> = ({ profile }) => {
  return (
    <li className={styles.profile_block_other}>
      <NavLink to={`/profiles/${profile._id}`} className={styles.profile_other}>
        <ProfileBlock profile={profile} hideUsername disableNavigate vertical />
      </NavLink>
    </li>
  );
};
