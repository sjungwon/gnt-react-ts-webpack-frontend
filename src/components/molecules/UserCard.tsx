import { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { getProfilesAPI } from "../../apis/profile";
import { ProfileType } from "../../redux/modules/profile";
import ProfileList from "./ProfileList";
import styles from "./scss/UserCard.module.scss";

interface PropsType {
  username: string;
}

export default function UserCard({ username }: PropsType) {
  const [profiles, setProfiles] = useState<ProfileType[] | null>(null);

  const getProfile = useCallback(async () => {
    try {
      const response = await getProfilesAPI(
        encodeURIComponent(username),
        "username"
      );
      setProfiles(response.data);
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        window.alert(
          `${username}의 데이터를 가져오는데 오류가 발생했습니다. 다시 시도해주세요.`
        );
      }
    }
  }, [username]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  return (
    <Card className={styles.container}>
      <Card.Header>
        <Card.Title className={styles.title}>{username}</Card.Title>
      </Card.Header>
      <Card.Body className={styles.body_container}>
        {profiles ? (
          <ProfileList profileArr={profiles ? profiles : []} />
        ) : (
          <p className={styles.no_user}>존재하지 않는 사용자</p>
        )}
      </Card.Body>
    </Card>
  );
}
