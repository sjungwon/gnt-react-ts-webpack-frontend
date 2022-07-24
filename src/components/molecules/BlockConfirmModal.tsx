import { Modal } from "react-bootstrap";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import styles from "./scss/RemoveConfirmModal.module.scss";

//show: 모달 여닫는 상태
//close: 닫기
//block: 차단 함수
//contentType: 차단할 컨텐츠 타입
//loading: 로딩 상태
interface PropsType {
  show: boolean;
  close: () => void;
  block: () => void;
  contentType: string;
  loading: boolean;
}

//컨텐츠 차단 확인 모달
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
