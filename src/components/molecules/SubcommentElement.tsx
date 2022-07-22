import styles from "./scss/SubcommentElement.module.scss";
import { useCallback, useState } from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import RemoveConfirmModal from "./RemoveConfirmModal";
import AddSubcomment from "./AddSubcomment";
import ProfileBlock from "./ProfileBlock";
import CommentCard from "../atoms/CommentCard";
import DefaultButton from "../atoms/DefaultButton";
import {
  blockSubcomment,
  clearModifyContentId,
  deleteSubcomment,
  setModifyContentId,
  SubcommentType,
} from "../../redux/modules/post";
import SubcommentAPI from "../../apis/subcomment";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import BlockConfirmModal from "./BlockConfirmModal";
import useBlockContent from "../../hooks/useBlockContent";
import { MdOutlineBlock } from "react-icons/md";
import useHasCategoryProfile from "../../hooks/useHasCategoryProfile";

interface SubcommentElementProps {
  subcomment: SubcommentType;
  deleteSubcommentRenderLengthHandler: () => void;
  categoryTitle: string;
}

export default function SubcommentElement({
  subcomment,
  deleteSubcommentRenderLengthHandler,
  categoryTitle,
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

  const API = async () => {
    await SubcommentAPI.block(subcomment._id);
  };
  const actionCreator = () => {
    return blockSubcomment({
      postId: subcomment.postId,
      commentId: subcomment.commentId,
      subcommentId: subcomment._id,
    });
  };

  const categories = useSelector(
    (state: RootState) => state.category.categories
  );

  const subcommentCategory = categories.find(
    (category) => category.title === subcomment.category.title
  );

  const {
    showBlockModal,
    handleBlockModalClose,
    handleBlockModalOpen,
    blockLoading,
    sendBlockContent,
  } = useBlockContent({ API, actionCreator, contentType: "댓글" });

  const hasCategoryProfile = useHasCategoryProfile(categoryTitle);

  if (modifyContentId === subcomment._id) {
    return (
      <AddSubcomment
        postId={subcomment.postId}
        commentId={subcomment.commentId}
        prevData={subcomment}
        categoryTitle={categoryTitle}
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
          <div
            className={`${styles.subcomment_text} ${
              subcomment.blocked ? styles.warning : ""
            }`}
          >
            {subcomment.text}
          </div>
          <div className={styles.subcomment_date}>
            {`${categoryTitle} - ${new Date(
              subcomment.createdAt
            ).toLocaleString()}`}
          </div>
        </CommentCard.Body>
        <CommentCard.Buttons>
          {username === subcomment.user.username ? (
            <>
              {!subcomment.blocked ? (
                <DefaultButton
                  onClick={() => {
                    if (!hasCategoryProfile) {
                      window.alert(
                        "포스트 카테고리에 포함되는 프로필이 없어 수정할 수 없습니다. 프로필을 추가해주세요."
                      );
                      return;
                    }
                    dispatch(setModifyContentId(subcomment._id));
                  }}
                  size="sm"
                  className={styles.btn_margin}
                >
                  <BsPencilSquare />{" "}
                  <span className={styles.btn_text}>수정</span>
                </DefaultButton>
              ) : null}
              <DefaultButton
                onClick={handleRemoveModalOpen}
                size="sm"
                className={styles.btn_margin}
              >
                <BsTrash /> <span className={styles.btn_text}>삭제</span>
              </DefaultButton>
              {username === subcommentCategory?.user.username &&
              !subcomment.blocked ? (
                <DefaultButton
                  size="sm"
                  onClick={handleBlockModalOpen}
                  className={styles.btn_margin}
                >
                  <MdOutlineBlock />{" "}
                  <span className={styles.comment_btn_text}>차단</span>
                </DefaultButton>
              ) : null}
            </>
          ) : null}
        </CommentCard.Buttons>
        <RemoveConfirmModal
          close={handleRemoveModalClose}
          show={showRemoveModal}
          loading={loading}
          remove={removeSubcomment}
        />
        {username === subcommentCategory?.user.username &&
        !subcomment.blocked ? (
          <BlockConfirmModal
            close={handleBlockModalClose}
            show={showBlockModal}
            loading={blockLoading}
            block={sendBlockContent}
            contentType="댓글"
          />
        ) : null}
      </CommentCard>
    </article>
  );
}
