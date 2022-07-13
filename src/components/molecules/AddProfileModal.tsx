import {
  FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Modal } from "react-bootstrap";
import styles from "./scss/AddProfileModal.module.scss";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import DefaultTextInput from "../atoms/DefaultTextInput";
import AddCategory from "./AddCategory";
import { BsTrash } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  addProfileThunk,
  ProfileType,
  updateProfileThunk,
} from "../../redux/modules/profile";
import { isIncludePathSpecial } from "../../functions/TextValidFunc";
import { AddProfileReqType, UpdateProfileReqType } from "../../apis/profile";
import CategorySelector from "../atoms/CategorySelector";
import { TypedForm } from "../../classes/TypedForm";
import ImageFileInputButton from "../atoms/ImageFileInputButton";

interface PropsType {
  show: boolean;
  close: () => void;
  prevData?: ProfileType;
}

interface ProfileCategoryType {
  _id: string;
  title: string;
}

export default function AddProfileModal({ show, close, prevData }: PropsType) {
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );
  const profiles = useSelector((state: RootState) => state.profile.profiles);
  const status = useSelector(
    (state: RootState) =>
      state.profile.modifyStatus[prevData ? prevData._id : "add"]
  );

  const dispatch = useDispatch<AppDispatch>();

  const nicknameRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<ProfileCategoryType | null>(null);

  const select = useCallback(
    (eventKey: string | null) => {
      if (eventKey !== null && categories.length) {
        const index = Number(eventKey);
        setSelectedCategory(categories[index]);
      }
    },
    [categories]
  );

  const [file, setFile] = useState<File | undefined | null>(undefined);
  const [image, setImage] = useState<string>("");

  //초기 설정
  useEffect(() => {
    if (!prevData) {
      if (nicknameRef.current) {
        nicknameRef.current.value = "";
      }
      setSelectedCategory(null);
      setImage("");
      return;
    }

    if (nicknameRef.current) {
      nicknameRef.current.value = prevData.nickname;
    }
    setSelectedCategory(prevData.category);

    setImage(prevData.profileImage.URL);
    // if (prevData.credential) {
    //   getPrevImage(prevData.credential, "credential");
    // }
  }, [prevData, show]);

  // const [credentialFile, setCredentialFile] = useState<File | undefined>(
  //   undefined
  // );
  // const [credentialImage, setCredentialImage] = useState<string>("");
  // const [prevCredentialImageKey, setPrevCredentialImageKey] = useState<
  //   ImageKeys | undefined
  // >(prevData?.credential);

  const addImage = useCallback((event: any) => {
    const files = (event.target as HTMLInputElement).files;
    const file = files ? files[0] : null;
    if (file) {
      setFile(file);
      setImage(URL.createObjectURL(file));
    }
  }, []);

  const removeImage = useCallback(() => {
    if (prevData && prevData.profileImage.URL) {
      setFile(null);
    } else {
      setFile(undefined);
    }
    setImage("");
  }, [prevData]);

  // const addCredentialImage: ChangeEventHandler<HTMLInputElement> = useCallback(
  //   (event) => {
  //     const files = event.target.files;
  //     const file = files ? files[0] : null;
  //     if (file) {
  //       setCredentialFile(file);
  //       setCredentialImage(URL.createObjectURL(file));
  //       setPrevCredentialImageKey({
  //         resizedKey: "change",
  //         fullsizeKey: "change",
  //       });
  //     }
  //   },
  //   []
  // );

  // const removeCredentialImage = useCallback(() => {
  //   setCredentialFile(undefined);
  //   setCredentialImage("");
  //   setPrevCredentialImageKey({
  //     resizedKey: "removed",
  //     fullsizeKey: "removed",
  //   });
  // }, []);

  const submitProfile = useCallback(async () => {
    if (!selectedCategory) {
      window.alert("게임을 선택해주세요.");
      return;
    }
    const nickname = nicknameRef.current
      ? nicknameRef.current.value.trim()
      : "";

    //닉네임 데이터 없으면 아무것도 안함
    if (!nickname) return;

    //데이터 검증 -> 이름에 path 문자 검사
    if (isIncludePathSpecial(nickname)) {
      window.alert(
        `닉네임에 ! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) 는 포함할 수 없습니다.`
      );
      return;
    }

    //변경된 데이터 없으면 모달 닫기
    if (
      prevData &&
      selectedCategory.title === prevData.category.title &&
      prevData.nickname === nickname &&
      prevData.profileImage.URL === image
      // prevCredentialImageKey?.resizedKey !== "change"
    ) {
      close();
      return;
    }

    //데이터 검증 -> 동일 프로필 중복 검사
    if (
      profiles.find(
        (profile) =>
          profile.category.title === selectedCategory.title &&
          profile.nickname === nickname &&
          (!prevData || prevData._id !== profile._id)
      )
    ) {
      window.alert("이미 존재하는 프로필입니다.");
      return;
    }

    let data: AddProfileReqType = {
      nickname,
      category: selectedCategory._id,
    };
    // if (credentialFile) {
    //   const credentialImage = await FileServices.putPostImage(credentialFile);
    //   if (!credentialImage) {
    //     window.alert(
    //       `프로필 ${
    //         prevData ? "수정" : "추가"
    //       }에 실패했습니다. 다시 시도해주세요.`
    //     );
    //     setLoading(false);
    //     return;
    //   }
    //   data = {
    //     ...data,
    //     credential: credentialImage,
    //   };
    // }
    // let profile: ProfileType | null = null;
    if (prevData) {
      let updateData: UpdateProfileReqType = { ...data };
      if (file || file === null) {
        updateData = {
          ...data,
          profileImage: file,
        };
      }
      dispatch(
        updateProfileThunk({
          profileId: prevData._id,
          profileData: new TypedForm<UpdateProfileReqType>(updateData),
        })
      );
    } else {
      if (file) {
        data = {
          ...data,
          profileImage: file,
        };
      }
      dispatch(addProfileThunk(new TypedForm<AddProfileReqType>(data)));
    }
  }, [close, dispatch, file, image, prevData, profiles, selectedCategory]);

  const testSubmit: FormEventHandler = useCallback((event) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    if (status === "success") {
      close();
      if (prevData) {
        // console.log("reload");
        // window.location.reload();
        //나중에는 reload필요한 쪽만 dispatch thunk 다시 던지면 될 듯
      }
    }
  }, [status, close, prevData]);

  const [addCategoryShow, setAddCategoryShow] = useState<boolean>(false);
  const addCategoryShowOpen = useCallback(() => {
    setAddCategoryShow(true);
  }, []);
  const addCategoryShowClose = useCallback(() => {
    setAddCategoryShow(false);
  }, []);

  return (
    <Modal backdrop="static" show={show} size="sm" centered>
      <Modal.Header>
        <Modal.Title className={styles.title}>
          프로필 {prevData ? "수정" : "추가"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DefaultButton size="md" onClick={addCategoryShowOpen} color="blue">
          게임 추가
        </DefaultButton>
        <div className={styles.form}>
          <AddCategory show={addCategoryShow} close={addCategoryShowClose} />
        </div>
        <form encType="multipart/form-data" onSubmit={testSubmit}>
          <div className={styles.form}>
            <label className={styles.form_label}>게임: </label>
            <DefaultTextInput
              disabled
              value={
                categories.length
                  ? selectedCategory
                    ? selectedCategory.title
                    : "게임을 선택해주세요."
                  : "게임을 추가해주세요."
              }
              className={styles.input}
              name="category"
            />
            <CategorySelector
              onSelect={select}
              size="sm"
              categories={categories}
            />
          </div>
          <div className={styles.form}>
            <label className={styles.form_label}>프로필 이미지:</label>
            <img
              src={image ? image : "/default_profile.png"}
              alt="added_profile"
              className={styles.form_file_img}
            />
            <ImageFileInputButton
              onImageFileInput={addImage}
              multiple={false}
              color="blue"
            />
            <DefaultButton
              onClick={removeImage}
              size="sq_md"
              className={styles.margin_left}
              color="blue"
            >
              <BsTrash />
            </DefaultButton>
          </div>
          <div className={styles.form}>
            <label className={styles.form_label}>닉네임: </label>
            <DefaultTextInput
              ref={nicknameRef}
              placeholder="닉네임을 입력해주세요"
              className={styles.input}
              name="nickname"
            />
          </div>
        </form>

        {/* <div className={styles.form}>
          <label className={styles.form_label}>게임: </label>
          <DefaultTextInput
            disabled
            value={
              categories.length
                ? selectedCategory
                  ? selectedCategory.title
                  : "게임을 선택해주세요."
                : "게임을 추가해주세요."
            }
            className={styles.input}
          />
          <CategorySelector
            onSelect={select}
            size="sm"
            categories={categories}
          />
        </div> */}
        {/* <div className={styles.form}>
          <label className={styles.form_label}>프로필 이미지:</label>
          <img
            // src={image ? image : "/default_profile.png"}
            src="/default_profile.png"
            alt="added_profile"
            className={styles.form_file_img}
          /> */}
        {/* <ImageFileInputButton
            onImageFileInput={addImage}
            multiple={false}
            color="blue"
          />
          <DefaultButton
            onClick={removeImage}
            size="sq_md"
            className={styles.margin_left}
            color="blue"
          >
            <BsTrash />
          </DefaultButton> */}
        {/* </div> */}
        {/* <div className={styles.form}>
          <label className={styles.form_label}>닉네임: </label>
          <DefaultTextInput
            ref={nicknameRef}
            placeholder="닉네임을 입력해주세요"
            className={styles.input}
          />
        </div> */}
        {/* <div>
          <div className={styles.form}>
            <label className={`${styles.form_label} ${styles.margin_right}`}>
              인증(선택):{" "}
            </label>
            <ImageFileInputButton
              onImageFileInput={addCredentialImage}
              multiple={false}
              color="blue"
            />
            <DefaultButton
              onClick={removeCredentialImage}
              size="sq_md"
              className={styles.margin_left}
              color="blue"
            >
              <BsTrash />
            </DefaultButton>
          </div>
          {credentialImage ? (
            <ImageSlide images={[credentialImage]} noIndicator />
          ) : null}
        </div> */}
        {prevData ? (
          <p className={styles.warning}>
            프로필 수정 시 다른 데이터에 반영하기 위해 페이지가 새로고침됩니다.
          </p>
        ) : null}
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <DefaultButton
          size="md"
          onClick={submitProfile}
          disabled={status === "pending"}
        >
          <LoadingBlock loading={status === "pending"}>
            {prevData ? "수정" : "추가"}
          </LoadingBlock>
        </DefaultButton>
        <DefaultButton
          size="md"
          onClick={close}
          disabled={status === "pending"}
        >
          취소
        </DefaultButton>
      </Modal.Footer>
    </Modal>
  );
}
