import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameSearchRecommend from "../molecules/RecommendSearchBar";
import styles from "./scss/HeaderBar.module.scss";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineSearch } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import gsap from "gsap";
import MobileButton from "../atoms/MobileButton";
import DefaultButton from "../atoms/DefaultButton";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { signoutThunk } from "../../redux/modules/auth";
import { clearProfileStateLogout } from "../../redux/modules/profile";
import useIsMobile from "../../hooks/useIsMobile";

interface PropsType {
  showCategoryHandler: () => void;
}

export default function HeaderBar({ showCategoryHandler }: PropsType) {
  const username = useSelector((state: RootState) => state.auth.username);

  const navigate = useNavigate();
  const clickToLogin = useCallback(() => {
    navigate("/signin");
  }, [navigate]);

  //모바일에서 사용
  //검색바 열고 닫는 데이터
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const showSearchBarHandler = useCallback(() => {
    setShowSearchBar((prev) => !prev);
  }, []);

  const searchBarRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();

  //모바일에서 검색바 버튼 클릭 시 열고 닫을 때 searchBar 애니메이션 처리
  useEffect(() => {
    if (window.innerWidth > 829) {
      //모바일이 아닌 경우
      return;
    }
    if (searchBarRef.current && showSearchBar) {
      gsap.to(searchBarRef.current, 0.2, {
        display: "flex",
        opacity: 1,
      });
    }
    if (searchBarRef.current && !showSearchBar) {
      gsap.to(searchBarRef.current, 0.2, {
        display: "none",
        opacity: 0,
      });
    }
  }, [showSearchBar]);

  //데스크탑인 경우 화면 크기 변경으로 searchBar가 안나올 수 있는거 방지
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile && searchBarRef.current) {
      searchBarRef.current.style.display = "flex";
      searchBarRef.current.style.opacity = "1";
    } else {
      if (searchBarRef.current) {
        searchBarRef.current.style.display = "none";
        searchBarRef.current.style.opacity = "0";
      }
    }
  }, [isMobile]);

  //유저 페이지로 이동
  const goHome = useCallback(() => {
    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    navigate(`/usernames/${username}`);
  }, [navigate, username]);

  return (
    <>
      <div className={styles.headerbar_btns}>
        <MobileButton
          onClick={showCategoryHandler}
          className={styles.btn_margin}
        >
          <GiHamburgerMenu />
        </MobileButton>
        <MobileButton onClick={showSearchBarHandler}>
          <AiOutlineSearch />
        </MobileButton>
      </div>
      <a href="/" className={styles.headerbar_title}>
        <img src="/logo192.png" alt="logo" className={styles.headerbar_logo} />
        <h1>그님티</h1>
      </a>
      <div className={styles.headerbar_search} ref={searchBarRef}>
        <GameSearchRecommend showInputHandlerForMobile={showSearchBarHandler} />
      </div>
      <div className={styles.headerbar_btns}>
        <DefaultButton
          size="sq_md"
          onClick={goHome}
          className={styles.btn_home}
        >
          <CgProfile />
        </DefaultButton>
        {username ? (
          <DefaultButton
            size="sm"
            onClick={() => {
              dispatch(signoutThunk());
              dispatch(clearProfileStateLogout());
            }}
            className={styles.btn_login}
          >
            로그아웃
          </DefaultButton>
        ) : (
          <DefaultButton
            size="sm"
            onClick={clickToLogin}
            className={styles.btn_login}
          >
            로그인
          </DefaultButton>
        )}
      </div>
    </>
  );
}
