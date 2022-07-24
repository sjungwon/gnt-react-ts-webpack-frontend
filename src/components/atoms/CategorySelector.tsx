import { Dropdown, DropdownButton } from "react-bootstrap";
import { CategoryType } from "../../redux/modules/category";
import styles from "./scss/Selector.module.scss";

//Props 타입
interface PropsType {
  //카테고리 배열
  //redux에서 가져오지 않음
  //사용하려는 쪽에서 배열을 변경해서 전달하는 경우가 있을 수 있음
  categories: CategoryType[];
  //선택
  onSelect: (eventKey: string | null) => void;
  //사이즈
  size: "sm" | "lg";
}

export default function CategorySelector({
  categories,
  onSelect,
  size,
}: PropsType) {
  return (
    <DropdownButton
      id="dropdown-gameList"
      title="게임"
      onSelect={onSelect}
      size={size}
      disabled={!categories.length}
    >
      {categories.map((category, index) => {
        return (
          <Dropdown.Item
            key={category.title}
            eventKey={index}
            className={styles.item}
          >
            {category.title}
          </Dropdown.Item>
        );
      })}
    </DropdownButton>
  );
}
