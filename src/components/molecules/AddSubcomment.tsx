import styles from "./scss/AddSubcomment.module.scss";
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
  category: string;
  prevData?: SubcommentType;
  setModeDefault: () => void;
  addSubcommentRenderLengthHandler?: () => void;
}

export default function AddSubcomment({
  postId,
  commentId,
  category,
  prevData,
  setModeDefault,
  addSubcommentRenderLengthHandler,
}: PropsType) {
  //유저 데이터 사용 -> 프로필, 이름
  const initialProfile = useSelector(
    (state: RootState) => state.profile.initialProfile
  );
  const [currentProfile, setCurrentProfile] =
    useState<ProfileType>(initialProfile);

  //데이터 제출용 ref
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  //데이터 제출

  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch();
  const clickToSubmit = useCallback(async () => {
    const text = textAreaRef.current ? textAreaRef.current.value.trim() : "";
    if (!text) {
      return;
    }
    setLoading(true);
    if (!prevData) {
      const submitData: CreateSubcommentData = {
        postId,
        commentId,
        profile: currentProfile._id,
        text,
      };
      try {
        const response = await SubcommentAPI.create(submitData);
        const newSubcomment = response.data;
        dispatch(createSubcomments(newSubcomment));
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
          category={category}
        >
          <CommentCard.Header>
            <ProfileBlock profile={currentProfile} disableNavigate />
            <ProfileSelector
              size="sm"
              setCurrentProfile={setCurrentProfile}
              category={category}
            />
          </CommentCard.Header>
          <CommentCard.Body>
            <DefaultTextarea
              size="sm"
              ref={textAreaRef}
              defaultValue={prevData?.text}
              maxLength={250}
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
