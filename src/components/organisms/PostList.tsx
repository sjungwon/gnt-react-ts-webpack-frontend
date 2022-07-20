import styles from "./scss/PostList.module.scss";
import PostElement from "../molecules/PostElement";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
// import LoadingBlock from "../atoms/LoadingBlock";
// import UserMenuFixedButton from "../molecules/UserMenuFixedButton";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { getPostThunk } from "../../redux/modules/post";
import LoadingBlock from "../atoms/LoadingBlock";

export default function PostList() {
  const posts = useSelector((state: RootState) => state.post.posts);
  const status = useSelector((state: RootState) => state.post.status);
  const lastPostDate = useSelector(
    (state: RootState) => state.post.lastPostDate
  );
  const dispatch = useDispatch<AppDispatch>();
  const loading = useMemo(() => {
    return status === "pending";
  }, [status]);

  const sendQuery = useCallback(async () => {
    console.log(status);
    if (status !== "done" && status !== "failed" && status !== "pending") {
      dispatch(getPostThunk(lastPostDate));
    }
  }, [dispatch, lastPostDate, status]);

  const loader = useRef<HTMLDivElement>(null);

  const [prevPage, setPrevPage] = useState<number>(0);
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    if (page !== prevPage) {
      setPrevPage(page);
      sendQuery();
    }
  }, [page, sendQuery, prevPage]);

  const handleObserver: IntersectionObserverCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setPage((prev) => prev + 1);
      }
    },
    []
  );

  // IntersectionObserver에 전달하는 옵션
  // root는 어떤 기준으로 타겟 요소와 기준 요소 사이의 intersection 변화를
  // 탐지할지 작성
  // root는 가시성을 확인할 때 사용되는 뷰포트 요소
  // 대상 객체의 조상요소로 설정, 기본 값은 브라우저 뷰포트
  // root: null -> 브라우저 뷰포트로 설정
  // rootMargin -> root가 가진 여백 -> 시계방향으로 설정
  // margin으로 기준 요소를 수축, 증가시켜서 교차성을 계산
  // threshold -> 가시성을 비율로 나타냄 -> 얼마나 보여지면 콜백을 호출할 것인지 지정
  useEffect(() => {
    const option: IntersectionObserverInit = {
      root: null,
      rootMargin: "600px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    const savedLoader = loader.current;
    if (savedLoader) observer.observe(savedLoader);
    return () => {
      if (savedLoader) observer.unobserve(savedLoader);
    };
  }, [handleObserver]);

  //렌더
  //post가 있는 경우
  return (
    <>
      <div className={styles.container}>
        {/* <UserMenuFixedButton />
        <h3 className={styles.category}>{title}</h3>
        {category === "usernames" && decodeURI(searchParam) !== username ? (
          <UserHomeCard username={decodeURI(searchParam)} />
        ) : null}
        {category === "profiles" ? (
          <ProfileCard searchProfile={searchProfile} />
        ) : null}
        {!category ||
        category === "games" ||
        (category === "usernames" && username === decodeURI(searchParam)) ||
        (category === "profiles" && currentProfile.id === searchParam) ? (
          <AddPostElement />
        ) : null} */}
        {posts.map((post, i) => {
          return <PostElement post={post} key={`${post._id}`} />;
        })}
        <div className={styles.final_container} ref={loader}>
          <div className={styles.final}>
            <LoadingBlock loading={loading} size="md">
              {loading ? null : (
                <div className={styles.loading_done}>
                  <AiOutlineCheck />
                </div>
              )}
            </LoadingBlock>
          </div>
        </div>
      </div>
    </>
  );
}
