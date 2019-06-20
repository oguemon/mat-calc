class Mynum {
  private n: number = 0; // 分子
  private d: number = 0; // 分母

  constructor (a: string);
  constructor (a: number);
  constructor (a: number, b:number);
  constructor (a: any, b?:number) {
    if (typeof a == 'string') {
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

  public toLatex (): string {
    let str: string;

    if (this.d == 1)
    {
      str = String(this.n);
    }
    else
    {
      const sign = (this.n * this.d < 0)? '-' : '';
      str = sign + '\\frac{' + Math.abs(this.n) + '}{' + Math.abs(this.d) + '}';
    }

    return str;
  }
}
