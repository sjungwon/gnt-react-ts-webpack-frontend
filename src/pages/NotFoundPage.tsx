import { FC, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signoutThunk } from "../redux/modules/auth";
import { AppDispath, RootState } from "../redux/store";
import styles from "./scss/NotFoundPage.module.scss";

const NotFoundPage: FC<{}> = () => {
  const navigate = useNavigate();
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const username = useSelector((state: RootState) => state.auth.username);
  const dispatch = useDispatch<AppDispath>();
  const logout = useCallback(() => {
    dispatch(signoutThunk());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>404 - Not Found</h1>
        <div className={styles.card_img}>
          <img
            src="./not_found_icon.png"
            alt="not_found img"
            className={styles.not_found_img}
          />
        </div>
        <p className={styles.text}>페이지를 찾을 수 없습니다.</p>
        <p className={styles.text}>URL을 다시 확인해주세요.</p>
        <button onClick={goBack} className={styles.btn}>
          돌아가기
        </button>
        {!username ? (
          <button
            onClick={() => {
              navigate("/signin");
            }}
          >
            로그인
          </button>
        ) : (
          <button onClick={logout}>로그아웃</button>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;
