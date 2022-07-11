import { FC, ReactNode, useCallback, useState } from "react";
import styles from "./scss/ProfileList.module.scss";
import { NavLink } from "react-router-dom";
import ProfileBlock from "./ProfileBlock";
import DefaultButton from "../atoms/DefaultButton";
import {
  clearModifyId,
  deleteProfileThunk,
  ProfileType,
  setModifyId,
} from "../../redux/modules/profile";
import { useDispatch, useSelector } from "react-redux";
import { AppDispath, RootState } from "../../redux/store";
import AddProfileModal from "./AddProfileModal";
import RemoveConfirmModal from "./RemoveConfirmModal";

interface PropsType {
  profileArr: ProfileType[];
}

export default function ProfileList({ profileArr }: PropsType) {
  const username = useSelector((state: RootState) => state.auth.username);

  const profileUsername: boolean | string =
    !!profileArr.length && profileArr[0].user.username;

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
        <CategorizedProfileList
          profileArr={profileArr}
          owner={username === profileUsername}
        />
      </div>
    </>
  );
}

const CategorizedProfileList: FC<{
  profileArr: ProfileType[];
  owner: boolean;
}> = ({ profileArr, owner }) => {
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
                    owner={owner}
                  />
                );
                const myUlEl = (
                  <ProfileWithMenu
                    profileArr={[profile]}
                    owner={owner}
                    key={profile._id}
                  />
                );
                return {
                  node: [...total.node, ulEl, myUlEl],
                  profileArr: [],
                };
              }
              const ulEl = (
                <ProfileWithMenu
                  profileArr={[...total.profileArr, profile]}
                  owner={owner}
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
                  owner={owner}
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
  owner: boolean;
}> = ({ profileArr, owner }) => {
  return (
    <>
      <p
        className={
          owner
            ? styles.profile_category_title
            : styles.profile_category_title_other
        }
      >
        {profileArr.length ? profileArr[0].category.title : null}
      </p>
      <ul
        className={
          owner ? styles.profile_container : styles.profile_container_other
        }
      >
        {profileArr.map((profile) => (
          <ProfileLiEl profile={profile} owner={owner} key={profile._id} />
        ))}
      </ul>
    </>
  );
};

const ProfileLiEl: FC<{
  profile: ProfileType;
  owner: boolean;
}> = ({ profile, owner }) => {
  const dispatch = useDispatch<AppDispath>();

  const [showUpdate, setShowUpdate] = useState<boolean>(false);

  const showUpdateOpen = useCallback(() => {
    dispatch(setModifyId(profile._id));
    setShowUpdate(true);
  }, [dispatch, profile._id]);

  const showUpdateClose = useCallback(() => {
    dispatch(clearModifyId());
    setShowUpdate(false);
  }, [dispatch]);

  const [showRemoveMd, setShowRemoveMd] = useState<boolean>(false);
  const removeMdOpen = useCallback(() => {
    dispatch(setModifyId(profile._id));
    setShowRemoveMd(true);
  }, [dispatch, profile._id]);
  const removeMdClose = useCallback(() => {
    dispatch(clearModifyId());
    setShowRemoveMd(false);
  }, [dispatch]);
  const modifyStatus = useSelector(
    (state: RootState) => state.profile.modifyStatus[profile._id]
  );
  const deleteProfile = useCallback(() => {
    dispatch(deleteProfileThunk(profile._id));
  }, [dispatch, profile._id]);

  return (
    <li className={owner ? styles.profile_block : styles.profile_block_other}>
      <NavLink
        to={`/profiles/${profile._id}`}
        className={owner ? styles.profile : styles.profile_other}
      >
        <ProfileBlock profile={profile} hideUsername disableNavigate />
      </NavLink>
      {owner ? (
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
            loading={modifyStatus === "pending"}
            remove={deleteProfile}
            close={removeMdClose}
            customMessage={<RemoveMessage />}
          />
        </div>
      ) : null}
    </li>
  );
};

const RemoveMessage = () => {
  return (
    <p className={styles.warning}>
      프로필 제거 시 다른 데이터에 반영하기 위해 페이지가 새로고침됩니다.
    </p>
  );
};
