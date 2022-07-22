import { Modal } from "react-bootstrap";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import styles from "./scss/RemoveConfirmModal.module.scss";

//모달 show state
//모달 닫는 close 함수 -> show를 false로 변경하는 함수
//remove -> comment, subcomment 제거하는 dispatch Thunk 함수
//className -> width 조절용 className
interface PropsType {
  show: boolean;
  close: () => void;
  block: () => void;
  contentType: string;
  loading: boolean;
}

export default function BlockConfirmModal({
  show,
  close,
  block,
  contentType,
  loading,
}: PropsType) {
  return (
    <Modal show={show} onHide={close} size="sm" centered>
      <Modal.Header closeButton>
        <Modal.Title className={styles.title}>차단</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>정말 차단하시겠습니까 ?</p>
        <p className={styles.block_message}>
          {contentType} 차단 시 {contentType}의 내용은 모두 제거되며 되돌릴 수
          없습니다.
        </p>
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
        <DefaultButton size="md" onClick={block} disabled={loading}>
          <LoadingBlock loading={loading}>차단</LoadingBlock>
        </DefaultButton>
        <DefaultButton size="md" onClick={close} disabled={loading}>
          취소
        </DefaultButton>
      </Modal.Footer>
    </Modal>
  );
}
