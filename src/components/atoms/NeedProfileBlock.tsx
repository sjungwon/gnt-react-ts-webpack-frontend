import { FC, ReactNode, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import CreateProfileModal from "../molecules/CreateProfileModal";
import DefaultButton from "./DefaultButton";
import styles from "./scss/NeedProfileBlock.module.scss";

interface PropsType {
  children: ReactNode;
  requiredMessage?: string;
  categoryTitle: string;
}

//프로필이 필요한 경우 프로필 필요 메세지와 추가 버튼 반환
const NeedProfileBlock: FC<PropsType> = ({
  children,
  requiredMessage,
  categoryTitle,
}) => {
  const profiles = useSelector((state: RootState) => state.profile.profiles);
  const filteredProfiles = profiles.filter(
    (profile) => profile.category.title === categoryTitle
  );

  const [mdShow, setMdShow] = useState<boolean>(false);
  const openMd = useCallback(() => {
    setMdShow(true);
  }, []);
  const closeMd = useCallback(() => {
    setMdShow(false);
  }, []);

  if (filteredProfiles.length) {
    return <>{children}</>;
  }

  return (
    <div className={styles.container}>
      {requiredMessage ? requiredMessage : ""} 프로필을 추가해주세요.
      <DefaultButton size="md" onClick={openMd} className={styles.add_profile}>
        프로필 추가
      </DefaultButton>
      <CreateProfileModal
        show={mdShow}
        close={closeMd}
        categoryTitle={categoryTitle}
      />
    </div>
  );
};

export default NeedProfileBlock;
