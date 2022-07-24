import { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import profilesAPI from "../../apis/profile";
import { ProfileType } from "../../redux/modules/profile";
import ProfileList from "./ProfileList";
import styles from "./scss/UserCard.module.scss";

interface PropsType {
  username: string;
}

//유저 정보 출력 카드 - 현재 로그인 유저가 아닐 수 있음
export default function UserCard({ username }: PropsType) {
  const [profiles, setProfiles] = useState<ProfileType[] | null>([]);

  //GET 프로필 데이터
  const getProfile = useCallback(async () => {
    try {
      const response = await profilesAPI.get(
        encodeURIComponent(username),
        "username"
      );
      setProfiles(response.data);
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        //프로필 데이터 가져오는 중 오류난 경우
        window.alert(
          `${username}의 데이터를 가져오는데 오류가 발생했습니다. 다시 시도해주세요.`
        );
        setProfiles([]);
        return;
      }
      //존재하지 않는 유저인 경우
      setProfiles(null);
    }
  }, [username]);

  useEffect(() => {
    getProfile();
  }, [getProfile, username]);

  return (
    <Card className={styles.container}>
      <Card.Header>
        <Card.Title className={styles.title}>유저 정보</Card.Title>
      </Card.Header>
      <Card.Body className={styles.body_container}>
        <Card.Title className={styles.title_username}>{username}</Card.Title>
        {profiles ? (
          <ProfileList profileArr={profiles ? profiles : []} />
        ) : (
          <p className={styles.no_user}>존재하지 않는 사용자</p>
        )}
      </Card.Body>
    </Card>
  );
}
