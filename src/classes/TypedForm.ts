interface FieldType {
  [key: string]: any;
}

export class TypedForm<T extends FieldType> {
  private formData: FormData;

  constructor(data: T) {
    this.formData = new FormData();

    for (const key in data) {
      this.formData.append(key, data[key]);
    }
  }

  public get data(): FormData {
    return this.formData;
  }
}
