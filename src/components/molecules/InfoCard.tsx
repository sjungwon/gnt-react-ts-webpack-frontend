import styles from "./scss/InfoCard.module.scss";

interface PropsType {
  text: string;
}

export default function InfoCard({ text }: PropsType) {
  return <div className={styles.category}>{text}</div>;
}
