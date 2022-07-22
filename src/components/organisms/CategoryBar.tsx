import { FC, useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineUnorderedList } from "react-icons/ai";
import styles from "./scss/CategoryBar.module.scss";
import DefaultButton from "../atoms/DefaultButton";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  getCategoryThunk,
  setCurrentCategoryByTitle,
} from "../../redux/modules/category";
import LoadingBlock from "../atoms/LoadingBlock";
import AddCategory from "../molecules/AddCategory";

const CategoryList: FC<{ close: () => void }> = ({ close }) => {
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );
  const dispatch = useDispatch<AppDispatch>();

  return (
    <nav>
      <div className={styles.category_list}>
        <NavLink
          to={"/"}
          className={({ isActive }) =>
            `${styles.category_item} ${isActive ? styles.active : ""}`
          }
          onClick={() => {
            dispatch(setCurrentCategoryByTitle(""));
            close();
          }}
        >
          전체 보기
        </NavLink>
        {categories.map((category) => (
          <NavLink
            to={`/categories/${encodeURI(category.title)}`}
            key={category.title}
            className={({ isActive }) =>
              `${styles.category_item} ${isActive ? styles.active : ""}`
            }
            onClick={() => {
              close();
            }}
          >
            {category.title}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

interface PropsType {
  show: boolean;
  close: () => void;
}

export default function CategoryBar({ show, close }: PropsType) {
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const username = useSelector((state: RootState) => state.auth.username);

  const setShowAddHandler = useCallback(() => {
    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    setShowAdd((prev) => !prev);
  }, [username]);

  const status = useSelector((state: RootState) => state.category.status);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getCategoryThunk());
  }, [dispatch]);

  return (
    <div className={styles.container_padding}>
      <div className={styles.category_list_title_container}>
        <div className={styles.category_list_title}>
          <div className={styles.list_title}>
            <AiOutlineUnorderedList />
            <h3 className={styles.category_title}>게임 리스트</h3>
          </div>
          <DefaultButton
            size="md"
            onClick={setShowAddHandler}
            disabled={!username}
          >
            게임 추가
          </DefaultButton>
        </div>
        <AddCategory
          show={showAdd}
          close={() => {
            setShowAdd(false);
          }}
        />
      </div>
      <LoadingBlock loading={status === "pending"}>
        <CategoryList close={close} />
      </LoadingBlock>
    </div>
  );
}
