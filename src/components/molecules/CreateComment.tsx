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
import commentAPI, {
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

//댓글 추가 컴포넌트
export default function CreateComment({
  postId,
  categoryTitle,
  prevData,
  addCommentRenderLengthHandler,
}: PropsType) {
  //빈 프로필 데이터
  const initialProfile = useSelector(
    (state: RootState) => state.profile.initialProfile
  );
  //현재 프로필(선택된 프로필) -> 프로필 선택기에서 사용
  const [currentProfile, setCurrentProfile] =
    useState<ProfileType>(initialProfile);

  //textArea ref
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState<boolean>(false);

  //카테고리
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );

  //댓글 추가 제출
  const clickToSubmit = useCallback(async () => {
    const text = textAreaRef.current ? textAreaRef.current.value.trim() : "";
    if (!text || !currentProfile) {
      //빈 텍스트거나 프로필을 선택 안한 경우
      return;
    }

    if (prevData) {
      //수정인 경우
      if (
        prevData.text === text &&
        prevData.profile?._id === currentProfile._id
      ) {
        //변경된 데이터가 없으면 취소 처리
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
        const response = await commentAPI.update(submitData);
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
    //추가인 경우
    //카테고리가 존재하는지 확인
    const findedCategory = categories.find(
      (category) => category.title === categoryTitle
    );
    //카테고리가 없으면 오류
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
      const response = await commentAPI.create(submitData);
      const newComment = response.data;
      dispatch(createComment({ postId, newComment }));
      if (textAreaRef.current) {
        textAreaRef.current.value = "";
      }
      //댓글 list 렌더 길이 조절
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
          categoryTitle={categoryTitle}
          requiredMessage="댓글을 작성하려면 카테고리에 맞는 "
        >
          <CommentCard.Header>
            <ProfileBlock profile={currentProfile} disableNavigate />
            <ProfileSelector
              size={"sm"}
              setCurrentProfile={setCurrentProfile}
              categoryTitle={categoryTitle}
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
