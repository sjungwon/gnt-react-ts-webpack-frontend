import { ChangeEventHandler, FC, useCallback, useState } from "react";
import { Modal } from "react-bootstrap";
import { chagnePasswordAPI, findPasswordAPI } from "../../apis/auth";
import { isEmailType } from "../../functions/TextValidFunc";
import useConfirmPassword from "../../hooks/useConfirmPassword";
import DefaultButton from "../atoms/DefaultButton";
import DefaultTextInput from "../atoms/DefaultTextInput";
import LoadingBlock from "../atoms/LoadingBlock";
import styles from "./scss/FindPasswordModal.module.scss";

interface PropsType {
  show: boolean;
  close: () => void;
}

const FindPasswordModal: FC<PropsType> = ({ show, close }) => {
  const [username, setUsername] = useState<string>("");
  const onChangeUsername: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setUsername(event.target.value);
    },
    []
  );

  const [email, setEmail] = useState<string>("");
  const [emailValid, setEmailValid] = useState<boolean>(false);
  const [emailValidMsg, setEmailValidMsg] = useState<string>("");
  const onChangeEmail: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setEmail(event.target.value);
      if (isEmailType(event.target.value)) {
        setEmailValid(true);
        setEmailValidMsg("");
        return;
      }
      setEmailValid(false);
      setEmailValidMsg("이메일 형식으로 입력해주세요.");
    },
    []
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [submitMsg, setSubmitMsg] = useState<string>("");

  const submit = useCallback(async () => {
    if (!username || !email) {
      return;
    }
    setLoading(true);
    try {
      await findPasswordAPI({ username, email });
      // await AuthServices.findPassword(username);
      setSuccess(true);
      setSubmitMsg(
        "사용자 정보가 확인되었습니다. 변경하실 비밀번호를 입력해주세요."
      );
    } catch (err: any) {
      setSubmitMsg(
        "등록된 사용자가 아니거나 잘못 입력하셨습니다. 입력하신 사용자 이름을 확인해주세요."
      );
      setSuccess(false);
    }
    setLoading(false);
  }, [username, email]);

  const {
    password,
    passwordVerify,
    passwordVerifyMessage,
    confirmPassword,
    confirmPasswordVerify,
    confirmPasswordVerifyMessage,
    setAndVerifyPassword,
    changeConfirmPassword,
    init: passwordInit,
  } = useConfirmPassword();

  const closeWithInit = useCallback(() => {
    setUsername("");
    setLoading(false);
    setSuccess(false);
    setSubmitMsg("");
    setEmail("");
    setEmailValid(false);
    setEmailValidMsg("");
    passwordInit();
    close();
  }, [close, passwordInit]);

  const confirmSubmit = useCallback(async () => {
    if (
      !password ||
      !username ||
      !email ||
      !passwordVerify ||
      !confirmPasswordVerify
    ) {
      return;
    }

    try {
      await chagnePasswordAPI({ username, email, password });
      window.alert("새 비밀번호로 변경되었습니다.");
      closeWithInit();
    } catch (err) {
      window.alert("오류가 발생했습니다. 다시 시도해주세요.");
      closeWithInit();
    }
  }, [
    closeWithInit,
    confirmPasswordVerify,
    password,
    passwordVerify,
    username,
    email,
  ]);

  return (
    <Modal
      show={show}
      onHide={closeWithInit}
      centered
      backdrop={"static"}
      size="sm"
    >
      <Modal.Header closeButton>비밀번호 찾기</Modal.Header>
      <Modal.Body className={styles.body}>
        <div className={styles.input_block}>
          <label className={styles.label}>사용자 이름 :</label>
          <DefaultTextInput
            value={username}
            onChange={onChangeUsername}
            disabled={success}
          />
        </div>
        <div className={styles.input_block}>
          <label className={styles.label}>이메일 :</label>
          <DefaultTextInput
            value={email}
            onChange={onChangeEmail}
            className={styles.input}
            disabled={success}
          />
        </div>
        <p className={styles.message}>{emailValidMsg}</p>
        <DefaultButton
          size="md"
          onClick={submit}
          disabled={!username || success || !email || !emailValid}
        >
          <LoadingBlock loading={loading}>찾기</LoadingBlock>
        </DefaultButton>
        <p className={styles.message}>{submitMsg}</p>
        <div className={success ? "" : styles.hide}>
          <div className={styles.input_block}>
            <label className={styles.label}>새 비밀번호 :</label>
            <DefaultTextInput
              value={password}
              onChange={setAndVerifyPassword}
              type="password"
            />
          </div>
          <p className={styles.message}>{passwordVerifyMessage}</p>
          <div className={styles.input_block}>
            <label className={styles.label}>새 비밀번호 확인 :</label>
            <DefaultTextInput
              value={confirmPassword}
              onChange={changeConfirmPassword}
              type="password"
            />
          </div>
          <p className={styles.message}>{confirmPasswordVerifyMessage}</p>
          <DefaultButton
            size="md"
            onClick={confirmSubmit}
            disabled={
              !username ||
              !password ||
              !passwordVerify ||
              !confirmPasswordVerify
            }
          >
            변경
          </DefaultButton>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default FindPasswordModal;
