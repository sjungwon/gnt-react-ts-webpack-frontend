import { FC, ReactNode, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import AddProfileModal from "../molecules/AddProfileModal";
import DefaultButton from "./DefaultButton";
import styles from "./scss/NeedProfileBlock.module.scss";

interface PropsType {
  children: ReactNode;
  requiredMessage?: string;
  category: string;
}

const NeedProfileBlock: FC<PropsType> = ({
  children,
  requiredMessage,
  category,
}) => {
  const profiles = useSelector((state: RootState) => state.profile.profiles);
  const filteredProfiles = profiles.filter(
    (profile) => profile.category.title === category
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
      <AddProfileModal show={mdShow} close={closeMd} />
    </div>
  );
};

export default NeedProfileBlock;
