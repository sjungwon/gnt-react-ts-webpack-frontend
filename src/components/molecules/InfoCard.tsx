import styles from "./scss/InfoCard.module.scss";

interface PropsType {
  text: string;
}

//중앙 포스트 데이터 보여주는 쪽에서 선택된 카테고리 혹은 유저, 프로필 등 페이지 정보를 보여줌
export default function InfoCard({ text }: PropsType) {
  return <div className={styles.category}>{text}</div>;
}
