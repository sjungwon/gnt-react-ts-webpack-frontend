import { FC, ReactNode } from "react";
import styles from "./scss/CommentCard.module.scss";

interface ChildProps {
  children: ReactNode;
  borderBottom?: boolean;
}

//댓글 Card -> Layout
const CommentCard: FC<ChildProps> = ({ children, borderBottom }) => {
  return (
    <div className={`${styles.card} ${borderBottom ? styles.card_border : ""}`}>
      {children}
    </div>
  );
};

//Card 헤더 -> 프로필 정보 담을 때 사용
const Header: FC<ChildProps> = ({ children }) => {
  return <div className={styles.header}>{children}</div>;
};

//텍스트, 날짜 등의 데이터
const Body: FC<ChildProps> = ({ children }) => {
  return <div className={styles.body}>{children}</div>;
};

//수정, 삭제등의 버튼 담는 footer 역할
const Buttons: FC<ChildProps> = ({ children }) => {
  return <div className={styles.buttons}>{children}</div>;
};

//export
export default Object.assign(CommentCard, {
  Header,
  Body,
  Buttons,
});
