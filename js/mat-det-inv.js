var $ = require('jquery');

var N = 3;
var digit = 2;

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
    digit = $(this).val();
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
    var agree = window.confirm("行列の中身を全てリセットします。\nよろしいでしょうか？");
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
    var start_ms = new Date().getTime();
    var A = [];
    var ele; // id要素を格納

    // 行列の入力
    var input_error = false;
    for (var i = 0; i < N * N; i++)
    {
        ele = $('#a-' + String(i));
        var tmp_value = ele.val();
        if (isNumber(tmp_value))
        {
            A[i] = tmp_value;
            ele.css('border', '1px solid #dddddd');
        }
        else
        {
            ele.css('border', '2px solid #EB040D');
            input_error = true;
        }
    }
    ele = $('#error_msg_box');
    ele.html('');
    if (input_error)
    {
        ele.html('<div id="error_msg">正しく入力して下さい！</div>');
        return;
    }

    // 入力した行列のアップ
    ele = $('#matrix_A');
    ele.html('<h3>入力した行列</h3>' + matrix2MathJax(A, 'A'));
    MathJax.Hub.Typeset(ele[0]);

    // LU分解と行列式を求める
    var LU = makeLU(A);
    var det_A = makeDeterminant(LU);
    // 表示する小数以下の桁数調整
    var digit_adjuster = Math.pow(10, digit);
    // 行列式のアップ
    ele = $('#matrix_detA');
    ele.html('<h3>行列式</h3>' + '$$|A|=' + (Math.round(det_A * digit_adjuster) / digit_adjuster) + '$$');
    MathJax.Hub.Typeset(ele[0]);

    // 逆行列を求める
    var rev_A = makeInverceA(LU);
    // 求めた逆行列のアップ
    ele = $('#matrix_revA');
    ele.html('<h3>逆行列</h3>' + ((det_A == 0)? '<em>逆行列はありません！</em>' : matrix2MathJax(rev_A, 'A^{-1}')));
    MathJax.Hub.Typeset(ele[0]);

    // 移動先を数値で取得(ゆとり分だけ引く)
    var position = $('#headline_result').offset().top - 10;
    // スムーススクロール
    $('body,html').animate({scrollTop:position}, 400, 'swing');

    console.log('処理時間：' + (new Date().getTime() - start_ms) + ' ms');
    return;
});

/*
 *  数字かどうかのチェック
 */
function isNumber(num_value){
    // チェック条件パターン
    var pattern = /^[-]?([1-9]\d*|0)(\.\d+)?$/;
    // 数値チェック
    return pattern.test(num_value);
}

/*
 *  フォームの描画
 */
function updateInputForm ()
{
    var mat_input = $('#matrix_input');
    var drill  = $('#drill').prop('checked');
    var string = '';
    for (var i = 0; i < N * N; i++)
    {
        //ドリルモードかどうかで数字をランダムにするか決める
        var input_val = (drill)? Math.floor(Math.random() * 10) : 0;
        string += '<input type="text" id="a-' + i + '" name="matrix[]" value="' + input_val + '">';
        if ((i + 1) % N == 0) string +='<br>';
    }

    mat_input.html(string);
}

/*
 *  行列をmathjaxで出力
 */
