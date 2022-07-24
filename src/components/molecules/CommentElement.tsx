import styles from "./scss/CommentElement.module.scss";
import { useCallback, useState } from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import { MdOutlineBlock } from "react-icons/md";
import RemoveConfirmModal from "./RemoveConfirmModal";
import CommentCard from "../atoms/CommentCard";
import DefaultButton from "../atoms/DefaultButton";
import ProfileBlock from "./ProfileBlock";
import {
  blockComment,
  CommentType,
  deleteComment,
  setModifyContentId,
} from "../../redux/modules/post";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import commentAPI from "../../apis/comment";
import SubcommentList from "./SubcommentList";
import CommentsButton from "../atoms/CommentsButton";
import useHasCategoryProfile from "../../hooks/useHasCategoryProfile";
import useBlockContent from "../../hooks/useBlockContent";
import BlockConfirmModal from "./BlockConfirmModal";
import CreateComment from "./CreateComment";

interface CommentElementProps {
  //post 카테고리 전달
  categoryTitle: string;
  //댓글 데이터
  comment: CommentType;
  //post에서 댓글을 열었는지에 대한 상태 정보
  parentShowComment: boolean;
  //댓글 제거 시 댓글 리스트에서 렌더 길이 조절
  removeCommentRenderLengthHandler: () => void;
}

//댓글 컴포넌트
export default function CommentElement({
  categoryTitle,
  comment,
  parentShowComment,
  removeCommentRenderLengthHandler,
}: CommentElementProps) {
  //로그인 유저가 소유한 댓글인지 확인할 때 사용
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

  const [loading, setLoading] = useState<boolean>(false);

  //댓글 제거
  const removeComment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commentAPI.delete(comment._id);
      const deletedComment = response.data;
      dispatch(deleteComment({ postId: comment.postId, deletedComment }));
      removeCommentRenderLengthHandler();
      setLoading(false);
    } catch {
      window.alert("댓글을 제거 중에 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  }, [comment._id, comment.postId, dispatch, removeCommentRenderLengthHandler]);

  const [addSubcomment, setAddSubcomment] = useState<boolean>(false);

  const hasCategoryProfile = useHasCategoryProfile(categoryTitle);

  const API = async () => {
    await commentAPI.block(comment._id);
  };
  const actionCreator = () => {
    return blockComment({ postId: comment.postId, commentId: comment._id });
  };

  const categories = useSelector(
    (state: RootState) => state.category.categories
  );

  //댓글 카테고리
  //사용자가 댓글 작성자가 아니더라도
  //카테고리 관리자인지 확인하기 위해 카테고리 데이터 가져옴
  const commentCategory = categories.find(
    (category) => category.title === categoryTitle
  );

  //차단 확인 모달에 사용할 데이터
  const {
    showBlockModal,
    handleBlockModalClose,
    handleBlockModalOpen,
    blockLoading,
    sendBlockContent,
  } = useBlockContent({ API, actionCreator, contentType: "댓글" });

  const modifyContentId = useSelector(
    (state: RootState) => state.post.modifyContentId
  );

  //현재 댓글 데이터가 수정 ID인 경우
  if (comment._id === modifyContentId) {
    return (
      <>
        <CreateComment
          postId={comment.postId}
          prevData={comment}
          categoryTitle={categoryTitle}
        />
        <SubcommentList
          key={comment._id}
          postId={comment.postId}
          commentId={comment._id}
          categoryTitle={categoryTitle}
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
          <div
            className={`${styles.comment_text} ${
              comment.blocked ? styles.warning : ""
            }`}
          >
            {comment.text}
          </div>
          <div className={styles.comment_date}>{`${categoryTitle} - ${new Date(
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
              className={styles.btn_margin}
            ></CommentsButton>
            {username === comment.user.username ? (
              <>
                {!comment.blocked ? (
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
                ) : null}
                <DefaultButton
                  size="sm"
                  onClick={handleRemoveModalOpen}
                  className={styles.btn_margin}
                >
                  <BsTrash />{" "}
                  <span className={styles.comment_btn_text}>삭제</span>
                </DefaultButton>
                {username === commentCategory?.user.username &&
                !comment.blocked ? (
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
        ) : null}
        <RemoveConfirmModal
          show={showRemoveModal}
          close={handleRemoveModalClose}
          loading={loading}
          remove={removeComment}
        />
        {username === commentCategory?.user.username && !comment.blocked ? (
          <BlockConfirmModal
            close={handleBlockModalClose}
            show={showBlockModal}
            loading={blockLoading}
            block={sendBlockContent}
            contentType="댓글"
          />
        ) : null}
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
          categoryTitle={categoryTitle}
        />
      ) : null}
    </article>
  );
}
