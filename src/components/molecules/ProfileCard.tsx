import { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { getProfileByIdAPI } from "../../apis/profile";
import { ProfileType } from "../../redux/modules/profile";
// import ImageSlide from "./ImageSlide";
import styles from "./scss/ProfileCard.module.scss";

interface PropsType {
  searchProfile: string;
}

const initialProfile: ProfileType = {
  _id: "",
  nickname: "",
  user: {
    username: "",
    _id: "",
  },
  category: {
    title: "",
    _id: "",
  },
  profileImage: {
    URL: "",
    Key: "",
  },
};

export default function ProfileCard({ searchProfile }: PropsType) {
  const [profile, setProfile] = useState<ProfileType>(initialProfile);
  // const [credentialImage, setCredentialImage] = useState<string>("");

  const getProfile = useCallback(async () => {
    if (!searchProfile) {
      return;
    }
    try {
      const response = await getProfileByIdAPI(searchProfile);
      if (response.data?._id) {
        setProfile(response.data);
      }
    } catch (err) {
      window.alert("프로필 데이터를 가져오는데 오류가 발생했습니다.");
    }
  }, [searchProfile]);

  useEffect(() => {
    getProfile();
    // if (searchProfile.credential) {
    //   getImage(
    //     searchProfile.credential,
    //     "인증 이미지를 가져오는 중에 오류가 발생했습니다. 다시 시도해주세요.",
    //     "credential"
    //   );
    // }
  }, [getProfile]);

  return (
    <Card className={styles.container}>
      <Card.Body className={styles.body_container}>
        <div className={styles.img_container}>
          <img
            src={profile.profileImage.URL || "/default_profile.png"}
            alt="프로필 이미지"
            className={styles.profile_img}
          />
        </div>
        <Card.Title className={styles.title}>
          {profile.nickname !== "삭제된 프로필" ? "닉네임:" : ""}{" "}
          {profile.nickname}
        </Card.Title>
        <Card.Subtitle className={styles.subtitle}>
          사용자 이름:{" "}
          {profile.user.username ? (
            <NavLink
              to={`/usernames/${profile.user.username}`}
              className={styles.subtitle_link}
            >
              {profile.user.username}
            </NavLink>
          ) : null}
        </Card.Subtitle>
        <Card.Subtitle className={styles.subtitle}>
          게임 :{" "}
          {profile.category.title ? (
            <NavLink
              to={`/games/${profile.category.title}`}
              className={styles.subtitle_link}
            >
              {profile.category.title}
            </NavLink>
          ) : null}
        </Card.Subtitle>
        {/* <div className={styles.credentials}>
          <p className={styles.credentials_text}>인증 정보</p>
          {credentialImage ? (
            <ImageSlide images={[credentialImage]} expandable noIndicator />
          ) : (
            <p className={styles.credentials_text}>없음</p>
          )}
        </div> */}
      </Card.Body>
    </Card>
  );
}
