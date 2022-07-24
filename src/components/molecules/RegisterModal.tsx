import {
  ChangeEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Form, Modal } from "react-bootstrap";
import styles from "./scss/RegisterModal.module.scss";
import DefaultTextInput from "../atoms/DefaultTextInput";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import useConfirmPassword from "../../hooks/useConfirmPassword";
import {
  isEmailType,
  isIncludePathSpecial,
  isShorterThanNumber,
} from "../../functions/TextValidFunc";
import { useDispatch, useSelector } from "react-redux";
import { signupThunk } from "../../redux/modules/auth";
import { AppDispatch, RootState } from "../../redux/store";

type RegisterProps = {
  mdShow: boolean;
  mdClose: () => void;
};

export default function RegisterModal({ mdShow, mdClose }: RegisterProps) {
  //이름 입력 검증
  const [username, setUsername] = useState<string>("");
  const [usernameVerify, setUsernameVerify] = useState<boolean>(false);
  const [usernameVerifyMessage, setUsernameVerifyMessage] =
    useState<string>("");
  const verifyUsername: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const usernameText = event.target.value;
      setUsername(usernameText);
      const usernameIncludeSpecial = isIncludePathSpecial(usernameText);
      if (usernameIncludeSpecial) {
        setUsernameVerifyMessage(
          `! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) 는 포함할 수 없습니다.`
        );
        setUsernameVerify(false);
        return;
      }
      const usernameLengthVerify = isShorterThanNumber(usernameText, 8);
      if (!usernameLengthVerify) {
        setUsernameVerifyMessage("8자 이하로 입력해주세요.");
        setUsernameVerify(false);
        return;
      }
      setUsernameVerifyMessage("");
      setUsernameVerify(true);
    },
    [setUsername]
  );

  //이메일 입력 검증
  const [email, setEmail] = useState<string>("");
  const [emailVerify, setEmailVerify] = useState<boolean>(false);
  const [emailVerifyMessage, setEmailVerifyMessage] = useState<string>("");
  const verifyEmail: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const emailText = event.target.value;
      setEmail(emailText);
      const emailTypeVerify = isEmailType(emailText);
      if (!emailTypeVerify) {
        setEmailVerifyMessage("이메일 형식으로 입력해주세요.");
        setEmailVerify(false);
        return;
      }
      setEmailVerifyMessage("");
      setEmailVerify(true);
    },
    [setEmail]
  );

  //비밀번호
  const {
    password,
    passwordVerify,
    passwordVerifyMessage,
    setAndVerifyPassword,
    confirmPassword,
    confirmPasswordVerify,
    confirmPasswordVerifyMessage,
    changeConfirmPassword,
    init: passwordInit,
  } = useConfirmPassword();

  useEffect(() => {
    setUsername("");
    setUsernameVerify(false);
    setUsernameVerifyMessage("");
    setEmail("");
    setEmailVerify(false);
    setEmailVerifyMessage("");
    passwordInit();
  }, [mdShow, passwordInit]);

  //회원가입 제출
  const dispatch = useDispatch<AppDispatch>();
  const submitSignUp: MouseEventHandler = useCallback(
    async (event) => {
      event.preventDefault();
      dispatch(signupThunk({ username, password, email }));
    },
    [dispatch, username, password, email]
  );

  //회원 가입 제출 상태
  const status = useSelector((state: RootState) => state.auth.registerStatus);
  //회원 가입 오류 시 오류 메세지
  const message = useSelector((state: RootState) => state.auth.registerMessage);

  useEffect(() => {
    if (status === "failed") {
      window.alert(message);
      return;
    }
    if (status === "success") {
      window.alert("회원 가입에 성공했습니다.");
      mdClose();
    }
  }, [status, message, mdClose]);

  return (
    <div>
      <Modal show={mdShow} onHide={mdClose} centered backdrop={"static"}>
        <Modal.Header closeButton>
          <Modal.Title className={styles.title}>회원가입</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label className={styles.label}>
                사용자 이름 (8자 이하) <span className={styles.red}> *</span>
              </Form.Label>
              <DefaultTextInput
                size="xl"
                placeholder="사용자 이름을 입력해주세요."
                value={username}
                onChange={verifyUsername}
                required
              />
              <Form.Text className={styles.red}>
                {usernameVerifyMessage}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className={styles.label}>
                이메일<span className={styles.red}> *</span>
              </Form.Label>
              <DefaultTextInput
                size="xl"
                placeholder="이메일을 입력해주세요."
                value={email}
                onChange={verifyEmail}
                type="email"
                required
              />
              <Form.Text className="text-muted">
                이메일은 중복 가입 확인 및 비밀번호 찾기를 위해 사용합니다.
              </Form.Text>
              <Form.Text id="passwordHelpBlock" className={styles.red}>
                <br />
                {emailVerifyMessage}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label className={styles.label}>
                비밀번호 <span className={styles.red}> *</span>
              </Form.Label>
              <DefaultTextInput
                size="xl"
                type="password"
                placeholder="비밀번호를 입력해주세요."
                value={password}
                onChange={setAndVerifyPassword}
                required
              />
              <Form.Text id="passwordHelpBlock" className={styles.red}>
                {passwordVerifyMessage}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
              <Form.Label className={styles.label}>
                비밀번호 확인 <span className={styles.red}>*</span>
              </Form.Label>
              <DefaultTextInput
                size="xl"
                type="password"
                placeholder="입력하신 비밀번호를 다시 입력해주세요."
                value={confirmPassword}
                onChange={changeConfirmPassword}
                required
              />
              <Form.Text id="confirmpasswordHelpBlock" className={styles.red}>
                {confirmPasswordVerifyMessage}
              </Form.Text>
            </Form.Group>
            <DefaultButton
              size="xl"
              onClick={submitSignUp}
              className={styles.submit_btn}
              disabled={
                !emailVerify ||
                !usernameVerify ||
                !passwordVerify ||
                !confirmPasswordVerify
              }
            >
              <LoadingBlock loading={status === "pending"}>
                회원가입
              </LoadingBlock>
            </DefaultButton>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
