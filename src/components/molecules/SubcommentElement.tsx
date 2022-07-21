import styles from "./scss/SubcommentElement.module.scss";
import { useCallback, useState } from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import RemoveConfirmModal from "./RemoveConfirmModal";
import AddSubcomment from "./AddSubcomment";
import ProfileBlock from "./ProfileBlock";
import CommentCard from "../atoms/CommentCard";
import DefaultButton from "../atoms/DefaultButton";
import {
  clearModifyContentId,
  deleteSubcomment,
  setModifyContentId,
  SubcommentType,
} from "../../redux/modules/post";
import SubcommentAPI from "../../apis/subcomment";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface SubcommentElementProps {
  subcomment: SubcommentType;
  deleteSubcommentRenderLengthHandler: () => void;
  category: string;
}

export default function SubcommentElement({
  subcomment,
  deleteSubcommentRenderLengthHandler,
  category,
}: SubcommentElementProps) {
  //삭제시 재확인 모달 관련 데이터
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const handleRemoveModalClose = useCallback(() => {
    setShowRemoveModal(false);
  }, []);
  const handleRemoveModalOpen = useCallback(() => {
    setShowRemoveModal(true);
  }, []);

  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch();
  const removeSubcomment = useCallback(async () => {
    setLoading(true);
    try {
      const response = await SubcommentAPI.delete(subcomment._id);
      const deletedSubcomment = response.data;
      dispatch(deleteSubcomment(deletedSubcomment));
      deleteSubcommentRenderLengthHandler();
    } catch {
      window.alert("댓글을 제거하는데 실패했습니다. 다시 시도해주세요.");
    }
    handleRemoveModalClose();
    setLoading(false);
  }, [
    dispatch,
    handleRemoveModalClose,
    subcomment._id,
    deleteSubcommentRenderLengthHandler,
  ]);

  const modifyContentId = useSelector(
    (state: RootState) => state.post.modifyContentId
  );
  const username = useSelector((state: RootState) => state.auth.username);

  if (modifyContentId === subcomment._id) {
    return (
      <AddSubcomment
        postId={subcomment.postId}
        commentId={subcomment.commentId}
        prevData={subcomment}
        category={category}
        setModeDefault={() => {
          dispatch(clearModifyContentId());
        }}
      />
    );
  }

  //수정하려는 경우가 아니면 subcomment 렌더
  return (
    <article>
      <CommentCard>
        <CommentCard.Header>
          <ProfileBlock profile={subcomment.profile} user={subcomment.user} />
        </CommentCard.Header>
        <CommentCard.Body>
          <div className={styles.subcomment_text}>{subcomment.text}</div>
          <div className={styles.subcomment_date}>
            {`${category} - ${new Date(subcomment.createdAt).toLocaleString()}`}
          </div>
        </CommentCard.Body>
        <CommentCard.Buttons>
          {username === subcomment.user.username ? (
            <>
              <DefaultButton
                onClick={() => {
                  dispatch(setModifyContentId(subcomment._id));
                }}
                size="sm"
                className={styles.btn_margin}
              >
                <BsPencilSquare /> <span className={styles.btn_text}>수정</span>
              </DefaultButton>
              <DefaultButton onClick={handleRemoveModalOpen} size="sm">
                <BsTrash /> <span className={styles.btn_text}>삭제</span>
              </DefaultButton>
            </>
          ) : null}
        </CommentCard.Buttons>
        <RemoveConfirmModal
          close={handleRemoveModalClose}
          show={showRemoveModal}
          loading={loading}
          remove={removeSubcomment}
        />
      </CommentCard>
    </article>
  );
}