function matrix2MathJax(matrix, name)
{
    var string = '$$' + name + ' = \\left(\\begin{array}{ccc}';
    var digit_adjuster = Math.pow(10, digit);
    for (var i = 0; i < matrix.length; i++)
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
function makeDeterminant(LU)
{
    var L = LU.L;
    var U = LU.U;
    var det = 1;

    // Uの対角成分の積を求める
    for (var i = 0; i < N; i++)
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
function makeInverceA(LU)
{
    var L = LU.L;
    var U = LU.U;

    // 逆行列が定義されるかどうかをチェック
    if (makeDeterminant(LU) == 0)
    {
        return false;
    }

    /*
     *  逆行列の卵を単位行列の形に初期化
     *  (単位行列にすることで効率化する)
     */
    var B = (new Array(L.length)).fill(0);
    var C = (new Array(L.length)).fill(0);
    for (var i = 0; i < N; i++)
    {
        B[i + i * N] = 1;
        C[i + i * N] = 1;
    }

    /*
     *  LC = EとなるC(即ちLの逆行列)を求める
     */
    // 左上から、行→列の順に走査
    for (var j = 0; j < N; j++)
    {
        for (var i = j; i < N; i++)
        {
            // Uにとって対角行列より右側を既出の値で計算
            for (var k = j; k < i; k++)
            {
                C[j + i * N] -= L[k + i * N] * C[j + k * N];
            }
        }
    }

    /*
     *  UB = EとなるB(即ちUの逆行列)を求める
     */
    // 右下から、行→列の順に走査
    for (var j = N - 1; 0 <= j; j--)
    {
        for (var i = j; 0 <= i; i--)
        {
            // Uにとって対角行列より右側を既出の値で計算
            for (var k = j; i < k; k--)
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
    var rev_UL = multSquareMatrix (B, C);
    var rev_A = [];
    for (var j = 0; j < LU.pivot.length; j++)
    {
        for (var i = 0; i < N; i++)
        {
            rev_A[LU.pivot[j] + i * N] = rev_UL[j + i * N];
        }
    }
    return rev_A;
}

// LU分解を行う
function makeLU (A)
{
    // 行の入れ替え状況を格納する配列
    var pivot = [];
    for (var i = 0; i < N; i++) {
        pivot[i] = i;
    }
    // 入れ替え回数をカウントする配列
    var pivot_count = 0;

    // i行目について扱う
    for (var i = 0; i < N - 1; i++)
    {
        /*
         * 対角成分が0にならないように行を入れ替え
         */
        // i+1行目以下のi列目成分の中で絶対値が最大のものを求める
        var max = {'line': i, 'value': Math.abs(A[i + i * N])};
        for (var j = i + 1; j < N; j++)
        {
            if (Math.abs(A[i + j * N]) > max.value)
            {
                max.line  = j;
                max.value = Math.abs(A[i + j * N]);
            }
        }
        // 最大が0だったら、i行目以下が全部0ということ（おしり）
        if (max.value == 0)
        {
            continue;
        }
        // 最大が0じゃなくて対角成分以上の行があった→行を入れ替える
        if (i != max.line)
        {
            for (var j = 0; j < N; j++)
            {
                // 行の入れ替え
                var tmp = A[j + i * N];
                A[j + i * N] = A[j + max.line * N];
                A[j + max.line * N] = tmp;
            }
            // ピボット配列（入替記録）の更新
            tmp = pivot[i]
            pivot[i] = pivot[max.line];
            pivot[max.line] = tmp;
            // ピポットカウンターのインクリメント
            pivot_count++;
        }

        /*
         * i行目のの割り算(U作り)
         */
        for (var j = i + 1; j < N; j++)
        {
            A[i + j * N] /= A[i + i * N];
        }
        /*
         * j行目とi列目で行列を作って余因子から引く
         */
        for (var n = i + 1; n < N; n++)
        {
            for (var m = i + 1; m < N; m++)
            {
                A[m + n * N] -= A[m + i * N] * A[i + n * N];
            }
        }
    }

    // LとUを出す
    var L = A.slice();
    var U = A.slice();
    for (var i = 0; i < N; i++)
    {
        for (var j = 0; j < N; j++)
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

    return {'L': L, 'U': U, 'LxU': multSquareMatrix(L, U), 'pivot': pivot, 'pivot_count': pivot_count};
}

/*
 *  正方行列のかけ算をする（定義できないときはfalse）
 */
function multSquareMatrix (A, B)
{
    // AとBの要素数がマッチしない or 要素数が平方数じゃない
    if (A.length != B.length || !Number.isInteger(Math.pow(A.length, 0.5)))
    {
        return false;
    }

    var AB = [];
    var sum = 0;
    for (var i = 0; i < N; i++)
    {
        for (var j = 0; j < N; j++)
        {
            sum = 0;
            for (var k = 0; k < N; k++)
            {
                sum += A[k + i * N] * B[j + k * N];
            }
            AB[j + i * N] = sum;
        }
    }

    return AB;
}
