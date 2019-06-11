let N: number = 3;
let digit: number = 2;

interface LU {
    L: number[],
    U: number[],
    LxU: number[],
    pivot: number[],
    pivot_count: number
}

$(window).on('load',function(){
    updateInputForm ();
});

/*
 *  入力時の注意事項のリンクが開かれたら
 */
$('#input_attention_btn').on('click', function ()
{
    if ($('#input_attention').css('display') != 'block')
    {
        $(this).html('▲入力時の注意事項を閉じる');
    }
    else
    {
        $(this).html('▼入力時の注意事項を開く');
    }
    $('#input_attention').slideToggle(300);
});

/*
 *  表示する小数以下の桁数を決めるセレクターを変更したら
 */
$('#show_digit').on('change', function ()
{
    // 桁数を設定
    digit = Number($(this).val());
});

/*
 *  計算ドリルモードを変更したら
 */
$('#drill').on('change', function ()
{
    updateInputForm();
});

/*
  *  次元を増やすボタンを押したら
  */
$('#dim_add').on('click', function ()
{
    N = Math.min(N+1, 10);
    updateInputForm ();
    return;
});

/*
 *  次元を減らすボタンを押したら
 */
$('#dim_dec').on('click', function ()
{
    N = Math.max(N-1, 2);
    updateInputForm ();
    return;
});

/*
 *  リセットボタンを押したら
 */
$('#reset').on('click', function ()
{
    const agree = window.confirm("行列の中身を全てリセットします。\nよろしいでしょうか？");
    if (agree)
    {
        updateInputForm ();
    }
    return;
});

/*
 *  計算ボタンを押したら
 */
$('#calc').on('click', function ()
{
    const start_ms: number = new Date().getTime();
    let A: number[] = [];

    // 行列の入力
    let input_error: boolean = false;
    for (let i = 0; i < N * N; i++)
    {
        const ele: JQuery<HTMLElement> = $('#a-' + String(i));
        const tmp_value: string = String(ele.val());
        if (isNumber(tmp_value))
        {
            A[i] = Number(tmp_value);
            ele.css('border', '1px solid #dddddd');
        }
        else
        {
            ele.css('border', '2px solid #EB040D');
            input_error = true;
        }
    }
    $('#error_msg_box').html('');
    if (input_error)
    {
        $('#error_msg_box').html('<div id="error_msg">正しく入力して下さい！</div>');
        return;
    }

    // 入力した行列のアップ
    const ele_matrix_A: JQuery<HTMLElement> = $('#matrix_A');
    ele_matrix_A.html('<h3>入力した行列</h3>' + matrix2MathJax(A, 'A'));
    MathJax.Hub.Typeset(ele_matrix_A[0], function(){});

    // LU分解と行列式を求める
    const LU: LU = makeLU(A);
    const det_A: number = makeDeterminant(LU);
    // 表示する小数以下の桁数調整
    const digit_adjuster: number = Math.pow(10, digit);
    // 行列式のアップ
    const ele_matrix_detA: JQuery<HTMLElement> = $('#matrix_detA');
    ele_matrix_detA.html('<h3>行列式</h3>' + '$$|A|=' + (Math.round(det_A * digit_adjuster) / digit_adjuster) + '$$');
    MathJax.Hub.Typeset(ele_matrix_detA[0], function(){});

    // 逆行列を求める
    const rev_A: number[] = makeInverceA(LU);
    // 求めた逆行列のアップ
    const ele_matrix_revA: JQuery<HTMLElement> = $('#matrix_revA');
    ele_matrix_revA.html('<h3>逆行列</h3>' + ((det_A == 0)? '<em>逆行列はありません！</em>' : matrix2MathJax(rev_A, 'A^{-1}')));
    MathJax.Hub.Typeset(ele_matrix_revA[0], function(){});

    // 移動先を数値で取得(ゆとり分だけ引く)
    const headline_result_offset: JQuery.Coordinates | undefined = $('#headline_result').offset();
    const position: number = (headline_result_offset != undefined)? headline_result_offset.top - 10 : 0;
    // スムーススクロール
    $('body,html').animate({scrollTop:position}, 400, 'swing');

    console.log('処理時間：' + (new Date().getTime() - start_ms) + ' ms');
    return;
});

