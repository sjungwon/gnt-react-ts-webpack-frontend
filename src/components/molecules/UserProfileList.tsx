import { FC, ReactNode, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import {
  clearModifyProfileStatus,
  deleteProfileThunk,
  ProfileType,
} from "../../redux/modules/profile";
import { AppDispatch, RootState } from "../../redux/store";
import DefaultButton from "../atoms/DefaultButton";
import AddProfileModal from "./AddProfileModal";
import ProfileBlock from "./ProfileBlock";
import RemoveConfirmModal from "./RemoveConfirmModal";
import styles from "./scss/UserProfileList.module.scss";

export default function UserProfileList() {
  const username = useSelector((state: RootState) => state.auth.username);
  const profiles = useSelector((state: RootState) => state.profile.profiles);

  const [showAdd, setShowAdd] = useState<boolean>(false);

  const openShowAdd = useCallback(() => {
    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    setShowAdd(true);
  }, [username]);

  const closeShowAdd = useCallback(() => {
    setShowAdd(false);
  }, []);

  return (
    <>
      <div className={styles.profile_list_container}>
        <div className={styles.title_container}>
          <h3 className={styles.title}>프로필</h3>
          <DefaultButton size="md" onClick={openShowAdd} disabled={!username}>
            프로필 추가
          </DefaultButton>
        </div>
        <AddProfileModal show={showAdd} close={closeShowAdd} />
        <CategorizedProfileList profileArr={profiles} />
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
      <p className={styles.profile_category_title}>
        {profileArr.length ? profileArr[0].category.title : null}
      </p>
      <ul className={styles.profile_container}>
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
  const dispatch = useDispatch<AppDispatch>();

  const [showUpdate, setShowUpdate] = useState<boolean>(false);

  const showUpdateOpen = useCallback(() => {
    setShowUpdate(true);
  }, []);

  const showUpdateClose = useCallback(() => {
    setShowUpdate(false);
  }, []);

  const [showRemoveMd, setShowRemoveMd] = useState<boolean>(false);
  const removeMdOpen = useCallback(() => {
    dispatch(clearModifyProfileStatus());
    setShowRemoveMd(true);
  }, [dispatch]);
  const removeMdClose = useCallback(() => {
    setShowRemoveMd(false);
  }, []);
  const modifyProfileStatus = useSelector(
    (state: RootState) => state.profile.modifyProfileStatus
  );
  const deleteProfile = useCallback(() => {
    dispatch(deleteProfileThunk(profile._id));
  }, [dispatch, profile._id]);

  const RemoveMessage = () => {
    return (
      <p className={styles.warning}>
        프로필 제거 시 다른 데이터에 반영하기 위해 페이지가 새로고침됩니다.
      </p>
    );
  };

  return (
    <li className={styles.profile_block}>
      <NavLink to={`/profiles/${profile._id}`} className={styles.profile}>
        <ProfileBlock profile={profile} hideUsername disableNavigate />
      </NavLink>
      <div className={styles.profile_btns}>
        <DefaultButton
          size="xs"
          className={styles.btn_margin}
          onClick={showUpdateOpen}
        >
          수정
        </DefaultButton>
        <AddProfileModal
          show={showUpdate}
          close={showUpdateClose}
          prevData={profile}
        />
        <DefaultButton size="xs" onClick={removeMdOpen}>
          삭제
        </DefaultButton>
        <RemoveConfirmModal
          show={showRemoveMd}
          loading={modifyProfileStatus === "pending"}
          remove={deleteProfile}
          close={removeMdClose}
          customMessage={<RemoveMessage />}
        />
      </div>
    </li>
  );
};
