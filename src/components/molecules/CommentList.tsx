import styles from "./scss/CommentList.module.scss";
import { useCallback, useState } from "react";

import { AiOutlineDownCircle, AiOutlineUpCircle } from "react-icons/ai";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import CommentElement from "./CommentElement";
import { CommentType, getMoreComments } from "../../redux/modules/post";
import { AppDispatch } from "../../redux/store";
import { useDispatch } from "react-redux";
import commentAPI from "../../apis/comment";
import CreateComment from "./CreateComment";

interface CommentElementProps {
  //comment 더 가져올 때 어떤 post인지 알기 위한 id
  postId: string;
  //catagory 정보
  categoryTitle: string;
  //post쪽에서 댓글 열었는지에 대한 상태
  showComment: boolean;
  //댓글 리스트
  comments: CommentType[];
  //총 댓글 개수
  commentsCount: number;
}

export default function CommentList({
  postId,
  categoryTitle,
  showComment,
  comments,
  commentsCount,
}: CommentElementProps) {
  //댓글 몇개 보여줄 건지 조절
  const [renderLength, setRenderLength] = useState<number>(
    comments.length > 2 ? 3 : comments.length
  );

  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState<boolean>(false);

  const moreRenderLengthHandler = useCallback(async () => {
    if (renderLength >= comments.length && comments.length < commentsCount) {
      //댓글 더 가져올 수 있는 경우
      setLoading(true);
      try {
        const response = await commentAPI.get({
          postId,
          lastCommentDate: comments[comments.length - 1].createdAt,
        });
        const newComments = response.data;
        dispatch(getMoreComments({ postId, newComments }));
        setRenderLength((prev) => prev + newComments.length);
        setLoading(false);
      } catch {
        window.alert(
          "댓글을 가져오는데 오류가 발생했습니다. 다시 시도해주세요."
        );
        setLoading(false);
      }
    } else {
      //더 보여줄 댓글이 있는 경우
      setRenderLength((prev) =>
        prev + 3 > comments.length ? comments.length : prev + 3
      );
    }
  }, [comments, commentsCount, dispatch, postId, renderLength]);

  //댓글 더보기 닫기
  const closeRenderLengthHandler = useCallback(() => {
    setRenderLength(comments.length > 2 ? 3 : comments.length);
  }, [comments.length]);

  //댓글 추가된 경우 렌더 길이 하나 늘리기
  const addCommentRenderLengthHandler = useCallback(() => {
    setRenderLength((prev) => prev + 1);
  }, []);

  //제거된 경우 하나 줄이기
  const removeCommentRenderLengthHandler = useCallback(() => {
    setRenderLength((prev) => prev - 1);
  }, []);

  //렌더
  //comment를 열지 않았을 때
  if (!showComment) {
    //댓글 없는 경우
    if (!comments.length) {
      return null;
    }

    //댓글 있는 경우
    if (comments.length) {
      return (
        <>
          <CommentElement
            key={comments[0]._id}
            comment={comments[0]}
            categoryTitle={categoryTitle}
            parentShowComment={showComment}
            removeCommentRenderLengthHandler={removeCommentRenderLengthHandler}
          />
        </>
      );
    }
  }

  //Comment를 연 경우
  return (
    <>
      <CreateComment
        postId={postId}
        categoryTitle={categoryTitle}
        addCommentRenderLengthHandler={addCommentRenderLengthHandler}
      />
      {comments.slice(0, renderLength).map((comment, i) => {
        return (
          <CommentElement
            key={comment._id}
            comment={comment}
            parentShowComment={showComment}
            categoryTitle={categoryTitle}
            removeCommentRenderLengthHandler={removeCommentRenderLengthHandler}
          />
        );
      })}
      <div className={styles.more_container}>
        {renderLength < comments.length || comments.length < commentsCount ? (
          <DefaultButton
            size="sm"
            onClick={moreRenderLengthHandler}
            disabled={loading}
            className={styles.btn_margin}
          >
            <LoadingBlock loading={loading}>
              {loading ? "가져오는 중..." : "더보기 "}
              <AiOutlineDownCircle className={styles.more_icon} />
            </LoadingBlock>
          </DefaultButton>
        ) : null}
        {renderLength > 3 ? (
          <DefaultButton
            size="sm"
            onClick={closeRenderLengthHandler}
            disabled={loading}
          >
            {"닫기 "}
            <AiOutlineUpCircle className={styles.more_icon} />
          </DefaultButton>
        ) : null}
      </div>
    </>
  );
}
