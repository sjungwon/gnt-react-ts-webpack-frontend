import styles from "./scss/CommentElement.module.scss";
import { useCallback, useState } from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import RemoveConfirmModal from "./RemoveConfirmModal";
import AddComment from "./AddComment";
import CommentCard from "../atoms/CommentCard";
import DefaultButton from "../atoms/DefaultButton";
import ProfileBlock from "./ProfileBlock";
import {
  CommentType,
  deleteComment,
  setModifyContentId,
} from "../../redux/modules/post";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import CommentAPI from "../../apis/comment";
import SubcommentList from "./SubcommentList";
import CommentsButton from "../atoms/CommentsButton";
import useHasCategoryProfile from "../../hooks/useHasCategoryProfile";

interface CommentElementProps {
  category: string;
  comment: CommentType;
  parentShowComment: boolean;
  removeCommentRenderLengthHandler: () => void;
}

export default function CommentElement({
  category,
  comment,
  parentShowComment,
  removeCommentRenderLengthHandler,
}: CommentElementProps) {
  const username = useSelector((state: RootState) => state.auth.username);

  //삭제 확인 모달
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleRemoveModalClose = useCallback(() => {
    setShowRemoveModal(false);
  }, []);

  const handleRemoveModalOpen = useCallback(() => {
    if (comment.subcommentsCount) {
      window.alert("대댓글이 있는 댓글은 제거할 수 없습니다.");
      return;
    }
    setShowRemoveModal(true);
  }, [comment.subcommentsCount]);

  const dispatch = useDispatch<AppDispatch>();
  //모달에 전달 -> 모달에서 제거 누르면 실행
  const [loading, setLoading] = useState<boolean>(false);
  const removeComment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await CommentAPI.deleteComment(comment._id);
      const deletedComment = response.data;
      dispatch(deleteComment({ postId: comment.postId, deletedComment }));
      removeCommentRenderLengthHandler();
      setLoading(false);
    } catch {
      window.alert("댓글을 제거 중에 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  }, [comment._id, comment.postId, dispatch, removeCommentRenderLengthHandler]);

  const modifyContentId = useSelector(
    (state: RootState) => state.post.modifyContentId
  );

  const [addSubcomment, setAddSubcomment] = useState<boolean>(false);

  const hasCategoryProfile = useHasCategoryProfile(category);

  if (comment._id === modifyContentId) {
    return (
      <>
        <AddComment
          postId={comment.postId}
          prevData={comment}
          category={category}
        />
        <SubcommentList
          key={comment._id}
          postId={comment.postId}
          commentId={comment._id}
          category={category}
          subcomments={comment.subcomments}
          subcommentsCount={comment.subcommentsCount}
          addSubcomment={addSubcomment}
          setAddSubcomment={setAddSubcomment}
        />
      </>
    );
  }

  return (
    <article>
      <CommentCard>
        <CommentCard.Header>
          <ProfileBlock profile={comment.profile} user={comment.user} />
        </CommentCard.Header>
        <CommentCard.Body>
          <div className={styles.comment_text}>{comment.text}</div>
          <div className={styles.comment_date}>{`${category} - ${new Date(
            comment.createdAt
          ).toLocaleString()}`}</div>
        </CommentCard.Body>
        {parentShowComment ? (
          <CommentCard.Buttons>
            <CommentsButton
              size="sm"
              onClick={() => {
                setAddSubcomment((prev) => !prev);
              }}
              active={addSubcomment}
            ></CommentsButton>
            {username === comment.user.username ? (
              <>
                <DefaultButton
                  size="sm"
                  onClick={() => {
                    if (!hasCategoryProfile) {
                      window.alert(
                        "포스트 카테고리에 포함되는 프로필이 없어 수정할 수 없습니다. 프로필을 추가해주세요."
                      );
                      return;
                    }
                    setAddSubcomment(false);
                    dispatch(setModifyContentId(comment._id));
                  }}
                  className={styles.btn_margin}
                >
                  <BsPencilSquare />{" "}
                  <span className={styles.comment_btn_text}>수정</span>
                </DefaultButton>
                <DefaultButton size="sm" onClick={handleRemoveModalOpen}>
                  <BsTrash />{" "}
                  <span className={styles.comment_btn_text}>삭제</span>
                </DefaultButton>
              </>
            ) : null}
          </CommentCard.Buttons>
        ) : null}
        <RemoveConfirmModal
          show={showRemoveModal}
          close={handleRemoveModalClose}
          loading={loading}
          remove={removeComment}
        />
      </CommentCard>
      {parentShowComment ? (
        <SubcommentList
          subcomments={comment.subcomments}
          subcommentsCount={comment.subcommentsCount}
          postId={comment.postId}
          commentId={comment._id}
          addSubcomment={addSubcomment}
          setAddSubcomment={setAddSubcomment}
          key={comment._id}
          category={category}
        />
      ) : null}
    </article>
  );
}
