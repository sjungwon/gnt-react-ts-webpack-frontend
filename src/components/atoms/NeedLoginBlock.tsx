import { FC, ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import styles from "./scss/NeedLoginBlock.module.scss";

interface PropsType {
  children: ReactNode;
  requiredMessage?: string;
}

const NeedLoginBlock: FC<PropsType> = ({ children, requiredMessage }) => {
  const username = useSelector((state: RootState) => state.auth.username);

  if (username) {
    return <>{children}</>;
  }

  return (
    <div className={styles.container}>
      {requiredMessage ? requiredMessage : ""} 로그인이 필요합니다.
    </div>
  );
};

export default NeedLoginBlock;
