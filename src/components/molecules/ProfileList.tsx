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

//카테고리 별로 프로필 모아서 렌더
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
              //마지막 프로필인 경우
              if (
                i > 0 &&
                origArr[i].category.title !== origArr[i - 1].category.title
              ) {
                //마지막 요소가 카테고리가 다른 경우
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
              //마지막 요소도 카테고리가 이전 요소와 동일한 경우
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
              //카테고리가 달라진 경우
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
            //카테고리가 동일한 경우
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

//카테고리 + 카테고리에 포함된 프로필 리스트
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

//단일 프로필
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
