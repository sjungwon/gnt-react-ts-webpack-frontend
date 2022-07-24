import styles from "./scss/CreateSubcomment.module.scss";
import { useCallback, useRef, useState } from "react";
import NeedLoginBlock from "../atoms/NeedLoginBlock";
import NeedProfileBlock from "../atoms/NeedProfileBlock";
import LoadingBlock from "../atoms/LoadingBlock";
import DefaultButton from "../atoms/DefaultButton";
import CommentCard from "../atoms/CommentCard";
import ProfileBlock from "./ProfileBlock";
import ProfileSelector from "../atoms/ProfileSelector";
import DefaultTextarea from "../atoms/DefaultTextarea";
import { ProfileType } from "../../redux/modules/profile";
import { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  createSubcomments,
  SubcommentType,
  updateSubcomment,
} from "../../redux/modules/post";
import SubcommentAPI, {
  CreateSubcommentData,
  UpdateSubcommentData,
} from "../../apis/subcomment";

interface PropsType {
  postId: string;
  commentId: string;
  categoryTitle: string;
  prevData?: SubcommentType;
  setModeDefault: () => void;
  addSubcommentRenderLengthHandler?: () => void;
}

export default function AddSubcomment({
  postId,
  commentId,
  categoryTitle,
  prevData,
  setModeDefault,
  addSubcommentRenderLengthHandler,
}: PropsType) {
  //빈 프로필 데이터
  const initialProfile = useSelector(
    (state: RootState) => state.profile.initialProfile
  );
  //선택된 프로필
  const [currentProfile, setCurrentProfile] =
    useState<ProfileType>(initialProfile);

  //teatArea ref
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch();

  const categories = useSelector(
    (state: RootState) => state.category.categories
  );

  //대댓글 추가 제출
  const clickToSubmit = useCallback(async () => {
    const text = textAreaRef.current ? textAreaRef.current.value.trim() : "";
    if (!text) {
      return;
    }
    setLoading(true);
    if (!prevData) {
      //추가인 경우
      const findedCategory = categories.find(
        (category) => category.title === categoryTitle
      );
      //추가하려는 카테고리가 없는 경우
      if (!findedCategory) {
        window.alert("댓글을 추가하는데 실패했습니다. 다시 시도해주세요.");
        setLoading(false);
        return;
      }
      const submitData: CreateSubcommentData = {
        postId,
        commentId,
        category: findedCategory._id,
        profile: currentProfile._id,
        text,
      };
      try {
        const response = await SubcommentAPI.create(submitData);
        const newSubcomment = response.data;
        dispatch(createSubcomments(newSubcomment));
        //대댓글 리스트 렌더 길이 조절
        if (addSubcommentRenderLengthHandler) {
          addSubcommentRenderLengthHandler();
        }
      } catch {
        window.alert("댓글을 추가하는데 실패했습니다. 다시 시도해주세요.");
      }
      setLoading(false);
      if (textAreaRef.current) {
        textAreaRef.current.value = "";
      }
      setModeDefault();
      return;
    }
    //수정인 경우
    const submitData: UpdateSubcommentData = {
      _id: prevData._id,
      profile: currentProfile._id,
      text,
    };
    try {
      const response = await SubcommentAPI.update(submitData);
      const updatedSubcomment = response.data;
      dispatch(updateSubcomment(updatedSubcomment));
    } catch {
      window.alert("댓글을 수정하는데 실패했습니다. 다시 시도해주세요.");
    }
    setLoading(false);
    setModeDefault();
  }, [
    addSubcommentRenderLengthHandler,
    categories,
    categoryTitle,
    commentId,
    currentProfile._id,
    dispatch,
    postId,
    prevData,
    setModeDefault,
  ]);

  return (
    <CommentCard>
      <NeedLoginBlock requiredMessage="대댓글을 작성하려면 ">
        <NeedProfileBlock
          requiredMessage="대댓글을 작성하려면 카테고리에 맞는 "
          categoryTitle={categoryTitle}
        >
          <CommentCard.Header>
            <ProfileBlock profile={currentProfile} disableNavigate />
            <ProfileSelector
              size="sm"
              setCurrentProfile={setCurrentProfile}
              categoryTitle={categoryTitle}
            />
          </CommentCard.Header>
          <CommentCard.Body>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <DefaultTextarea
                size="sm"
                ref={textAreaRef}
                defaultValue={prevData?.text}
                maxLength={250}
              />
            </form>
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
            <DefaultButton
              size="sm"
              disabled={loading}
              onClick={setModeDefault}
            >
              취소
            </DefaultButton>
          </CommentCard.Buttons>
        </NeedProfileBlock>
      </NeedLoginBlock>
    </CommentCard>
  );
}
