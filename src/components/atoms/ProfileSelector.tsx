import { useCallback, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useSelector } from "react-redux";
import { ProfileType } from "../../redux/modules/profile";
import { RootState } from "../../redux/store";
import styles from "./scss/Selector.module.scss";

interface PropsType {
  size?: "sm" | "lg";
  setCurrentProfile: (profile: ProfileType) => void;
}

export default function ProfileSelector({
  size,
  setCurrentProfile,
}: PropsType) {
  const profiles = useSelector((state: RootState) => state.profile.profiles);
  const currentCategoryTitle = useSelector(
    (state: RootState) => state.category.currentCategoryTitle
  );

  const [filteredProfiles, setFilteredProfiles] = useState<ProfileType[]>([]);
  useEffect(() => {
    const filteredProfileArr =
      currentCategoryTitle === "all"
        ? profiles
        : profiles.filter(
            (profile) => profile.category.title === currentCategoryTitle
          );
    setFilteredProfiles(filteredProfileArr);
  }, [currentCategoryTitle, profiles]);

  const onSelectHandler = useCallback(
    (eventKey: string | null) => {
      if (eventKey !== null && filteredProfiles.length) {
        setCurrentProfile(filteredProfiles[parseInt(eventKey)]);
      }
    },
    [filteredProfiles, setCurrentProfile]
  );

  return (
    <Dropdown onSelect={onSelectHandler}>
      <Dropdown.Toggle
        size={size}
        id="dropdown-profile"
        title="프로필"
        disabled={!filteredProfiles.length}
      >
        프로필 선택
        <Dropdown.Menu>
          {filteredProfiles.map((profile, index) => {
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
