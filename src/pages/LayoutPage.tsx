import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CategoryBar from "../components/organisms/CategoryBar";
import HeaderBar from "../components/organisms/HeaderBar";
import UserInfoBar from "../components/organisms/UserInfoBar";
import useScrollLock from "../hooks/useScrollLock";
import styles from "./scss/LayoutPage.module.scss";
import useIsMobile from "../hooks/useIsMobile";

export default function LayoutPage() {
  const [showCategory, setShowCategory] = useState<boolean>(false);

  const { scrollLock, scrollRelease } = useScrollLock();

  const showCategoryHandler = useCallback(() => {
    setShowCategory((prev) => {
      if (prev) {
        scrollRelease();
      } else {
        scrollLock();
      }
      return !prev;
    });
  }, [scrollLock, scrollRelease]);

  //작은 화면에서 카테고리를 열어놓은 채로 화면 키우면
  //카테고리는 사라지는데
  //scrollLock 그대로 유지됨
  //화면 커지면 scrollLock도 풀어야함
  const isMobile = useIsMobile();
  useEffect(() => {
    if (!isMobile) {
      document.body.style.overflow = "auto";
    }
  }, [isMobile]);

  const closeCategoryBar = useCallback(() => {
    setShowCategory(false);
    scrollRelease();
  }, [scrollRelease]);

  //URI 변경되면 -> 다른 포스트 보여주면 스크롤 위로 이동
  const location = useLocation();
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    });
  }, [location]);

  return (
    <div className={styles.container}>
      <header>
        <div className={styles.header_container}>
          <div className={styles.header_fixed_container}>
            <div className={styles.header_content_container}>
              <HeaderBar showCategoryHandler={showCategoryHandler} />
            </div>
          </div>
        </div>
      </header>
      <div className={styles.content_container}>
        <nav>
          <div
            className={`${styles.nav_container} ${
              showCategory ? styles.nav_container_show : ""
            }`}
          >
            <CategoryBar show={showCategory} close={closeCategoryBar} />
          </div>
        </nav>
        <main>
          <div className={styles.main_container}>
            <Outlet />
          </div>
        </main>
        <aside>
          <div className={styles.right_aside_container}>
            <UserInfoBar />
          </div>
        </aside>
      </div>
    </div>
  );
}
