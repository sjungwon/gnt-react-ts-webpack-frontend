export function isLongerThanNumber(text: string, length: number): boolean {
  if (text.length < length) {
    return false;
  }

  return true;
}

export function isShorterThanNumber(text: string, length: number): boolean {
  if (text.length > length) {
    return false;
  }

  return true;
}

export function isIncludeAlphabet(text: string): boolean {
  return new RegExp(/\D/g).test(text);
}

export function isIncludeNumber(text: string): boolean {
  return new RegExp(/\d/g).test(text);
}

export function isEmailType(text: string): boolean {
  return new RegExp(
    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
  ).test(text);
}

export function isIncludeSpecial(text: string): boolean {
  return new RegExp(/[{}[\]/?.,;:|)*~`!^\-_+<>@#₩$%&\\=('"]/g).test(text);
}

export function isIncludePathSpecial(text: string): boolean {
  return new RegExp(/[!*`';:@&=+$,/?\\#[\]()]/g).test(text);
}

export function removeSpecial(text: string): string {
  const reg = /[{}[\]/?.,;:|)*~`!^\-_+<>@#₩$%&\\=('"]/g;
  return text.replace(reg, "");
}
