//객체 필드 타입
interface FieldType {
  [key: string]: any;
}

//Form 데이터 타입 관리
//form 데이터를 타입 형태로 관리하기 위해 작성
//제네릭에 맞는 데이터를 생성자에 전달해야함
//타입에 맞는 데이터를 form 형태로 저장해둠
export class TypedForm<T extends FieldType> {
  private formData: FormData;

  constructor(data: T) {
    //formData 생성
    this.formData = new FormData();

    //data로 들어온 객체 순회
    for (const key in data) {
      //프로퍼티가 배열인 경우
      if (Array.isArray(data[key]) && data[key].length) {
        if (data[key][0] instanceof File) {
          //파일인 경우
          data[key].forEach((elem: File) => {
            this.formData.append(key, elem, elem.name);
          });
        } else if (data[key][0] instanceof Object) {
          //객체인 경우
          data[key].forEach((elem: any) => {
            this.formData.append(key, JSON.stringify(elem));
          });
        } else {
          //나머지 그냥 값인 경우
          data[key].forEach((elem: any) => {
            this.formData.append(key, elem);
          });
        }
      } else {
        this.formData.append(key, data[key]);
      }
    }
  }

  public get data(): FormData {
    return this.formData;
  }
}
