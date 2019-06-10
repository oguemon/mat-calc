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

  public add (a: Mynum): Mynum {
    return new Mynum(
      this.n * a.d + a.n * this.d,
      this.d * a.d
    );
  }

  public sub (a: Mynum): Mynum {
    return new Mynum(
      this.n * a.d - a.n * this.d,
      this.d * a.d
    );
  }

  public mul (a: Mynum): Mynum {
    return new Mynum(
      this.n * a.n,
      this.d * a.d
    );
  }

  public div (a: Mynum): Mynum {
    return new Mynum(
      this.n * a.d,
      this.d * a.n
    );
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

    this.n = this.n / common_div;
    this.d = this.d / common_div;

    return this;
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
