import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./scss/LoginPage.module.scss";
import { AiOutlineArrowLeft } from "react-icons/ai";
import DefaultButton from "../components/atoms/DefaultButton";
import DefaultTextInput from "../components/atoms/DefaultTextInput";
import LoadingBlock from "../components/atoms/LoadingBlock";
import { useDispatch, useSelector } from "react-redux";
import { AppDispath, RootState } from "../redux/store";
import { signinThunk } from "../redux/modules/auth";
import RegisterModal from "../components/molecules/RegisterModal";
import FindPasswordModal from "../components/molecules/FindPasswordModal";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const dispatch = useDispatch<AppDispath>();
  const status = useSelector((state: RootState) => state.auth.loginStatus);
  const message = useSelector((state: RootState) => state.auth.loginMessage);

  const submitRef = useRef<HTMLButtonElement>(null);
  const [mdShow, setMdShow] = useState<boolean>(false);
  const [btnDisabled, setbtnDisabled] = useState<boolean>(true);

  const openModal = useCallback(() => {
    setMdShow(true);
  }, []);

  const closeModal = useCallback(() => {
    setMdShow(false);
  }, []);

  //username input 데이터 state에 저장 + 로그인 버튼 활성화 검증
  const usernameChange = useCallback(
    (event: any) => {
      const usernameText = (event.target as HTMLInputElement).value;
      setUsername(usernameText);
      if (usernameText && password) {
        setbtnDisabled(false);
      } else {
        setbtnDisabled(true);
      }
    },
    [password]
  );

  //password input 데이터 state에 저장 + 로그인 버튼 활성화 검증
  const passwordChange = useCallback(
    (event: any) => {
      const passwordText = (event.target as HTMLInputElement).value;
      setPassword(passwordText);
      if (username && passwordText) {
        setbtnDisabled(false);
      } else {
        setbtnDisabled(true);
      }
    },
    [username]
  );

  const navigate = useNavigate();

  //제출
  const clickToSubmit: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      event.preventDefault();
      if (username && password) {
        dispatch(signinThunk({ username, password }));
      }
    },
    [dispatch, password, username]
  );

  useEffect(() => {
    if (status === "success") {
      navigate(-1);
    }
  }, [navigate, status]);

  const enterSubmit = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        submitRef.current?.click();
      }
    },
    [submitRef]
  );

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const [showFindPassword, setShowFindPassword] = useState<boolean>(false);
  const openFindPassword = useCallback(() => {
    setShowFindPassword(true);
  }, []);
  const closeFindPassword = useCallback(() => {
    setShowFindPassword(false);
  }, []);

  return (
    <div className={styles.login}>
      <DefaultButton size="sq_md" onClick={goBack} className={styles.btn_back}>
        <AiOutlineArrowLeft />
      </DefaultButton>
      <div className={styles.login_card}>
        <div className={styles.login_card__wrapper}>
          <h1 className={styles.login_title}>그님티</h1>
          <h2 className={styles.login_subtitle}>
            그님티에서 당신의 게임 프로필로 <br /> 대화해보세요.
          </h2>
          <div className={styles.login_card__bottom}>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label visuallyHidden={true}>사용자 이름</Form.Label>
                <DefaultTextInput
                  type="text"
                  placeholder="사용자 이름을 입력해주세요."
                  size="xl"
                  value={username}
                  onChange={usernameChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label visuallyHidden={true}>비밀번호</Form.Label>
                <DefaultTextInput
                  type="password"
                  placeholder="비밀번호를 입력해주세요."
                  value={password}
                  onChange={passwordChange}
                  onKeyDown={enterSubmit as any}
                  size="xl"
                  required
                />
              </Form.Group>
              <Form.Text
                id="passwordHelpBlock"
                bsPrefix={styles.login_error__message}
              >
                {message}
              </Form.Text>
              <DefaultButton
                size="xl"
                onClick={clickToSubmit}
                disabled={status === "pending" || btnDisabled}
                ref={submitRef}
              >
                <LoadingBlock loading={status === "pending"}>
                  로그인
                </LoadingBlock>
              </DefaultButton>
            </Form>
            <div
              className={styles.find_password}
              tabIndex={0}
              onClick={openFindPassword}
            >
              비밀번호를 잊으셨나요?
            </div>
            <FindPasswordModal
              show={showFindPassword}
              close={closeFindPassword}
            />
            <div className={styles.line}></div>
            <div className={styles.register_container}>
              <DefaultButton size="xl" onClick={openModal} color="blue">
                회원가입
              </DefaultButton>
              <RegisterModal mdShow={mdShow} mdClose={closeModal} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
