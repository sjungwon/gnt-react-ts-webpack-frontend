import styles from "./scss/CommentList.module.scss";
import { useCallback, useState } from "react";

import { AiOutlineDownCircle, AiOutlineUpCircle } from "react-icons/ai";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import CommentElement from "./CommentElement";
import { CommentType, getMoreComments } from "../../redux/modules/post";
import { AppDispatch } from "../../redux/store";
import { useDispatch } from "react-redux";
import AddComment from "./AddComment";
import CommentAPI from "../../apis/comment";

interface CommentElementProps {
  postId: string;
  category: string;
  showComment: boolean;
  comments: CommentType[];
  commentsCount: number;
}

export default function CommentList({
  postId,
  category,
  showComment,
  comments,
  commentsCount,
}: CommentElementProps) {
  const [renderLength, setRenderLength] = useState<number>(
    comments.length > 2 ? 3 : comments.length
  );

  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState<boolean>(false);

  const moreRenderLengthHandler = useCallback(async () => {
    if (renderLength >= comments.length && comments.length < commentsCount) {
      setLoading(true);
      try {
        const response = await CommentAPI.getMoreComments({
          postId,
          lastCommentDate: comments[comments.length - 1].createdAt,
        });
        const newComments = response.data;
        dispatch(getMoreComments({ postId, newComments }));
        setRenderLength((prev) => prev + newComments.length);
        setLoading(false);
      } catch {
        console.log(
          "댓글을 가져오는데 오류가 발생했습니다. 다시 시도해주세요."
        );
        setLoading(false);
      }
    } else {
      setRenderLength((prev) =>
        prev + 3 > comments.length ? comments.length : prev + 3
      );
    }
  }, [comments, commentsCount, dispatch, postId, renderLength]);

  const closeRenderLengthHandler = useCallback(() => {
    setRenderLength(comments.length > 2 ? 3 : comments.length);
  }, [comments.length]);

  const addCommentRenderLengthHandler = useCallback(() => {
    setRenderLength((prev) => prev + 1);
  }, []);

  const removeCommentRenderLengthHandler = useCallback(() => {
    setRenderLength((prev) => prev - 1);
  }, []);

  //렌더
  //comment를 열지 않았을 때
  if (!showComment) {
    //Comment가 없는 경우
    if (!comments.length) {
      return null;
    }

    if (comments.length) {
      return (
        <>
          <CommentElement
            key={comments[0]._id}
            comment={comments[0]}
            category={category}
            borderBottom={false}
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
      <AddComment
        postId={postId}
        category={category}
        addCommentRenderLengthHandler={addCommentRenderLengthHandler}
      />
      {comments.slice(0, renderLength).map((comment, i) => {
        return (
          <CommentElement
            key={comment._id}
            comment={comment}
            borderBottom={true}
            parentShowComment={showComment}
            category={category}
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
