export class StringBuilder {
  private str: string;

  constructor(str = "") {
    this.str = str;
  }

  get length(): number {
    return this.str.length;
  }

  set length(value: number) {
    this.str = this.str.substring(0, value);
  }

  append(str: string): StringBuilder {
    this.str = this.str + str;
    return this;
  }

  remove(startIndex: number, length: number): StringBuilder {
    this.str =
      this.str.substr(0, startIndex) + this.str.substr(startIndex + length);
    return this;
  }

  insert(index: number, value: string): StringBuilder {
    this.str = this.str.substr(0, index) + value + this.str.substr(index);
    return this;
  }

  toString(): string {
    return this.str;
  }
}