/*
 *  数字かどうかのチェック
 */
function isNumber(num_value: string) : boolean
{
    // チェック条件パターン
    const pattern: RegExp = /^[-]?([1-9]\d*|0)(\.\d+)?$/;
    // 数値チェック
    return pattern.test(num_value);
}

/*
 *  フォームの描画
 */
function updateInputForm ()
{
    const drill: boolean  = $('#drill').prop('checked');
    let string: string = '';
    for (let i = 0; i < N * N; i++)
    {
        //ドリルモードかどうかで数字をランダムにするか決める
        const input_val: number = (drill)? Math.floor(Math.random() * 10) : 0;
        string += '<input type="text" id="a-' + i + '" name="matrix[]" value="' + input_val + '">';
        if ((i + 1) % N == 0) string +='<br>';
    }

    $('#matrix_input').html(string);
}

/*
 *  行列をmathjaxで出力
 */
function matrix2MathJax(matrix: number[], name: string) : string
{
    let string: string = '$$' + name + ' = \\left(\\begin{array}{ccc}';
    const digit_adjuster: number = Math.pow(10, digit);
    for (let i = 0; i < matrix.length; i++)
    {
        // 桁を丸める
        string += (Math.round(matrix[i] * digit_adjuster) / digit_adjuster);
        // 行列の隙間か改行か
        string += ((i + 1) % N == 0) ? '\\\\' : ' & ';
    }
    string += '\\end{array}\\right)$$';

    return string;
}

/*
 *  行列式を求める
 */
function makeDeterminant(LU: LU) : number
{
    let det: number = 1;

    // Uの対角成分の積を求める
    for (let i = 0; i < N; i++)
    {
        det *= LU.U[i + i * N];
    }
    // LU分解前における行の入れ替え回数が奇数ならマイナス
    if (LU.pivot_count % 2 == 1)
    {
        det *= -1;
    }

    return det;
}

/*
 *  掃き出し計算をして逆行列を求める
 *  (三角行列なので効率的)
 */
function makeInverceA(LU: LU) : number[]
{
    const L: number[] = LU.L;
    const U: number[] = LU.U;

    // 逆行列が定義されるかどうかをチェック
    if (makeDeterminant(LU) == 0)
    {
        return [];
    }

    /*
     *  逆行列の卵を単位行列の形に初期化
     *  (単位行列にすることで効率化する)
     */
    let B: number[] = new Array(L.length);
    let C: number[] = new Array(L.length);
    for (let i = 0; i < N; i++)
    {
        for (let j = 0; j < N; j++)
        {
            B[i + j * N] = (i == j)? 1 : 0;
            C[i + j * N] = (i == j)? 1 : 0;
        }
    }

    /*
     *  LC = EとなるC(即ちLの逆行列)を求める
     */
    // 左上から、行→列の順に走査
    for (let j = 0; j < N; j++)
    {
        for (let i = j; i < N; i++)
        {
            // Uにとって対角行列より右側を既出の値で計算
            for (let k = j; k < i; k++)
            {
                C[j + i * N] -= L[k + i * N] * C[j + k * N];
            }
        }
    }

    /*
     *  UB = EとなるB(即ちUの逆行列)を求める
     */
    // 右下から、行→列の順に走査
    for (let j = N - 1; 0 <= j; j--)
    {
        for (let i = j; 0 <= i; i--)
        {
            // Uにとって対角行列より右側を既出の値で計算
            for (let k = j; i < k; k--)
            {
                B[j + i * N] -= U[k + i * N] * B[j + k * N];
            }
            // 最後に対角成分で割る
            B[j + i * N] /= U[i + i * N];
        }
    }

    /*
     * A逆行列をU^(-1)L^(-1)から求める
     */
    const rev_UL: number[] = multSquareMatrix (B, C);
    let rev_A: number[] = [];
    for (let j = 0; j < LU.pivot.length; j++)
    {
        for (let i = 0; i < N; i++)
        {
            rev_A[LU.pivot[j] + i * N] = rev_UL[j + i * N];
        }
    }

    return rev_A;
}

