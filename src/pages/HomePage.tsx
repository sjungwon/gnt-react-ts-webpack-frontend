import { useEffect } from "react";
import { useDispatch } from "react-redux";
import CreatePostElement from "../components/molecules/CreatePostElement";
import InfoCard from "../components/molecules/InfoCard";
import PostList from "../components/organisms/PostList";
import { setCurrentCategoryByTitle } from "../redux/modules/category";
import { AppDispatch } from "../redux/store";

export default function HomePage() {
  // const { scrollLock, scrollRelease } = useScrollLock();
  // const [showCategory, setShowCategory] = useState<boolean>(false);
  // const showCategoryHandler = useCallback(() => {
  //   setShowCategory((prev) => {
  //     if (prev) {
  //       scrollRelease();
  //     } else {
  //       scrollLock();
  //     }
  //     return !prev;
  //   });
  // }, [scrollLock, scrollRelease]);

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(setCurrentCategoryByTitle(""));
  }, [dispatch]);

  return (
    <>
      <InfoCard text={"전체 보기"} />
      <CreatePostElement categoryTitle="" />
      <PostList type="" />
    </>
  );
}
