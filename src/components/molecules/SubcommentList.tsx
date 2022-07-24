import { AiOutlineDownCircle, AiOutlineUpCircle } from "react-icons/ai";
import { useCallback, useState } from "react";
import styles from "./scss/SubcommentList.module.scss";
import CreateSubcomment from "../molecules/CreateSubcomment";
import SubcommentElement from "./SubcommentElement";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import { getMoreSubcomments, SubcommentType } from "../../redux/modules/post";
import subcommentAPI from "../../apis/subcomment";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";

interface PropsType {
  postId: string;
  commentId: string;
  categoryTitle: string;
  subcomments: SubcommentType[];
  subcommentsCount: number;
  addSubcomment: boolean;
  setAddSubcomment: (data: boolean) => void;
}

export default function SubcommentList({
  postId,
  commentId,
  categoryTitle,
  subcomments,
  subcommentsCount,
  addSubcomment,
  setAddSubcomment,
}: PropsType) {
  const [renderLength, setRenderLength] = useState<number>(
    subcomments.length > 0 ? 1 : 0
  );
  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  const moreRenderLengthHandler = useCallback(async () => {
    if (
      renderLength >= subcomments.length &&
      subcomments.length < subcommentsCount
    ) {
      //대댓글을 더 가져올 수 있는 경우
      setLoading(true);
      try {
        const response = await subcommentAPI.get(
          commentId,
          subcomments[subcomments.length - 1].createdAt
        );
        const newSubcomments = response.data;
        dispatch(getMoreSubcomments(newSubcomments));
        setRenderLength((prev) => prev + newSubcomments.length);
        setLoading(false);
      } catch {
        window.alert(
          "대댓글을 가져오는데 오류가 발생했습니다. 다시 시도해주세요."
        );
        setLoading(false);
      }
    } else {
      //대댓글을 더 보여주는 경우
      setRenderLength((prev) =>
        prev + 3 > subcomments.length ? subcomments.length : prev + 3
      );
    }
  }, [commentId, dispatch, renderLength, subcomments, subcommentsCount]);

  //대댓글 닫기
  const closeRenderLengthHandler = useCallback(() => {
    setRenderLength(subcomments.length > 1 ? 1 : 0);
  }, [subcomments.length]);

  //대댓글 추가시 렌더 길이 + 1
  const addSubcommentRenderLengthHandler = useCallback(() => {
    setRenderLength((prev) => prev + 1);
  }, []);

  //대댓글 제거시 렌더 길이 - 1
  const deleteSubcommentRenderLengthHandler = useCallback(() => {
    setRenderLength((prev) => prev - 1);
  }, []);

  //대댓글 추가 닫기 - comment 쪽에서 열어 놓으면 subcomment쪽에서 닫아야 함
  const setModeDefault = useCallback(() => {
    setAddSubcomment(false);
  }, [setAddSubcomment]);

  //subComment가 없는 경우
  if (subcommentsCount === 0) {
    if (!addSubcomment) {
      return null;
    }

    return (
      <div className={styles.container}>
        <CreateSubcomment
          postId={postId}
          commentId={commentId}
          categoryTitle={categoryTitle}
          addSubcommentRenderLengthHandler={addSubcommentRenderLengthHandler}
          setModeDefault={setModeDefault}
        />
      </div>
    );
  }

  //subComment가 있는 경우
  return (
    <div className={styles.container}>
      {addSubcomment ? (
        <CreateSubcomment
          postId={postId}
          commentId={commentId}
          categoryTitle={categoryTitle}
          addSubcommentRenderLengthHandler={addSubcommentRenderLengthHandler}
          setModeDefault={setModeDefault}
        />
      ) : null}
      {subcomments.slice(0, renderLength).map((subcomment, index) => {
        return (
          <SubcommentElement
            key={subcomment._id}
            subcomment={subcomment}
            categoryTitle={categoryTitle}
            deleteSubcommentRenderLengthHandler={
              deleteSubcommentRenderLengthHandler
            }
          />
        );
      })}
      <div className={styles.more_container}>
        {renderLength < subcomments.length ||
        subcomments.length < subcommentsCount ? (
          <DefaultButton
            size="sm"
            onClick={moreRenderLengthHandler}
            disabled={loading}
          >
            <LoadingBlock loading={loading}>
              {loading ? "가져오는 중..." : "더보기 "}
              <AiOutlineDownCircle className={styles.more_icon} />
            </LoadingBlock>
          </DefaultButton>
        ) : null}
        {renderLength > 1 ? (
          <DefaultButton
            size="sm"
            className={styles.more}
            onClick={closeRenderLengthHandler}
            disabled={loading}
          >
            {"닫기 "}
            <AiOutlineUpCircle className={styles.more_icon} />
          </DefaultButton>
        ) : null}
      </div>
    </div>
  );
}
