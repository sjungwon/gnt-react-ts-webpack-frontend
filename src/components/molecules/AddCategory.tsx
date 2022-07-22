import { FC, useCallback, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { isIncludePathSpecial } from "../../functions/TextValidFunc";
import {
  addCategoryThunk,
  clearAddCategoryStatus,
} from "../../redux/modules/category";
import { AppDispatch, RootState } from "../../redux/store";
import DefaultButton from "../atoms/DefaultButton";
import DefaultTextInput from "../atoms/DefaultTextInput";
import LoadingBlock from "../atoms/LoadingBlock";
import styles from "./scss/AddCategory.module.scss";

interface PropsType {
  show: boolean;
  close: () => void;
}

const AddCategory: FC<PropsType> = ({ show, close }) => {
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );
  const addStatus = useSelector((state: RootState) => state.category.addStatus);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (addStatus === "failed") {
      window.alert("게임 카테고리 추가에 실패했습니다. 다시 시도해주세요.");
      dispatch(clearAddCategoryStatus());
      return;
    }
    if (addStatus === "success") {
      dispatch(clearAddCategoryStatus());
      close();
      return;
    }
  }, [addStatus, close, dispatch]);

  const categoryInputRef = useRef<HTMLInputElement>(null);

  const categorySubmit = useCallback(async () => {
    const categoryTitle = categoryInputRef.current
      ? categoryInputRef.current.value.trim()
      : "";
    if (!categoryTitle) {
      return;
    }

    if (isIncludePathSpecial(categoryTitle)) {
      window.alert(
        `! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) 는 포함할 수 없습니다.`
      );
      return;
    }

    if (categories.find((category) => category.title === categoryTitle)) {
      window.alert("이미 존재하는 게임입니다.");
      return;
    }

    dispatch(addCategoryThunk(categoryTitle));
    if (categoryInputRef.current) {
      categoryInputRef.current.value = "";
    }
  }, [categories, dispatch]);

  useEffect(() => {
    if (!show && categoryInputRef.current) {
      categoryInputRef.current.value = "";
    }
  }, [show]);

  return (
    <Modal show={show} size="sm" centered onHide={close} backdrop="static">
      <Modal.Header>
        <Modal.Title className={styles.title}>게임 카테고리 추가</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DefaultTextInput
          ref={categoryInputRef}
          placeholder="게임 이름"
          className={styles.input}
        />
        <p className={styles.text}>
          카테고리를 생성한 사용자는 해당 카테고리의 모든 게시물을 관리할 수
          있습니다.
        </p>
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <DefaultButton
          size="md"
          onClick={categorySubmit}
          disabled={addStatus === "pending"}
          className={styles.btn}
        >
          <LoadingBlock loading={addStatus === "pending"}>추가</LoadingBlock>
        </DefaultButton>
        <DefaultButton
          size="md"
          onClick={close}
          disabled={addStatus === "pending"}
          className={styles.btn}
        >
          취소
        </DefaultButton>
      </Modal.Footer>
    </Modal>
  );
};

export default AddCategory;
