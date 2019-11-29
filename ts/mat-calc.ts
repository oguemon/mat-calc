namespace Mat {
  export interface Mat {
    lines: number,
    rows: number,
    val: Mynum[][]
  }

  /*
   *  行列の2つの行を入れ替える（行番号は1から）
   */
  export function swap2Lines (A: Mat, line1: number, line2: number) : Mat
  {

      for (let i = 0; i < A.rows; i++)
      {
          let tmp: Mynum = A.val[line1][i];//.clone();
          A.val[line1][i] = A.val[line2][i];//.clone();
          A.val[line2][i] = tmp;
      }

      return A;
  }

  /*
   *  行列のある行のスカラー倍をする（行番号は1から）
   */
  export function mulLineByScalar (A: Mat, muledline: number, s: Mynum) : Mat
  {
      for (let i = 0; i < A.rows; i++)
      {
          A.val[muledline][i] = Mynum.mul(A.val[muledline][i], s)
      }

      return A;
  }

  /*
   *  行列のある行のスカラー倍をある行に加える（行番号は1から）
   */
  export function addMulLineByScalar (A: Mat, muledline: number, s: Mynum, addedline: number) : Mat
  {
      for (let i = 0; i < A.rows; i++)
      {
          A.val[addedline][i] = Mynum.add(A.val[addedline][i], Mynum.mul(A.val[muledline][i], s));
      }

      return A;
  }

  /*
   *  行列のかけ算をする（定義できないときはnull）
   */
  export function mul (A: Mat, B: Mat) : Mat | null
  {
      // 掛け算が定義できない
      if (A.rows != B.lines)
      {
          return null;
      }

      let AB: Mat = {
        lines: A.lines,
        rows: B.rows,
        val: Array()
      };

      for (let i = 0; i < A.lines; i++)
      {
        AB.val[i] = Array();
        for (let j = 0; j < B.rows; j++)
        {
            let sum = new Mynum(0);
            for (let k = 0; k < A.rows; k++)
            {
            sum = Mynum.add(sum, Mynum.mul(A.val[i][k], B.val[k][j]));
            }
            AB.val[i][j] = sum;
        }
      }

      return AB;
  }
   /*
    *  行列をmathjaxで出力（新バージョン・値を丸めない）
    */
    export function toMathJax(matrix: Mat.Mat, name: string) : string
    {
        let string: string = '$$' + name + ' = \\left(\\begin{array}{ccc}';
        for (let i = 0; i < matrix.lines; i++)
        {
            for (let j = 0; j < matrix.rows; j++)
            {
                string += Mynum.toLatex(matrix.val[i][j]);
                if (j < matrix.rows - 1) {
                    string += '&';
                }
            }
            if (i < matrix.lines - 1) {
                string += '\\\\';
            }
        }
        string += '\\end{array}\\right)$$';

        return string;
    }
}
