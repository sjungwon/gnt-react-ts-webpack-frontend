import AddPostElement from "../components/molecules/AddPostElement";
import InfoCard from "../components/molecules/InfoCard";
import PostList from "../components/organisms/PostList";

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

  return (
    <>
      <InfoCard text={"전체 보기"} />
      <AddPostElement category="" />
      <PostList type="" />
    </>
  );
}
