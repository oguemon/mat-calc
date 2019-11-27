class Mynum {
  private n: number = 0; // 分子
  private d: number = 0; // 分母

  constructor (a: string);
  constructor (a: number);
  constructor (a: number, b:number);
  constructor (a: any, b?:number) {
    if (typeof a == 'string') {
      // 分数のスラッシュがある
      if (a.match(/\//)) {
        let splitted_num: string[] = a.split('/');
        this.n = Number(splitted_num[0]);
        this.d = Number(splitted_num[1]);
        this.reduction();
        return;
      } else
      // 小数のピリオドがある
      if (a.match(/\./)) {
        let splitted_num: string[] = a.split('.');
        let decimal_length: number = splitted_num[1].length
        let integer_part: number = Math.abs(Number(splitted_num[0])); //絶対値
        let decimal_part: number = Number(splitted_num[1]);

        this.n = integer_part * Math.pow(10, decimal_length) + decimal_part;
        this.d = Math.pow(10, decimal_length);

        // マイナス記号があったなら
        if (splitted_num[0].slice(0, 1) == '-') {
          this.n *= -1;
        }

        this.reduction();
        return;
      } else {
        this.n = Number(a);
        this.d = 1;
      }
    } else if (typeof a == 'number' && typeof b == 'undefined') {
      this.n = a;
      this.d = 1;
    } else if (typeof a == 'number' && typeof b == 'number') {
      this.n = a;
      this.d = b;
    } else {
      // エラー
    }
  }

  static add (a: Mynum, b: Mynum): Mynum {
    return new Mynum(
      a.n * b.d + b.n * a.d,
      a.d * b.d
    ).reduction ();
  }

  static sub (a: Mynum, b: Mynum): Mynum {
    return new Mynum(
      a.n * b.d - b.n * a.d,
      a.d * b.d
    ).reduction ();
  }

  static mul (a: Mynum, b: Mynum): Mynum {
    return new Mynum(
      a.n * b.n,
      a.d * b.d
    ).reduction ();
  }

  static div (a: Mynum, b: Mynum): Mynum {
    return new Mynum(
      a.n * b.d,
      a.d * b.n
    ).reduction ();
  }

  public reduction (): Mynum {
    // 分母を正にする
    if (this.d < 0)
    {
      this.n *= -1;
      this.d *= -1;
    }

    // 最大公約数を求める
    var common_div = Math.abs(this.n);
    var v = Math.abs(this.d);
    var r;
    while (v != 0) {
        r = common_div % v;
        common_div = v;
        v = r;
    }

    this.n /= common_div;
    this.d /= common_div;

    return this;
  }

  public clone (): Mynum {
    return new Mynum(this.n, this.d);
  }

  public eq (a: Mynum): Boolean {
    return (this.n == a.n && this.d == a.d);
  }

  public isZero (): Boolean {
    return (this.n == 0);
  }

  static toLatex (a: Mynum): string {
    let str: string;

    if (a.d == 1)
    {
      str = String(a.n);
    }
    else
    {
      const sign = (a.n * a.d < 0)? '-' : '';
      str = sign + '\\frac{' + Math.abs(a.n) + '}{' + Math.abs(a.d) + '}';
    }

    return str;
  }
}
