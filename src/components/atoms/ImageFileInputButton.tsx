import { ChangeEventHandler, FC, useCallback, useRef } from "react";
import { AiOutlineFileAdd } from "react-icons/ai";
import DefaultButton from "./DefaultButton";
import styles from "./scss/ImageFileInputButton.module.scss";

interface PropsType {
  onImageFileInput: ChangeEventHandler<HTMLInputElement>;
  multiple?: boolean;
  color?: "blue";
}

//file input 태그의 파일 선택을 감추고 기본 button으로 파일 선택 처리
const ImageFileInputButton: FC<PropsType> = ({
  onImageFileInput,
  multiple = false,
  color,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const openFileInput = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  return (
    <>
      <input
        type="file"
        accept="image/jpg,image/png,image/jpeg"
        onInput={onImageFileInput}
        multiple={multiple}
        className={styles.modal_body_file}
        ref={fileRef}
      />
      <DefaultButton size="sq_md" onClick={openFileInput} color={color}>
        <AiOutlineFileAdd />
      </DefaultButton>
    </>
  );
};

export default ImageFileInputButton;
