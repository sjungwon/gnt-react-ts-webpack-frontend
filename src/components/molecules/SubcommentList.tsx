import { AiOutlineDownCircle, AiOutlineUpCircle } from "react-icons/ai";
import { useCallback, useState } from "react";
import styles from "./scss/SubcommentList.module.scss";
import AddSubcomment from "../molecules/AddSubcomment";
import SubcommentElement from "./SubcommentElement";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import { getMoreSubcomments, SubcommentType } from "../../redux/modules/post";
import SubcommentAPI from "../../apis/subcomment";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";

interface PropsType {
  postId: string;
  commentId: string;
  category: string;
  subcomments: SubcommentType[];
  subcommentsCount: number;
  addSubcomment: boolean;
  setAddSubcomment: (data: boolean) => void;
}

export default function SubcommentList({
  postId,
  commentId,
  category,
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
      setLoading(true);
      try {
        const response = await SubcommentAPI.getMore(
          commentId,
          subcomments[subcomments.length - 1].createdAt
        );
        const newSubcomments = response.data;
        dispatch(getMoreSubcomments(newSubcomments));
        setRenderLength((prev) => prev + newSubcomments.length);
        setLoading(false);
      } catch {
        console.log(
          "대댓글을 가져오는데 오류가 발생했습니다. 다시 시도해주세요."
        );
        setLoading(false);
      }
    } else {
      setRenderLength((prev) =>
        prev + 3 > subcomments.length ? subcomments.length : prev + 3
      );
    }
  }, [commentId, dispatch, renderLength, subcomments, subcommentsCount]);

  const closeRenderLengthHandler = useCallback(() => {
    setRenderLength(subcomments.length > 1 ? 1 : 0);
  }, [subcomments.length]);

  const addSubcommentRenderLengthHandler = useCallback(() => {
    setRenderLength((prev) => prev + 1);
  }, []);

  const deleteSubcommentRenderLengthHandler = useCallback(() => {
    setRenderLength((prev) => prev - 1);
  }, []);

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
        <AddSubcomment
          postId={postId}
          commentId={commentId}
          category={category}
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
        <AddSubcomment
          postId={postId}
          commentId={commentId}
          category={category}
          addSubcommentRenderLengthHandler={addSubcommentRenderLengthHandler}
          setModeDefault={setModeDefault}
        />
      ) : null}
      {subcomments.slice(0, renderLength).map((subcomment, index) => {
        return (
          <SubcommentElement
            key={subcomment._id}
            subcomment={subcomment}
            category={category}
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
