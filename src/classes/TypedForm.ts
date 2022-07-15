interface FieldType {
  [key: string]: any;
}

export class TypedForm<T extends FieldType> {
  private formData: FormData;

  constructor(data: T) {
    this.formData = new FormData();

    for (const key in data) {
      if (Array.isArray(data[key]) && data[key].length) {
        if (data[key][0] instanceof File) {
          data[key].forEach((elem: File) => {
            this.formData.append(key, elem, elem.name);
          });
        } else if (data[key][0] instanceof Object) {
          data[key].forEach((elem: any) => {
            this.formData.append(key, JSON.stringify(elem));
          });
        } else {
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
