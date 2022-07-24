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
  //모바일에서 검색바를 열고 닫을 때 사용할 함수
  showInputHandlerForMobile: () => void;
}

export default function GameSearchRecommend({
  showInputHandlerForMobile,
}: PropsType) {
  //카테고리 데이터
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );

  //검색 텍스트
  const [text, setText] = useState<string>("");

  //검색 메뉴
  const [selectedMenu, setSelectedMenu] = useState<string>("카테고리");
  const menuSelect = useCallback((eventKey: string | null) => {
    if (eventKey) {
      setSelectedMenu(eventKey);
      setText("");
    }
  }, []);

  //카테고리를 찾는 경우 - 데이터를 가지고 있음 - 추천 카테고리 하단에 표시
  const [findedCategories, setFindedCategories] = useState<CategoryType[]>([]);
  const [prevent, setPrevent] = useState<boolean>(false);
  //검색 텍스트 변경
  const onChangeHandler = useCallback(
    (event: any) => {
      if (prevent) {
        //추천어 선택의 경우 (화살표 이동)
        //prevent 처리 해놨음
        //해제 후 함수 종료
        setPrevent(false);
        return;
      }
      //입력이 들어온 경우
      const inputEl: HTMLInputElement = event.target;
      setText(inputEl.value);
      if (inputEl.value) {
        //텍스트가 있는 경우
        const textReg = getRegExp(inputEl.value);
        //추천 카테고리 검색
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
  //검색 제출 - 페이지 이동
  const searchSubmit = useCallback(
    (optionalParam?: string) => {
      return () => {
        //추천어를 선택한 경우 해당 추천어로 검색
        const searchParam = optionalParam ? optionalParam : text;
        if (!searchParam) {
          return;
        }
        if (isIncludePathSpecial(searchParam)) {
          //검색어에 path 특수 문자가 포함된 경우
          window.alert(
            `! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) 는 포함할 수 없습니다.`
          );
          return;
        }
        //선택한 검색 메뉴
        const category =
          selectedMenu === "카테고리" ? "categories" : "usernames";
        showInputHandlerForMobile();
        navigate(`/${category}/${searchParam}`);
        setFindedCategories([]);
      };
    },
    [navigate, selectedMenu, showInputHandlerForMobile, text]
  );

  //한글 검색 시 composing 확인
  const [isComposing, setIsComposing] = useState<boolean>(false);

  const [index, setIndex] = useState<number>(-1);

  //키 입력 handler
  const keyDownEventHandler = useCallback(
    (event: any) => {
      if (isComposing) {
        //한글 입력시 composing 중에 2번 event 발생하는거 방지
        return;
      }
      if (event.key === "ArrowDown") {
        //추천어 선택 - 하단으로 내려감
        event.preventDefault();
        //추천어를 원형으로 순회하기 위헤 나머지 처리
        const newIndex = (index + 1) % findedCategories.length;
        setIndex(newIndex);
        setText(findedCategories[newIndex].title);
        //키에 대한 change 이벤트 처리를 방지하기 위해 prevent true 처리
        setPrevent(true);
        return;
      }
      if (event.key === "ArrowUp") {
        //추천어 선택 - 상단으로 올라감
        event.preventDefault();
        //원형 순회를 위해 나머지 처리
        const newIndex =
          (index - 1 + findedCategories.length) % findedCategories.length;
        setIndex(newIndex);
        setText(findedCategories[newIndex].title);
        //키에 대한 change 이벤트 처리를 방지하기 위해 prevent true 처리
        setPrevent(true);
        return;
      }
      if (event.key === "Enter") {
        //제출 처리
        searchSubmit()();
      }
      setIndex(-1);
      setPrevent(false);
    },
    [findedCategories, index, isComposing, searchSubmit]
  );

  //검색어를 선택한 경우
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
        <Dropdown.Item eventKey="카테고리">카테고리</Dropdown.Item>
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
          {selectedMenu === "카테고리"
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
