/// <reference path="mat-calc.ts" />
let N: number = 3;

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

    // 結果をスライド非表示にする
    $('#result').slideUp();

    return;
});

/*
 *  計算ボタンを押したら
 */
$('#calc').on('click', function ()
{
    const start_ms: number = new Date().getTime();

    // 行列の初期化
    const line: number = N;
    const row: number = N;
    let rank: number = 0;
    let swap_count: number = 0;
    let step_count: number = 0;
    let A: Mat.Mat = {
        lines : line,
        rows: row,
        val: new Array()
    };
    let B: Mat.Mat = {
        lines : line,
        rows: row,
        val: new Array()
    };
    let inputA: Mat.Mat;
    let stepsA: {
        result : Mat.Mat,
        line1 : number,
        line2 : number,
        multipulator : Mynum,
        is_swap : boolean
    }[] = new Array();

    // 行列の入力（A）
    let input_error: boolean = false;
    for (let i = 0; i < A.lines; i++)
    {
        A.val[i] = new Array();
        for (let j = 0; j < A.rows; j++)
        {
            const ele: JQuery<HTMLElement> = $('#a-' + String(i * A.rows + j));
            const tmp_value: string = String(ele.val());
            if (isNumber(tmp_value))
            {
                A.val[i][j] = new Mynum(tmp_value);
                ele.css('border', '1px solid #dddddd');
            }
            else
            {
                ele.css('border', '2px solid #EB040D');
                input_error = true;
            }
        }
    }

    // 入力した行列を格納
    inputA = $.extend(true, {}, A);
    stepsA[step_count] = {
        result: $.extend(true, {}, A),
        line1: -1,
        line2: -1,
        multipulator: new Mynum('0'),
        is_swap: false
    };

    $('#error_msg_box').html('');
    if (input_error)
    {
        $('#error_msg_box').html('<div id="error_msg">正しく入力して下さい！</div>');
        return;
    }

    // 行列B（単位行列）の初期化
    for (let i = 0; i < B.lines; i++)
    {
        B.val[i] = new Array();
        for (let j = 0; j < B.rows; j++)
        {
            B.val[i][j] = (i == j)? new Mynum(1) : new Mynum(0);
        }
    }

    // 階段行列化
    // 列を操作
    for (let j = 0; j < row; j++) {
        // '段差'の成分がゼロならそれ以降の非零成分と交換
        if (A.val[rank][j].isZero()) {
            let found_nonzero: boolean = false;
            for (let i = rank + 1; i < line; i++) {
                // 非零成分と出会ったら
                if (A.val[i][j].isZero() == false) {
                    swap_count++;
                    step_count++;
                    Mat.swap2Lines(A, rank, i);
                    Mat.swap2Lines(B, rank, i);
                    stepsA[step_count] = {
                        result: $.extend(true, {}, A),
                        line1: i,
                        line2: rank,
                        multipulator: new Mynum('0'),
                        is_swap: true
                    };
                    found_nonzero = true;
                    break;
                }
            }

            // ヒットしないまま末尾へ到達した（つまり全部ゼロ）
            if (found_nonzero == false) {
                continue;
            }
        }

        // 行のゼロ化
        for (let i = rank + 1; i < line; i++) {
            // 成分がゼロ以外なら加算して成分をゼロ化
            if (A.val[i][j].isZero() == false) {
                step_count++;
                const mlt: Mynum = Mynum.mul(new Mynum(-1), Mynum.div(A.val[i][j], A.val[rank][j]));
                Mat.addMulLineByScalar(A, rank, mlt, i);
                Mat.addMulLineByScalar(B, rank, mlt, i);
                stepsA[step_count] = {
                    result: $.extend(true, {}, A),
                    line1: i,
                    line2: rank,
                    multipulator: $.extend(true, {}, mlt),
                    is_swap: false
                };
            }
        }

        // 階数を上げる
        rank++;
    }

    console.log('step: ' + step_count);

    // 対角成分の積に基づいて行列式を求める
    let detA: Mynum = (swap_count % 2 == 0) ? new Mynum(1) : new Mynum(-1);
    for (let i = 0; i < N; i++) {
        detA = Mynum.mul(detA, A.val[i][i]);
    }

    // 結果の表示
    const ele_matrix_inputA: JQuery<HTMLElement> = $('#matrix_A');
    ele_matrix_inputA.html(Mat.toMathJax(inputA, 'A'));
    MathJax.Hub.Typeset(ele_matrix_inputA[0], function(){});

    $('#matrix_triA_total_step').html(String(step_count));
    showMatrixTriA(step_count);

    let triA_showing_index: number = step_count;
    $('#triA-start').on('click', function(){
        triA_showing_index = 0;
        showMatrixTriA(triA_showing_index);
    });
    $('#triA-prev').on('click', function(){
        triA_showing_index = Math.max(triA_showing_index - 1, 0);
        showMatrixTriA(triA_showing_index);
    });
    $('#triA-next').on('click', function(){
        triA_showing_index = Math.min(triA_showing_index + 1, step_count);
        showMatrixTriA(triA_showing_index);
    });
    $('#triA-end').on('click', function(){
        triA_showing_index = step_count;
        showMatrixTriA(triA_showing_index);
    });

    // 三角化の結果を表示
    function showMatrixTriA(triA_showing_index: number) {
        const ele_matrix_triA_result: JQuery<HTMLElement> = $('#matrix_triA_result');
        const ele_matrix_triA_operation_content: JQuery<HTMLElement> = $('#matrix_triA_operation_content');
        const ele_matrix_triA_operation_step: JQuery<HTMLElement> = $('#matrix_triA_operation_step');

        ele_matrix_triA_result.html(Mat.toMathJax(stepsA[triA_showing_index].result, 'A'));
        MathJax.Hub.Typeset(ele_matrix_triA_result[0], function(){});
        ele_matrix_triA_operation_step.html('Step ' + triA_showing_index);
        ele_matrix_triA_operation_step.removeClass('complete');
        $('#matrix_triA .status').removeClass('transparent');
        $('#matrix_triA_current_step').html(String(triA_showing_index));
        $('#triA-next').prop('disabled', false);
        $('#triA-end').prop('disabled', false);
        $('#triA-start').prop('disabled', false);
        $('#triA-prev').prop('disabled', false);

        // 初期状態に対しては操作内容の表示がないため自然数のみ対象
        if (triA_showing_index > 0) {
            const line1: number = stepsA[triA_showing_index].line1 + 1;
            const line2: number = stepsA[triA_showing_index].line2 + 1;
            const multipulator_latex: string = Mynum.toLatex(stepsA[triA_showing_index].multipulator);
            if (stepsA[triA_showing_index].is_swap == true) {
                ele_matrix_triA_operation_content.html(line1 + '行目と' + line2 + '行目を入れ替え');
            } else {
                ele_matrix_triA_operation_content.html(line1 + '行目に' + line2 + '行目の\\(' + multipulator_latex + '\\)倍を加算');
                MathJax.Hub.Typeset(ele_matrix_triA_operation_content[0], function(){});
            }
        } else {
            ele_matrix_triA_operation_content.html('初期状態（入力された行列）');
            $('#triA-start').prop('disabled', true);
            $('#triA-prev').prop('disabled', true);

        }

        // 最終ステップなら
        if (triA_showing_index == step_count) {
            $('#matrix_triA .status').addClass('transparent')
            ele_matrix_triA_operation_content.append('→<strong>完成</strong>');
            ele_matrix_triA_operation_step.addClass('complete');
            $('#triA-next').prop('disabled', true);
            $('#triA-end').prop('disabled', true);
        }

        console.log(triA_showing_index);
    }

    const ele_matrix_rankA: JQuery<HTMLElement> = $('#matrix_rankA');
    ele_matrix_rankA.html('$$rankA = ' + rank + '$$');
    MathJax.Hub.Typeset(ele_matrix_rankA[0], function(){});
    if (rank == A.lines) {
        $('#matrix_rankA_reversible').html('階数と行列の列数が等しいので逆行列があります。');
    } else {
        $('#matrix_rankA_reversible').html('階数と行列の列数が等しくないので逆行列がありません……');
    }


    const ele_matrix_detA: JQuery<HTMLElement> = $('#matrix_detA');
    ele_matrix_detA.html('$$|A|=' + Mynum.toLatex(detA) + '$$');
    MathJax.Hub.Typeset(ele_matrix_detA[0], function(){});
    if (detA.isZero()) {
        $('#matrix_detA_reversible').html('行列式が0なので逆行列がありません……');
    } else {
        $('#matrix_detA_reversible').html('行列式が0でないので逆行列があります。');
    }

    const ele_matrix_revA: JQuery<HTMLElement> = $('#matrix_revA');
    // 正方行列の次数と階数が同じなら逆行列を求める
    if (N == rank) {
        // 単位行列化
        // 列を操作
        for (let j = row - 1; j >= 0; j--) {
            // 行のゼロ化
            for (let i = j - 1; i >= 0; i--) {
                // 成分がゼロ以外なら加算して成分をゼロ化
                if (A.val[i][j].isZero() == false) {
                    const mlt: Mynum = Mynum.mul(new Mynum(-1), Mynum.div(A.val[i][j], A.val[j][j]));
                    Mat.addMulLineByScalar(A, j, mlt, i);
                    Mat.addMulLineByScalar(B, j, mlt, i);
                }
            }
            // 対角成分の値を1にする
            const mlt: Mynum = Mynum.div(new Mynum(1), A.val[j][j]);
            Mat.mulLineByScalar(A, j, mlt);
            Mat.mulLineByScalar(B, j, mlt);
        }

        // 結果の表示
        ele_matrix_revA.html(Mat.toMathJax(B, 'A^{-1}'));
        MathJax.Hub.Typeset(ele_matrix_revA[0], function(){});

        // 掛け算して単位行列になるかチェック
        /*
        const ele_matrix_checkE: JQuery<HTMLElement> = $('#matrix_checkE');
        ele_matrix_checkE.html('<h3>掛けた結果</h3>');
        if (Mat.mul(inputA, B) != null) {
            ele_matrix_checkE.append(Mat.toMathJax(Mat.mul(inputA, B), 'AA^{-1}'));
            MathJax.Hub.Typeset(ele_matrix_checkE[0], function(){});
        }
        */
    } else {
        // 逆行列がない旨の表示
        ele_matrix_revA.html('逆行列はありません（階数と正方行列の次数が異なるから）');
    }

    // 結果をスライド表示する
    $('#result').slideDown();

    // 移動先を数値で取得(ゆとり分だけ引く)
    const headline_result_offset: JQuery.Coordinates | undefined = $('#panel-header').offset();
    const position: number = (headline_result_offset != undefined)? headline_result_offset.top - 10 : 0;
    // スムーススクロール
    $('body,html').animate({scrollTop:position}, 400, 'swing');

    console.log('処理時間：' + String(new Date().getTime() - start_ms) + ' ms');
    return;
});

/*
 *  数字かどうかのチェック
 */
function isNumber(num_value: string) : boolean
{
    // チェック条件パターン（小数・分数可能）
    const pattern: RegExp = /^[-]?([1-9]\d*|0)([\/\.]0*[1-9]\d*)?$/;

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
 *  平方数かどうかを確認
 */
function is_square(n: number): boolean
{
    const sqrt: number = Math.floor(Math.pow(n, 0.5));
    return (sqrt * sqrt == n);
}
