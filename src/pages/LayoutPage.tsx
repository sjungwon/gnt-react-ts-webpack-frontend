import { useState } from "react";
import { Outlet } from "react-router-dom";
import CategoryBar from "../components/organisms/CategoryBar";
import HeaderBar from "../components/organisms/HeaderBar";
import UserInfoBar from "../components/organisms/UserInfoBar";
import styles from "./scss/LayoutPage.module.scss";

export default function LayoutPage() {
  const [show, setShow] = useState<boolean>(true);

  return (
    <div className={styles.container}>
      <header>
        <div className={styles.header_container}>
          <div className={styles.header_fixed_container}>
            <div className={styles.header_content_container}>
              <HeaderBar showCategoryHandler={() => {}} />
            </div>
          </div>
        </div>
      </header>
      <div className={styles.content_container}>
        <nav>
          <div
            className={`${styles.nav_container} ${
              show ? styles.nav_container_show : ""
            }`}
          >
            <CategoryBar show={true} />
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
