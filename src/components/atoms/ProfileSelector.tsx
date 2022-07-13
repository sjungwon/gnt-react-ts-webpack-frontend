import { Dropdown } from "react-bootstrap";
import { ProfileType } from "../../redux/modules/profile";
import styles from "./scss/Selector.module.scss";

interface PropsType {
  size?: "sm" | "lg";
  onSelect: (eventKey: string | null) => void;
  profileArr: ProfileType[];
}

export default function ProfileSelector({
  size,
  onSelect,
  profileArr,
}: PropsType) {
  return (
    <Dropdown onSelect={onSelect}>
      <Dropdown.Toggle
        size={size}
        id="dropdown-profile"
        title="프로필"
        disabled={!profileArr.length}
      >
        프로필 선택
        <Dropdown.Menu>
          {profileArr.map((profile, index) => {
            return (
              <Dropdown.Item
                key={profile.category.title + profile.nickname}
                eventKey={index}
                className={styles.item}
              >
                {profile.category.title} - {profile.nickname}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Toggle>
    </Dropdown>
  );
}
