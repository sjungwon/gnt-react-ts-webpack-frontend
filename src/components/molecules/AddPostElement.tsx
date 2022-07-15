import {
  ChangeEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Card } from "react-bootstrap";
import styles from "./scss/AddPostElement.module.scss";
import DefaultButton from "../atoms/DefaultButton";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
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
import { AddPostReqType, PostAPI, UpdatePostReqType } from "../../apis/post";
import {
  addPostThunk,
  PostType,
  updatePostThunk,
} from "../../redux/modules/post";

interface Props {
  prevData?: {
    setMode: (mode: "" | "modify") => void;
    postData: PostType;
  };
}

//prevData에 따라 수정, 추가 상태 결정
export default function AddPostElement({ prevData }: Props) {
  //프로필 데이터 사용
  // const {
  //   username,
  //   filteredProfileArr,
  //   profileArr,
  //   currentProfile: defaultProfile,
  // } = useContext(UserDataContext);

  //prevData 유무에 따라 form을 바로 보여줄 지 결정
  const [show, setShow] = useState(!!prevData);

  //form 열고 닫는 함수
  const showHandler = useCallback(() => {
    setShow((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setShow(false);
  }, []);

  const username = useSelector((state: RootState) => state.auth.username);
  const profiles = useSelector((state: RootState) => state.profile.profiles);
  const currentCategoryTitle = useSelector(
    (state: RootState) => state.category.currentCategoryTitle
  );

  const [filteredProfiles, setFilteredProfiles] = useState<ProfileType[]>([]);
  const [currentProfile, setCurrentProfile] = useState<
    ProfileType | undefined
  >();

  //prevData가 있으면 해당 데이터의 프로필로 현재 프로필 변경, 없으면 첫번째 프로필로 설정
  useEffect(() => {
    if (prevData) {
      const filteredProfileTmp = profiles.filter(
        (profile) => profile.category.title === prevData.postData.category.title
      );
      setFilteredProfiles(filteredProfileTmp);
      const finded = filteredProfileTmp.find(
        (profile) => profile._id === prevData?.postData.profile._id
      );
      setCurrentProfile(finded ? finded : undefined);
      return;
    }
    const filteredProfileTmp =
      currentCategoryTitle === "all"
        ? profiles
        : profiles.filter(
            (profile) => profile.category.title === currentCategoryTitle
          );
    setFilteredProfiles(filteredProfileTmp);
    setCurrentProfile(
      filteredProfileTmp.length ? filteredProfileTmp[0] : undefined
    );
  }, [currentCategoryTitle, prevData, profiles]);

  return (
    <Card className={styles.card}>
      <div className={username ? "" : styles.disabled}>
        {prevData ? null : (
          <Card.Header className={styles.card_header}>
            <Card.Title className={styles.card_header_title}>
              유저 메뉴
            </Card.Title>
            <UserProfileList />
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
          close={close}
          prevData={prevData}
          currentProfile={currentProfile}
        />
      </div>
    </Card>
  );
}

interface FormPropsType {
  show: boolean;
  close: () => void;
  currentProfile?: ProfileType;
  prevData?: {
    setMode: (mode: "" | "modify") => void;
    postData: PostType;
  };
}

function PostForm({ show, close, currentProfile, prevData }: FormPropsType) {
  //기본 form 데이터 -> 이미지, 텍스트, 프로필
  const textRef = useRef<HTMLTextAreaElement>(null);

  const cancleModify = useCallback(() => {
    if (prevData) {
      prevData.setMode("");
    }
    close();
  }, [close, prevData]);

  // index가 있어야 slide에서 현재 보고 있는 이미지 위치를 가져올 수 있음
  const [images, setImages] = useState<ImageType[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [index, setIndex] = useState<number>(0);

  //수정인 경우 이미지 설정
  useEffect(() => {
    if (prevData) {
      if (prevData.postData.postImages.length) {
        const imageURLs = prevData.postData.postImages.map((image) => image);
        setImages(imageURLs);
      }
    }
  }, [prevData]);

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

  const [removedImages, setRemovedImages] = useState<ImageType[]>([]);

  //이미지 제거 -> 수정인 경우엔 이전 이미지 제거
  //새로 추가된 이미지면 그냥 제거, 원래 있던 이미지면 제거된 이미지로 데이터 전송
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
  const status = useSelector((state: RootState) => state.post.status);

  //제출 버튼 눌렀을 때 사용할 함수
  const submit = async () => {
    const text = textRef?.current?.value.trim();
    // if (text || images.length) {
    if ((text || images.length) && currentProfile) {
      let data: AddPostReqType = {
        text: text ? text : "",
        profile: currentProfile._id,
        category: currentProfile.category._id,
      };
      if (files.length) {
        data = {
          ...data,
          newImages: files,
        };
      }
      if (prevData) {
        let updateData: UpdatePostReqType = {
          ...data,
          _id: prevData.postData._id,
        };
        if (removedImages.length) {
          updateData = {
            ...updateData,
            removedImages: removedImages,
          };
        }
        const formData = new TypedForm<UpdatePostReqType>(updateData);
        dispatch(updatePostThunk(formData));
      } else {
        const formData = new TypedForm<AddPostReqType>(data);
        dispatch(addPostThunk(formData));
      }
      // setImages([]);
      // setFiles([]);
      // if (textRef.current) {
      //   textRef.current.value = "";
      // }
    }
  };

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
          defaultValue={prevData?.postData.text || ""}
          ref={textRef}
          size="lg"
        />
        <div className={styles.card_footer_bottom_btns}>
          <DefaultButton
            onClick={submit}
            size="md"
            disabled={status === "pending"}
            className={styles.btn_margin}
          >
            <LoadingBlock loading={status === "pending"}>등록</LoadingBlock>
          </DefaultButton>
          <DefaultButton
            onClick={cancleModify}
            size="md"
            disabled={status === "pending"}
          >
            취소
          </DefaultButton>
        </div>
      </Card.Footer>
    </>
  );
}
