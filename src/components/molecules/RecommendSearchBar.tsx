import { useCallback, useState } from "react";
import { getRegExp } from "korean-regexp";
import styles from "./scss/RecommendSearchBar.module.scss";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import DefaultTextInput from "../atoms/DefaultTextInput";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { isIncludePathSpecial } from "../../functions/TextValidFunc";
import { CategoryType } from "../../redux/modules/category";

interface PropsType {
  showInputHandlerForMobile: () => void;
}

export default function GameSearchRecommend({
  showInputHandlerForMobile,
}: PropsType) {
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );

  const [text, setText] = useState<string>("");

  const [selectedMenu, setSelectedMenu] = useState<string>("게임");
  const menuSelect = useCallback((eventKey: string | null) => {
    if (eventKey) {
      setSelectedMenu(eventKey);
      setText("");
    }
  }, []);

  const [findedCategories, setFindedCategories] = useState<CategoryType[]>([]);
  const [prevent, setPrevent] = useState<boolean>(false);
  const onChangeHandler = useCallback(
    (event: any) => {
      if (prevent) {
        setPrevent(false);
        return;
      }
      const inputEl: HTMLInputElement = event.target;
      setText(inputEl.value);
      if (inputEl.value) {
        const textReg = getRegExp(inputEl.value);
        const find = categories.filter(
          (category) => textReg && category.title.search(textReg) !== -1
        );
        setFindedCategories(find);
      } else {
        setFindedCategories([]);
      }
    },
    [categories, prevent]
  );

  const navigate = useNavigate();
  const searchSubmit = useCallback(
    (optionalParam?: string) => {
      return () => {
        const searchParam = optionalParam ? optionalParam : text;
        if (!searchParam) {
          return;
        }
        if (isIncludePathSpecial(searchParam)) {
          window.alert(
            `! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) 는 포함할 수 없습니다.`
          );
          return;
        }
        const category = selectedMenu === "게임" ? "games" : "usernames";
        showInputHandlerForMobile();
        navigate(`/${category}/${searchParam}`);
        setFindedCategories([]);
      };
    },
    [navigate, selectedMenu, showInputHandlerForMobile, text]
  );

  const [isComposing, setIsComposing] = useState<boolean>(false);

  const [index, setIndex] = useState<number>(-1);
  const keyDownEventHandler = useCallback(
    (event: any) => {
      if (isComposing) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        const newIndex = (index + 1) % findedCategories.length;
        setIndex(newIndex);
        setText(findedCategories[newIndex].title);
        setPrevent(true);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const newIndex =
          (index - 1 + findedCategories.length) % findedCategories.length;
        setIndex(newIndex);
        setText(findedCategories[newIndex].title);
        setPrevent(true);
        return;
      }
      if (event.key === "Enter") {
        searchSubmit()();
      }
      setIndex(-1);
      setPrevent(false);
    },
    [findedCategories, index, isComposing, searchSubmit]
  );

  const click_Finded = useCallback(
    (event: any) => {
      const target: HTMLDivElement = event.target;
      const text = target.textContent;
      if (text) {
        setText(text);
        setPrevent(true);
        searchSubmit(text)();
      }
    },
    [searchSubmit]
  );

  return (
    <div className={styles.container}>
      <DropdownButton
        id="dropdown-search-menu"
        title={selectedMenu}
        size="sm"
        onSelect={menuSelect}
        variant="secondary"
      >
        <Dropdown.Item eventKey="게임">게임</Dropdown.Item>
        <Dropdown.Item eventKey="이름">사용자 이름</Dropdown.Item>
      </DropdownButton>
      <div className={styles.input_container}>
        <DefaultTextInput
          placeholder={selectedMenu}
          onChange={onChangeHandler}
          value={text}
          onKeyDown={keyDownEventHandler}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          className={styles.search_input}
        />
        <div
          className={`${styles.search_recommand_container} ${
            findedCategories.length ? "" : styles.hide
          }`}
        >
          {selectedMenu === "게임"
            ? findedCategories.map((category, i) => {
                if (i === index) {
                  return (
                    <div
                      className={styles.finded_game_border}
                      onClick={click_Finded}
                      key={category.title}
                    >
                      {category.title}
                    </div>
                  );
                }
                return (
                  <div onClick={click_Finded} key={category.title}>
                    {category.title}
                  </div>
                );
              })
            : null}
        </div>
      </div>

      <Button
        size="sm"
        variant="secondary"
        className={styles.navbar_search_btn}
        onClick={searchSubmit()}
      >
        검색
      </Button>
    </div>
  );
}
