import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Card } from "react-bootstrap";
import styles from "./scss/CreatePostElement.module.scss";
import DefaultButton from "../atoms/DefaultButton";
import DefaultTextarea from "../atoms/DefaultTextarea";
import LoadingBlock from "../atoms/LoadingBlock";
import { ProfileType } from "../../redux/modules/profile";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import ProfileSelector from "../atoms/ProfileSelector";
import UserProfileList from "./UserProfileList";
import ImageFileInputButton from "../atoms/ImageFileInputButton";
import { BsTrash } from "react-icons/bs";
import ImageSlide, { ImageType } from "./ImageSlide";
import { TypedForm } from "../../classes/TypedForm";
import postAPI, { CreatePostReqType, UpdatePostReqType } from "../../apis/post";
import {
  clearModifyContentId,
  createPost,
  PostType,
  setModifyContentId,
  updatePost,
} from "../../redux/modules/post";

interface Props {
  categoryTitle: string;
  prevData?: PostType;
}

//prevData에 따라 수정, 추가 상태 결정
export default function CreatePostElement({ categoryTitle, prevData }: Props) {
  //prevData 유무에 따라 form을 바로 보여줄 지 결정
  const [show, setShow] = useState(!!prevData);

  //수정 mode인 content id 가져옴
  const modifyContentId = useSelector(
    (state: RootState) => state.post.modifyContentId
  );
  const dispatch = useDispatch<AppDispatch>();
  //form 열고 닫는 함수
  const showHandler = useCallback(() => {
    //수정인 경우엔 form이 항상 열려있어야함
    if (prevData) {
      return;
    }
    //post 추가인 경우엔 id를 createPost로 변경
    if (modifyContentId !== "createPost") {
      dispatch(setModifyContentId("createPost"));
    } else {
      dispatch(clearModifyContentId());
    }
  }, [dispatch, modifyContentId, prevData]);

  //modifyContentId에 맞춰 form 열고 닫기
  useEffect(() => {
    if (prevData) {
      return;
    }
    setShow(modifyContentId === "createPost");
  }, [modifyContentId, prevData]);

  const username = useSelector((state: RootState) => state.auth.username);
  const profiles = useSelector((state: RootState) => state.profile.profiles);

  //카테고리가 선택된 경우 카테고리에 맞는 프로필로 제한
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileType[]>([]);
  //선택된 프로필
  const [currentProfile, setCurrentProfile] = useState<
    ProfileType | undefined
  >();

  //prevData가 있으면 해당 데이터의 프로필로 현재 프로필 변경, 없으면 첫번째 프로필로 설정
  useEffect(() => {
    if (prevData) {
      const filteredProfileTmp = profiles.filter(
        (profile) => profile.category.title === prevData.category.title
      );
      setFilteredProfiles(filteredProfileTmp);
      if (prevData.profile) {
        const finded = filteredProfileTmp.find(
          (profile) => profile._id === prevData.profile?._id
        );
        setCurrentProfile(finded ? finded : undefined);
      }
      return;
    }
    const filteredProfileTmp = categoryTitle
      ? profiles.filter((profile) => profile.category.title === categoryTitle)
      : profiles;
    setFilteredProfiles(filteredProfileTmp);
    setCurrentProfile(
      filteredProfileTmp.length ? filteredProfileTmp[0] : undefined
    );
  }, [categoryTitle, prevData, profiles]);

  return (
    <Card className={styles.card}>
      <div className={username ? "" : styles.disabled}>
        {prevData ? null : (
          <Card.Header className={styles.card_header}>
            <Card.Title className={styles.card_header_title}>
              유저 메뉴
            </Card.Title>
            <UserProfileList filtered />
          </Card.Header>
        )}
        <Card.Body>
          <div className={styles.card_body}>
            <img
              src={currentProfile?.profileImage.URL || "/default_profile.png"}
              className={styles.card_body_img}
              alt="profile"
            />
            <Card.Title className={styles.card_body_title}>
              {currentProfile ? currentProfile.nickname : ""}
            </Card.Title>
            <div className={styles.card_body_right}>
              <ProfileSelector
                size="sm"
                setCurrentProfile={setCurrentProfile}
                categoryTitle={categoryTitle}
              />
            </div>
          </div>
          {prevData ? null : (
            <DefaultButton
              size="xl"
              onClick={showHandler}
              className={styles.card_body_btn}
              disabled={!username || !filteredProfiles.length}
            >
              포스트 작성
            </DefaultButton>
          )}
        </Card.Body>
        <PostForm
          show={show}
          prevData={prevData}
          currentProfile={currentProfile}
        />
      </div>
    </Card>
  );
}

interface FormPropsType {
  show: boolean;
  currentProfile?: ProfileType;
  prevData?: PostType;
}

