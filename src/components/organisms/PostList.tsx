import styles from "./scss/PostList.module.scss";
import PostElement from "../molecules/PostElement";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
// import LoadingBlock from "../atoms/LoadingBlock";
// import UserMenuFixedButton from "../molecules/UserMenuFixedButton";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  clearPosts,
  getPostByCategoryIdThunk,
  getPostByProfileIdThunk,
  getPostByUsernameThunk,
  getPostThunk,
} from "../../redux/modules/post";
import LoadingBlock from "../atoms/LoadingBlock";

interface PropsType {
  type: "" | "category" | "profile" | "username";
  params?: string;
}

//포스트 리스트
export default function PostList({ type, params }: PropsType) {
  const posts = useSelector((state: RootState) => state.post.posts);
  const status = useSelector((state: RootState) => state.post.status);

  const dispatch = useDispatch<AppDispatch>();

  const currentCategory = useSelector(
    (state: RootState) => state.category.currentCategory
  );

  const sendQuery = useCallback(async () => {
    if (status !== "done" && status !== "failed" && status !== "pending") {
      //포스트를 다 가져왔거나, 오류가 발생했거나, 가져오는 중이 아닌 경우
      //이전에 받아온 데이터가 있으면 date 설정
      const lastPostDate = posts.length
        ? posts[posts.length - 1].createdAt
        : "";
      switch (type) {
        case "category": {
          dispatch(
            getPostByCategoryIdThunk({
              categoryId: currentCategory._id,
              lastPostDate,
            })
          );
          break;
        }
        case "profile": {
          dispatch(
            getPostByProfileIdThunk({
              profileId: params || "",
              lastPostDate,
            })
          );
          break;
        }
        case "username": {
          dispatch(
            getPostByUsernameThunk({
              username: params || "",
              lastPostDate,
            })
          );
          break;
        }
        default: {
          dispatch(getPostThunk(lastPostDate));
          break;
        }
      }
    }
  }, [currentCategory._id, dispatch, params, posts, status, type]);

  //무한 스크롤 로드할 때 observe에 사용할 하단 컴포넌트
  const loader = useRef<HTMLDivElement>(null);

  //페이지로 처리하도록 설정
  //observer 설정하는 쪽에서
  //useEffect로 처리해서
  //변화하는 데이터로 handle 함수 정의 못함
  //추가로 sendQuery 함수가 의존 데이터에 의해
  //변경되는 경우 sendQuery 보내지 않도록
  //page와 prevPage 두개를 두고 비교해서
  //page 변경시에만 query 던지도록 설정
  const [prevPage, setPrevPage] = useState<number>(0);
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    if (page !== prevPage) {
      setPrevPage(page);
      sendQuery();
    }
  }, [page, sendQuery, prevPage]);

  //카테고리 변하면 포스트 초기화
  useEffect(() => {
    dispatch(clearPosts());
    setPage(1);
    setPrevPage(0);
  }, [type, dispatch, params]);

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

  const loading = status === "pending";

  //렌더
  //post가 있는 경우
  return (
    <section>
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
    </section>
  );
}
