import styles from "./scss/AddComment.module.scss";
import { useCallback, useRef, useState } from "react";
import ProfileSelector from "../atoms/ProfileSelector";
import LoadingBlock from "../atoms/LoadingBlock";
import DefaultButton from "../atoms/DefaultButton";
import CommentCard from "../atoms/CommentCard";
import ProfileBlock from "./ProfileBlock";
import DefaultTextarea from "../atoms/DefaultTextarea";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { ProfileType } from "../../redux/modules/profile";
import {
  clearModifyContentId,
  CommentType,
  createComment,
  updateComment,
} from "../../redux/modules/post";
import CommentAPI, {
  AddCommentReqData,
  UpdateCommentReqData,
} from "../../apis/comment";
import NeedLoginBlock from "../atoms/NeedLoginBlock";
import NeedProfileBlock from "../atoms/NeedProfileBlock";

interface PropsType {
  postId: string;
  categoryTitle: string;
  prevData?: CommentType;
  addCommentRenderLengthHandler?: () => void;
}

export default function AddComment({
  postId,
  categoryTitle,
  prevData,
  addCommentRenderLengthHandler,
}: // prevData,
// commentsListHandlerWithRenderLength: commentsListHandler,
PropsType) {
  //유저 데이터 사용 -> 프로필, 이름

  const initialProfile = useSelector(
    (state: RootState) => state.profile.initialProfile
  );
  const [currentProfile, setCurrentProfile] =
    useState<ProfileType>(initialProfile);

  //데이터 제출용 ref
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  //데이터 제출

  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState<boolean>(false);

  const categories = useSelector(
    (state: RootState) => state.category.categories
  );

  const clickToSubmit = useCallback(async () => {
    const text = textAreaRef.current ? textAreaRef.current.value.trim() : "";
    if (!text || !currentProfile) {
      return;
    }

    if (prevData) {
      if (
        prevData.text === text &&
        prevData.profile?._id === currentProfile._id
      ) {
        dispatch(clearModifyContentId());
        return;
      }
      setLoading(true);
      const submitData: UpdateCommentReqData = {
        commentId: prevData._id,
        text,
        profile: currentProfile._id,
      };
      try {
        const response = await CommentAPI.updateComment(submitData);
        const updatedComment = response.data;
        dispatch(updateComment({ postId, updatedComment }));
        if (textAreaRef.current) {
          textAreaRef.current.value = "";
        }
        dispatch(clearModifyContentId());
      } catch {
        window.alert(
          "포스트를 수정하는데 오류가 발생했습니다. 다시 시도해주세요."
        );
      }
      setLoading(false);
      return;
    }
    const findedCategory = categories.find(
      (category) => category.title === categoryTitle
    );
    if (!findedCategory) {
      window.alert(
        "포스트를 추가하는데 오류가 발생했습니다. 다시 시도해주세요."
      );
      setLoading(false);
      return;
    }
    const submitData: AddCommentReqData = {
      postId,
      category: findedCategory._id,
      profile: currentProfile._id,
      text,
    };
    try {
      const response = await CommentAPI.createComment(submitData);
      const newComment = response.data;
      dispatch(createComment({ postId, newComment }));
      if (textAreaRef.current) {
        textAreaRef.current.value = "";
      }
      if (addCommentRenderLengthHandler) {
        addCommentRenderLengthHandler();
      }
    } catch {
      window.alert(
        "포스트를 추가하는데 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
    setLoading(false);
  }, [
    addCommentRenderLengthHandler,
    categories,
    categoryTitle,
    currentProfile,
    dispatch,
    postId,
    prevData,
  ]);

  return (
    <CommentCard borderBottom={!prevData}>
      <NeedLoginBlock requiredMessage="댓글을 작성하려면 ">
        <NeedProfileBlock
          category={categoryTitle}
          requiredMessage="댓글을 작성하려면 카테고리에 맞는 "
        >
          <CommentCard.Header>
            <ProfileBlock profile={currentProfile} disableNavigate />
            <ProfileSelector
              size={"sm"}
              setCurrentProfile={setCurrentProfile}
              category={categoryTitle}
            />
          </CommentCard.Header>
          <CommentCard.Body>
            <DefaultTextarea
              ref={textAreaRef}
              defaultValue={prevData?.text}
              maxLength={250}
              size="sm"
            />
          </CommentCard.Body>
          <CommentCard.Buttons>
            <DefaultButton
              size="sm"
              disabled={loading}
              onClick={clickToSubmit}
              className={styles.btn_margin}
            >
              <LoadingBlock loading={loading}>등록</LoadingBlock>
            </DefaultButton>
            {prevData ? (
              <DefaultButton
                size="sm"
                disabled={loading}
                onClick={() => {
                  dispatch(clearModifyContentId());
                }}
              >
                취소
              </DefaultButton>
            ) : null}
          </CommentCard.Buttons>
        </NeedProfileBlock>
      </NeedLoginBlock>
    </CommentCard>
  );
}
