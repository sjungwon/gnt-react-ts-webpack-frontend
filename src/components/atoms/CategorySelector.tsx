import { Dropdown, DropdownButton } from "react-bootstrap";
import { CategoryType } from "../../redux/modules/category";
import styles from "./scss/Selector.module.scss";

interface PropsType {
  categories: CategoryType[];
  onSelect: (eventKey: string | null) => void;
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
