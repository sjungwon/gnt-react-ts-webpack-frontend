import { FC, useCallback, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { isIncludePathSpecial } from "../../functions/TextValidFunc";
import {
  createCategoryThunk,
  clearCreateCategoryStatus,
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

//카테고리 추가 모달
const CreateCategoryModal: FC<PropsType> = ({ show, close }) => {
  //input ref
  const categoryInputRef = useRef<HTMLInputElement>(null);

  //모달이 닫힐 때 input 데이터 비움
  useEffect(() => {
    if (!show && categoryInputRef.current) {
      categoryInputRef.current.value = "";
    }
  }, [show]);

  //카테고리 데이터
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );

  //카테고리 추가 상태
  const createStatus = useSelector(
    (state: RootState) => state.category.createStatus
  );

  const dispatch = useDispatch<AppDispatch>();

  //카테고리 추가
  const categorySubmit = useCallback(async () => {
    const categoryTitle = categoryInputRef.current
      ? categoryInputRef.current.value.trim()
      : "";
    //빈 텍스트인 경우
    if (!categoryTitle) {
      return;
    }

    //특수문자 중 URI에 사용할 수 없는 특수 문자를 포함한 경우
    if (isIncludePathSpecial(categoryTitle)) {
      window.alert(
        `! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) 는 포함할 수 없습니다.`
      );
      return;
    }

    //이미 존재하는 카테고리인 경우
    if (categories.find((category) => category.title === categoryTitle)) {
      window.alert("이미 존재하는 게임입니다.");
      return;
    }

    //추가
    dispatch(createCategoryThunk(categoryTitle));
  }, [categories, dispatch]);

  //카테고리 추가 상태 변화에 따라 처리할 로직
  useEffect(() => {
    if (createStatus === "failed") {
      window.alert("게임 카테고리 추가에 실패했습니다. 다시 시도해주세요.");
      dispatch(clearCreateCategoryStatus());
      return;
    }
    if (createStatus === "success") {
      dispatch(clearCreateCategoryStatus());
      close();
      return;
    }
  }, [createStatus, close, dispatch]);

  //로딩 상태
  const loading = createStatus === "pending";

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
          disabled={loading}
          className={styles.btn}
        >
          <LoadingBlock loading={loading}>추가</LoadingBlock>
        </DefaultButton>
        <DefaultButton
          size="md"
          onClick={close}
          disabled={loading}
          className={styles.btn}
        >
          취소
        </DefaultButton>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateCategoryModal;
