import { useCallback, useEffect, useRef, useState } from "react";
import { Card, Dropdown } from "react-bootstrap";
import styles from "./scss/PostElement.module.scss";
import {
  BsHandThumbsUp,
  BsHandThumbsUpFill,
  BsHandThumbsDown,
  BsHandThumbsDownFill,
} from "react-icons/bs";
import ImageSlide from "./ImageSlide";
import RemoveConfirmModal from "./RemoveConfirmModal";
import AddPostElement from "./AddPostElement";
import { NavLink } from "react-router-dom";
import DefaultButton from "../atoms/DefaultButton";
import ProfileBlock from "./ProfileBlock";
import {
  clearDeletePostStatus,
  clearModifyContentId,
  deletePostThunk,
  handleDislikeThunk,
  handleLikeThunk,
  PostType,
  setModifyContentId,
} from "../../redux/modules/post";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import CommentList from "./CommentList";
import CommentsButton from "../atoms/CommentsButton";
import { GoTriangleUp, GoTriangleDown } from "react-icons/go";

interface PropsType {
  post: PostType;
}

export default function PostElement({ post }: PropsType) {
  //댓글 보기 관련 함수
  const [showComment, setShowComment] = useState<boolean>(false);
  const [scrollHeight, setScrollHeight] = useState<number>(0);
  const username = useSelector((state: RootState) => state.auth.username);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const dispatch = useDispatch<AppDispatch>();

  const commentHandler = useCallback(() => {
    setShowComment((prev) => {
      if (!prev) {
        setScrollHeight(window.scrollY);
      } else {
        dispatch(clearModifyContentId());
        setTimeout(() => {
          window.scrollTo({ top: scrollHeight, behavior: "auto" });
        });
      }
      return !prev;
    });
  }, [dispatch, scrollHeight]);

  //좋아요, 싫어요 클릭 함수
  const postLike = useCallback(() => {
    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    dispatch(handleLikeThunk(post._id));
  }, [dispatch, post._id, username]);

  const postDislike = useCallback(() => {
    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    dispatch(handleDislikeThunk(post._id));
  }, [username, dispatch, post._id]);

  //포스트 제거, 제거 확인 모달 관련 데이터
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const handleRemoveModalClose = useCallback(() => {
    setShowRemoveModal(false);
  }, []);
  const handleRemoveModalOpen = useCallback(() => {
    dispatch(clearDeletePostStatus());
    setShowRemoveModal(true);
  }, [dispatch]);

  const deletePostStatus = useSelector(
    (state: RootState) => state.post.deletePostStatus
  );

  const sendRemovePost = useCallback(async () => {
    dispatch(deletePostThunk(post._id));
  }, [dispatch, post._id]);

  const profiles = useSelector((state: RootState) => state.profile.profiles);
  //포스트 관리 함수 -> 수정, 제거 선택
  const select = useCallback(
    (eventKey: any) => {
      if (eventKey === "1") {
        const filteredProfileArr = profiles.filter(
          (profile) => profile.category.title === post.category.title
        );
        if (!filteredProfileArr.length) {
          window.alert(
            "해당 포스트 카테고리에 포함되는 프로필이 없어 수정할 수 없습니다. 프로필을 추가해주세요."
          );
          return;
        }
        dispatch(setModifyContentId(post._id));
      }
      if (eventKey === "2") {
        handleRemoveModalOpen();
        return;
      }
    },
    [dispatch, handleRemoveModalOpen, post._id, post.category.title, profiles]
  );

  //텍스트 제한 관련 데이터
  //텍스트 이미지있으면 100자 제한, 없으면 200자 제한
  const [textMore, setTextMore] = useState<boolean>(false);
  const [showTextLength, setShowTextLength] = useState<number>(0);

  useEffect(() => {
    if (textMore) {
      setShowTextLength(post.text.length);
      return;
    }

    if (post.postImages.length) {
      const length = post.text.length < 100 ? post.text.length : 100;
      setShowTextLength(length);
      return;
    }

    if (post.text.length < 200) {
      setShowTextLength(post.text.length);
      return;
    }

    setShowTextLength(200);
  }, [post, textMore]);

  const showMore = useCallback(() => {
    setTextMore((prev) => !prev);
  }, []);

  const menuRef = useRef<HTMLButtonElement>(null);

  const menuClick = useCallback(() => {
    if (menuRef.current) {
      menuRef.current.click();
    }
  }, []);

  const modifyContentId = useSelector(
    (state: RootState) => state.post.modifyContentId
  );

  //렌더
  if (post._id === modifyContentId) {
    return <AddPostElement category={post.category.title} prevData={post} />;
  }

  return (
    <Card className={styles.card}>
      <Card.Header className={styles.card_header}>
        <Card.Title className={styles.card_header_game}>
          <NavLink
            to={`/games/${post.category.title}`}
            className={styles.nav_link}
          >
            {post.category.title}
          </NavLink>
        </Card.Title>
        <div className={styles.card_header_profile}>
          <ProfileBlock
            profile={post.profile}
            user={post.profile ? undefined : post.user}
            size="lg"
          >
            <Card.Subtitle className={styles.card_header_subtitle}>
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </Card.Subtitle>
          </ProfileBlock>
        </div>
        {username === post.user.username ? (
          <div className={styles.card_header_menu}>
            <DefaultButton onClick={menuClick} size="xs">
              ...
            </DefaultButton>
            <Dropdown onSelect={select} bsPrefix={styles.header_menu_container}>
              <Dropdown.Toggle
                id="dropdown-basic"
                className={styles.header_menu_container}
                ref={menuRef}
              ></Dropdown.Toggle>
              <Dropdown.Menu className={styles.header_menu_items}>
                <Dropdown.Item eventKey="1">수정</Dropdown.Item>
                <Dropdown.Item eventKey="2">삭제</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ) : null}
      </Card.Header>
      <Card.Body className={`${styles.card_body}`}>
        {post.postImages.length > 0 ? (
          <ImageSlide images={post.postImages} expandable />
        ) : null}
        <Card.Text className={styles.card_body_text}>
          {post.text.slice(0, showTextLength)}
        </Card.Text>
        {post.postImages.length && post.text.length > 100 ? (
          <p className={styles.card_body_text_more} onClick={showMore}>
            {textMore ? " 접기" : " 더보기"}
          </p>
        ) : null}
        {!post.postImages.length && post.text.length > 200 ? (
          <p className={styles.card_body_text_more} onClick={showMore}>
            {textMore ? " 접기" : " 더보기"}
          </p>
        ) : null}
        <div className={styles.card_body_buttons}>
          <DefaultButton onClick={postLike} size="lg">
            {post.likeUsers.includes(userId) ? (
              <BsHandThumbsUpFill className={styles.btn_icon} />
            ) : (
              <BsHandThumbsUp />
            )}
            <p className={styles.btn_text}>좋아요</p>
            <p className={styles.btn_badge}>{post.likes}</p>
          </DefaultButton>
          <CommentsButton
            onClick={commentHandler}
            size="lg"
            active={showComment}
          ></CommentsButton>
          <DefaultButton onClick={postDislike} size="lg">
            {post.dislikeUsers.includes(userId) ? (
              <BsHandThumbsDownFill className={styles.btn_icon} />
            ) : (
              <BsHandThumbsDown />
            )}
            <p className={styles.btn_text}>싫어요</p>
            <p className={styles.btn_badge}>{post.dislikes}</p>
          </DefaultButton>
        </div>
      </Card.Body>
      <Card.Footer
        // className={`${styles.card_footer} ${
        //   post.comments.length ? "" : styles.card_footer_no_border
        // }`}
        className={styles.card_footer}
      >
        <CommentList
          postId={post._id}
          showComment={showComment}
          comments={post.comments}
          commentsCount={post.commentsCount}
          category={post.category.title}
        />
        {/* {comments.length > 1 ||
          (comments.length && comments[0].subcomments.length) ? (
            <div className={styles.direct} onClick={openComments}>
              <div className={styles.direct_icon}>
                <GoTriangleDown />
              </div>
            </div>
          ) : (
            <div className={styles.blank}></div>
          )} */}
        {showComment ? (
          <div className={styles.direct} onClick={commentHandler}>
            <div className={styles.direct_icon}>
              <GoTriangleUp />
            </div>
          </div>
        ) : (
          <div className={styles.direct} onClick={commentHandler}>
            <div className={styles.direct_icon}>
              <GoTriangleDown />
            </div>
          </div>
        )}
      </Card.Footer>
      <RemoveConfirmModal
        close={handleRemoveModalClose}
        show={showRemoveModal}
        loading={deletePostStatus === "pending"}
        remove={sendRemovePost}
      />
    </Card>
  );
}
