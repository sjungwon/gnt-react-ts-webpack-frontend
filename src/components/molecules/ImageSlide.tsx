import { Carousel } from "react-bootstrap";
import styles from "./scss/ImageSlide.module.scss";
import { FC, MouseEventHandler, useCallback, useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { CgClose } from "react-icons/cg";
import useScrollLock from "../../hooks/useScrollLock";

//이미지 타입 -> S3에 저장된 이미지 Key, URL
export interface ImageType {
  URL: string;
  Key: string;
}

interface PropsType {
  //이미지 배열
  images: ImageType[];
  //slide 인덱스 제어 필요한 경우
  index?: number;
  //인덱스 제어하는 경우 인덱스 설정
  setIndex?: (index: number) => void;
  //이미지 클릭시 확장할 지 지정
  expandable?: true;
  //이미지 제어 출력 여부
  noIndicator?: true;
}

export default function ImageSlide({
  images,
  index,
  setIndex,
  expandable,
  noIndicator,
}: PropsType) {
  //슬라이드에서 현재 이미지 index 설정
  const handleSelect = useCallback(
    (selectedIndex: number) => {
      if (setIndex) {
        setIndex(selectedIndex);
      }
    },
    [setIndex]
  );

  //index가 변했을 때 = 이미지가 제거되거나 추가될 때
  //index가 0이하로 내려가면 오류 방지를 위해 0으로 설정
  useEffect(() => {
    if (index && index < 1 && setIndex) {
      setIndex(0);
    }
  }, [setIndex, images, index]);

  //이미지 클릭시 확장할 이미지 URL 데이터
  const [expandURL, setExpandURL] = useState<string>("");

  //이미지 확대 시 스크롤 락, 닫으면 해제
  const { scrollLock, scrollRelease } = useScrollLock();

  //이미지 클릭시 URL 지정 + 스크롤 락
  const click: MouseEventHandler<HTMLImageElement> = useCallback(
    (event) => {
      if (expandable) {
        const imgEl = event.target as HTMLInputElement;
        const imgSrc = imgEl.src;
        setExpandURL(imgSrc);
        scrollLock();
        // setExpandURL(imgSrc);
      }
    },
    [expandable, scrollLock]
  );

  //이미지 URL 해제 + 스크롤 락 해제
  const close = useCallback(() => {
    setExpandURL("");
    scrollRelease();
  }, [scrollRelease]);

  return (
    <>
      <Carousel
        interval={null}
        variant="dark"
        className={styles.slide}
        activeIndex={index}
        onSelect={handleSelect}
        controls={images.length > 1}
        indicators={!noIndicator}
      >
        {images?.map((img: ImageType, i: number) => {
          return (
            <Carousel.Item key={`${img.Key}${i}`}>
              <LazyLoadImage
                className={styles.slide_item}
                src={img.URL}
                onClick={click}
              />
            </Carousel.Item>
          );
        })}
      </Carousel>
      <ExpandImage imageURL={expandURL} close={close} />
    </>
  );
}

interface ExpandImagePropsType {
  imageURL: string;
  close: () => void;
}

//이미지 확장
const ExpandImage: FC<ExpandImagePropsType> = ({ imageURL, close }) => {
  //이미지 확장 안한 경우
  if (!imageURL) {
    return null;
  }

  return (
    <div className={styles.expand_container}>
      <div className={styles.expand_content}>
        <button onClick={close} className={styles.expand_close}>
          <CgClose />
        </button>
        <img
          src={imageURL}
          alt="expanded"
          className={styles.expand_img}
          onClick={close}
        />
      </div>
    </div>
  );
};
