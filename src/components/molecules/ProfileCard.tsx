import { Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { ProfileType } from "../../redux/modules/profile";
// import ImageSlide from "./ImageSlide";
import styles from "./scss/ProfileCard.module.scss";

interface PropsType {
  profile: ProfileType;
}

export default function ProfileCard({ profile }: PropsType) {
  return (
    <Card className={styles.container}>
      <Card.Header>
        <Card.Title className={styles.title}>프로필 정보</Card.Title>
      </Card.Header>
      <Card.Body className={styles.body_container}>
        <div className={styles.img_container}>
          <img
            src={profile.profileImage.URL || "/default_profile.png"}
            alt="프로필 이미지"
            className={styles.profile_img}
          />
        </div>
        <Card.Title className={styles.title_nickname}>
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
              to={`/categories/${profile.category.title}`}
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