function PostForm({ show, currentProfile, prevData }: FormPropsType) {
  //기본 form 데이터 -> 이미지, 텍스트, 프로필
  const textRef = useRef<HTMLTextAreaElement>(null);
  // index가 있어야 slide에서 현재 보고 있는 이미지 위치를 가져올 수 있음
  const [images, setImages] = useState<ImageType[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [index, setIndex] = useState<number>(0);

  //수정인 경우 이미지 설정
  useEffect(() => {
    if (prevData) {
      if (prevData.postImages.length) {
        const imageURLs = prevData.postImages.map((image) => image);
        setImages(imageURLs);
      }
    }
  }, [prevData]);

  //이미지 추가 handler
  const AddImages: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputFiles = event.target.files;
    if (inputFiles) {
      const fileArray = Array.from(inputFiles);
      setFiles((prev) => [...prev, ...fileArray]);
      const ImageObj = fileArray.map<ImageType>((file) => ({
        URL: URL.createObjectURL(file),
        Key: file.name,
      }));
      setImages((prev) => [...prev, ...ImageObj]);
    }
  };

  //수정인 경우 제거된 이미지가 있으면 제거된 이미지 저장해서 서버에 전송
  const [removedImages, setRemovedImages] = useState<ImageType[]>([]);

  //이미지 제거 -> 수정인 경우엔 이전 이미지 제거
  //새로 추가된 이미지면 그냥 제거, 원래 있던 이미지면 removedImages에 저장해서 서버에 전송
  const removeImages = () => {
    const removeImage = images[index];
    //새로 추가된 이미지가 아닌 경우
    if (!files.find((file) => file.name === removeImage.Key)) {
      setRemovedImages((prev) => [...prev, removeImage]);
    }
    setImages((prevImages) => prevImages.filter((elem, i) => i !== index));
    setFiles((prevFiles) => prevFiles.filter((elem, i) => i !== index));
    setIndex((index) => {
      if (index > 0) {
        return index - 1;
      } else {
        return index;
      }
    });
  };

  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState<boolean>(false);
  //제출 버튼 눌렀을 때 사용할 함수
  const submit = async () => {
    const text = textRef.current?.value.trim();
    if (!text && !images.length && !currentProfile) {
      //데이터가 없는 경우 무시
      return;
    }
    if ((text || images.length) && currentProfile) {
      //텍스트가 있거나 이미지가 있는 경우 && 선택된 프로필이 있는 경우
      let data: CreatePostReqType = {
        text: text ? text : "",
        profile: currentProfile._id,
        category: currentProfile.category._id,
      };
      //새로 추가된 이미지가 있으면 추가
      if (files.length) {
        data = {
          ...data,
          newImages: files,
        };
      }
      if (prevData) {
        //수정인 경우
        if (
          prevData.postImages === images &&
          prevData.profile?._id === currentProfile._id &&
          prevData.text === text
        ) {
          //바뀐게 없는 경우 그냥 닫아야함
          dispatch(clearModifyContentId());
          setLoading(false);
          setImages([]);
          setFiles([]);
          if (textRef.current) {
            textRef.current.value = "";
          }
          return;
        }
        let updateData: UpdatePostReqType = {
          ...data,
          _id: prevData._id,
        };
        if (removedImages.length) {
          updateData = {
            ...updateData,
            removedImages: removedImages,
          };
        }
        const formData = new TypedForm<UpdatePostReqType>(updateData);
        try {
          setLoading(true);
          const response = await postAPI.update(formData);
          const updatedPost = response.data;
          dispatch(updatePost(updatedPost));
          dispatch(clearModifyContentId());
          setLoading(false);
          setImages([]);
          setFiles([]);
          if (textRef.current) {
            textRef.current.value = "";
          }
        } catch {
          window.alert(
            "포스트 업데이트 중에 오류가 발생했습니다. 다시 시도해주세요."
          );
          setLoading(false);
        }
      } else {
        //추가인 경우
        const formData = new TypedForm<CreatePostReqType>(data);
        try {
          setLoading(true);
          const response = await postAPI.create(formData);
          const newPost = response.data;
          dispatch(createPost(newPost));
          dispatch(clearModifyContentId());
          setLoading(false);
          setImages([]);
          setFiles([]);
          if (textRef.current) {
            textRef.current.value = "";
          }
        } catch {
          window.alert(
            "포스트 추가 중에 오류가 발생했습니다. 다시 시도해주세요."
          );
          setLoading(false);
        }
      }
    }
  };

  //취소
  const cancleModify = useCallback(() => {
    dispatch(clearModifyContentId());
    setImages([]);
    setFiles([]);
    if (textRef.current) {
      textRef.current.value = "";
    }
  }, [dispatch]);

  //추가인경우 form이 닫혀있을 수 있음
  if (!show || !currentProfile) {
    return null;
  }

  return (
    <>
      <Card.Footer className={styles.card_footer}>
        <div className={styles.card_footer_btns}>
          <ImageFileInputButton onImageFileInput={AddImages} multiple />
          <DefaultButton onClick={removeImages} size="sq_md">
            <BsTrash />
          </DefaultButton>
        </div>
        {images.length ? (
          <ImageSlide images={images} index={index} setIndex={setIndex} />
        ) : null}
        <DefaultTextarea
          defaultValue={prevData?.text || ""}
          ref={textRef}
          size="lg"
        />
        <div className={styles.card_footer_bottom_btns}>
          <DefaultButton
            onClick={submit}
            size="md"
            disabled={loading}
            className={styles.btn_margin}
          >
            <LoadingBlock loading={loading}>등록</LoadingBlock>
          </DefaultButton>
          <DefaultButton onClick={cancleModify} size="md" disabled={loading}>
            취소
          </DefaultButton>
        </div>
      </Card.Footer>
    </>
  );
}
