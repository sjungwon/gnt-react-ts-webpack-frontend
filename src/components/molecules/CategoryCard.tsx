import { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { getCategoryByTitle } from "../../apis/category";
import { CategoryType } from "../../redux/modules/category";
import { RootState } from "../../redux/store";
import styles from "./scss/CategoryCard.module.scss";

interface PropsType {
  title: string;
}

export default function CategoryCard({ title }: PropsType) {
  const initialCategory = useSelector(
    (state: RootState) => state.category.initialCategory
  );
  const [category, setCategory] = useState<CategoryType>(initialCategory);

  const getCategory = useCallback(
    async (title: string) => {
      try {
        const response = await getCategoryByTitle(title);
        const findedCategory = response.data;
        setCategory(findedCategory);
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          window.alert(
            "카테고리 정보를 가져오는데 오류가 발생했습니다. 다시 시도해주세요."
          );
          return;
        }
        setCategory({
          ...initialCategory,
          title: `${title}(존재하지 않는 카테고리)`,
        });
      }
    },
    [initialCategory]
  );

  useEffect(() => {
    getCategory(title);
  }, [title, getCategory]);

  return (
    <Card className={styles.container}>
      <Card.Header>
        <Card.Title className={styles.title}>카테고리 정보</Card.Title>
      </Card.Header>
      <Card.Body className={styles.body_container}>
        <Card.Title className={styles.title}>{category.title}</Card.Title>
        <p className={styles.userInfo}>
          관리자 :{" "}
          {category.user.username ? (
            <NavLink
              to={`/usernames/${category.user.username}`}
              className={styles.subtitle_link}
            >
              {category.user.username}
            </NavLink>
          ) : (
            "정보 없음"
          )}
        </p>
      </Card.Body>
    </Card>
  );
}