// LU分解を行う
function makeLU (A: number[]) : LU
{
    // 行の入れ替え状況を格納する配列
    let pivot: number[] = [];
    for (let i = 0; i < N; i++) {
        pivot[i] = i;
    }
    // 入れ替え回数をカウントする配列
    let pivot_count: number = 0;

    // i行目について扱う
    for (let i = 0; i < N - 1; i++)
    {
        /*
         * 対角成分が0にならないように行を入れ替え
         */
        // i+1行目以下のi列目成分の中で絶対値が最大のものを求める
        let max_line: number = i;
        let max_value: number = Math.abs(A[i + i * N]);
        for (let j = i + 1; j < N; j++)
        {
            if (Math.abs(A[i + j * N]) > max_value)
            {
                max_line  = j;
                max_value = Math.abs(A[i + j * N]);
            }
        }
        // 最大が0だったら、i行目以下が全部0ということ（おしり）
        if (max_value == 0)
        {
            continue;
        }
        // 最大が0じゃなくて対角成分以上の行があった→行を入れ替える
        if (i != max_line)
        {
            for (let j = 0; j < N; j++)
            {
                // 行の入れ替え
                const tmp: number = A[j + i * N];
                A[j + i * N] = A[j + max_line * N];
                A[j + max_line * N] = tmp;
            }
            // ピボット配列（入替記録）の更新
            const tmp: number = pivot[i]
            pivot[i] = pivot[max_line];
            pivot[max_line] = tmp;
            // ピポットカウンターのインクリメント
            pivot_count++;
        }

        /*
         * i行目のの割り算(U作り)
         */
        for (let j = i + 1; j < N; j++)
        {
            A[i + j * N] /= A[i + i * N];
        }
        /*
         * j行目とi列目で行列を作って余因子から引く
         */
        for (let n = i + 1; n < N; n++)
        {
            for (let m = i + 1; m < N; m++)
            {
                A[m + n * N] -= A[m + i * N] * A[i + n * N];
            }
        }
    }

    // LとUを出す
    const L: number[] = A.slice();
    const U: number[] = A.slice();
    for (let i = 0; i < N; i++)
    {
        for (let j = 0; j < N; j++)
        {
            if (i < j)
            {
                L[j + i * N] = 0;
            }
            else if (i > j)
            {
                U[j + i * N] = 0;
            }
            else
            {
                L[j + i * N] = 1;
            }
        }
    }

    let ans: LU = {
        L: L,
        U: U,
        LxU: multSquareMatrix(L, U),
        pivot: pivot,
        pivot_count: pivot_count
    };

    return ans;
}



/*
 *  正方行列のかけ算をする（定義できないときはfalse）
 */
function multSquareMatrix (A: number[], B: number[]) : number[]
{
    // AとBの要素数がマッチしない or 正方行列でない
    if (A.length != B.length || !is_square(A.length))
    {
        return [];
    }

    let AB: number[] = [];
    let sum: number = 0;
    for (let i = 0; i < N; i++)
    {
        for (let j = 0; j < N; j++)
        {
            sum = 0;
            for (let k = 0; k < N; k++)
            {
                sum += A[k + i * N] * B[j + k * N];
            }
            AB[j + i * N] = sum;
        }
    }

    return AB;
}

/*
 *  平方数かどうかを確認
 */
function is_square(n: number): boolean
{
    const sqrt: number = Math.floor(Math.pow(n, 0.5));
    return (sqrt * sqrt == n);
}
