import { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { getCategoryByTitle } from "../../apis/category";
import {
  CategoryType,
  clearDeleteCategoryStatus,
  deleteCategoryThunk,
} from "../../redux/modules/category";
import { AppDispatch, RootState } from "../../redux/store";
import DefaultButton from "../atoms/DefaultButton";
import RemoveConfirmModal from "./RemoveConfirmModal";
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

  const username = useSelector((state: RootState) => state.auth.username);
  const dispatch = useDispatch<AppDispatch>();
  const deleteStatus = useSelector(
    (state: RootState) => state.category.deleteStatus
  );

  useEffect(() => {
    if (deleteStatus === "success" || deleteStatus === "failed") {
      dispatch(clearDeleteCategoryStatus());
      if (deleteStatus === "success") {
        window.location.reload();
      }
    }
  }, [deleteStatus, dispatch]);

  const [removeMdShow, setRemoveMdShow] = useState<boolean>(false);

  const openRemoveMd = useCallback(() => {
    setRemoveMdShow(true);
  }, []);

  const closeRemoveMd = useCallback(() => {
    setRemoveMdShow(false);
  }, []);

  const removeCategory = useCallback(() => {
    dispatch(deleteCategoryThunk(category._id));
    setRemoveMdShow(false);
  }, [category._id, dispatch]);

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
        {category.user.username === username ? (
          <>
            <DefaultButton
              size="md"
              onClick={openRemoveMd}
              className={styles.btn_margin}
            >
              카테고리 제거
            </DefaultButton>
            <RemoveConfirmModal
              show={removeMdShow}
              close={closeRemoveMd}
              remove={removeCategory}
              loading={deleteStatus === "pending"}
            />
          </>
        ) : null}
      </Card.Body>
    </Card>
  );
}
