import { FC, MouseEventHandler } from "react";
import { ChildProps } from "../../types/props.type";
import styles from "./scss/MobileButton.module.scss";

interface PropsType extends ChildProps {
  onClick: MouseEventHandler;
  className?: string;
}

//모바일에서만 보이는 버튼
const MobileButton: FC<PropsType> = ({ children, onClick, className }) => {
  return (
    <button
      className={`${styles.btn} ${className ? className : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default MobileButton;
