import { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import categoryAPI from "../../apis/category";
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

//전역 카테고리 선택시 카테고리 정보 카드
export default function CategoryCard({ title }: PropsType) {
  //빈 카테고리 데이터 - 데이터 가져오기 전에 비워둘 데이터
  const initialCategory = useSelector(
    (state: RootState) => state.category.initialCategory
  );
  //카테고리 상태
  const [category, setCategory] = useState<CategoryType>(initialCategory);

  //GET 카테고리 데이터
  const getCategory = useCallback(
    async (title: string) => {
      try {
        const response = await categoryAPI.getByTitle(title);
        const findedCategory = response.data;
        setCategory(findedCategory);
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          //404가 아닌 경우 -> 오류
          window.alert(
            "카테고리 정보를 가져오는데 오류가 발생했습니다. 다시 시도해주세요."
          );
          return;
        }
        //404인 경우 -> 카테고리 없는 경우
        setCategory({
          ...initialCategory,
          title: `${title}(존재하지 않는 카테고리)`,
        });
      }
    },
    [initialCategory]
  );

  //전역 카테고리 변경시 = props로 들어오는 title 변경시 카테고리 정보 가져옴
  useEffect(() => {
    getCategory(title);
  }, [title, getCategory]);

  const dispatch = useDispatch<AppDispatch>();

  //카테고리 제거시 확인 모달
  const [removeMdShow, setRemoveMdShow] = useState<boolean>(false);

  const openRemoveMd = useCallback(() => {
    setRemoveMdShow(true);
  }, []);

  const closeRemoveMd = useCallback(() => {
    setRemoveMdShow(false);
  }, []);

  //제거 전송
  const removeCategory = useCallback(() => {
    dispatch(deleteCategoryThunk(category._id));
    setRemoveMdShow(false);
  }, [category._id, dispatch]);

  const deleteStatus = useSelector(
    (state: RootState) => state.category.deleteStatus
  );

  const navigate = useNavigate();

  //제거에 성공하거나 실패하면 대응
  useEffect(() => {
    if (deleteStatus === "success" || deleteStatus === "failed") {
      dispatch(clearDeleteCategoryStatus());
      if (deleteStatus === "success") {
        //제거 성공시 홈페이지로 이동
        navigate("/");
      }
    }
  }, [deleteStatus, dispatch, navigate]);

  //로그인 유저 이름
  //유저가 카테고리 관리자인지 확인할 때 사용
  const username = useSelector((state: RootState) => state.auth.username);

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
              customMessage={
                <>
                  <p className={styles.warning}>
                    {
                      "컨텐츠(프로필, 포스트, 댓글, 대댓글)가 존재하는 카테고리는"
                    }
                  </p>
                  <p className={styles.warning}>
                    {
                      "삭제할 수 없으며 카테고리 삭제에 성공하면 홈페이지로 이동됩니다."
                    }
                  </p>
                </>
              }
            />
          </>
        ) : null}
      </Card.Body>
    </Card>
  );
}
