let currentUserNumber = null;  //当前登录用户的学号
let currenttableData = []; //当前表格2中已添加数据
let teacherCourse = []; //获取教师对应的课程
let courseStr = ""; //将课程转为字符串
var labelData = [];
var allCurrentChildNode = [];
var treeDfd = $.Deferred();

var tree = layui.tree, 
    layer = layui.layer, 
    form = layui.form, 
    table = layui.table,
    code = layui.code,
    soulTable = null;
//调用外部模块配置
layui.config({
    base: '../layui/table_ext/',   // 模块所在目录
    version: 'v1.4.4' // 插件版本号
}).extend({
    soulTable: 'soulTable'  // 模块别名
});

$(document).ready(function () {
    $.ajax({
        type: 'get',
        url: '../label/getLabelTrees',
        cache: false,
        success: function (res) {
            if (0 == res.code) {
                labelData = dataChangeField(res.body);
                treeDfd.resolve();
            } else if (12 == res.code) {
                alert(res.message);
                top.location.href = "../index.html";
            } else {
                layer.msg(res.message, { icon: 5 });
            }
        }
    });
});

$.ajax({
    type: "get",
    async: false,
    dataType: "json",
    url: "../login/getCurrentUser",
    success: function (data) {
        currentUserNumber = data.body.number; //获取当前登录用户的id，通过id查找当前用户所下属的课程
        let d = { "teacherNumber": currentUserNumber, "page": 1, "limit": 5 };
        $.ajax({
            type: "get",
            async: false,
            data: d,  //不需要JSON.stringfy(d)
            dataType: "json",
            url: "../course/getByTeacherNumber",
            success: function (data) {
                if (data.code === 0){
                    for (let i = 0; i < data.body.content.length; i++) {
                        teacherCourse.push(data.body.content[i].name + " (" + data.body.content[i].number + ")");
                        // alert(data.body.content[i].number);
                    }
                }else{
                    layer.alert(data.message);
                    return;
                }


            }
        });
    }
});
//树形下拉筛选框

treeDfd.done(function () {
    tree.render({
        elem: "#classtree"
        , oncheck: function (obj) {
            if (obj.checked) {
                chooseData(obj.data, "add");
                labelSearch();
            } else {
                chooseData(obj.data, "del");
                labelSearch();
            }
        }
        , showCheckbox: true
        , data: labelData
        , click: function (node) {
            var $select = $($(this)[0].elem).parents(".layui-form-select");
            $select.removeClass("layui-form-selected").find(".layui-select-title span").html(node.name).end().find("input:hidden[name='selectID']").val(node.id);
        }
    });
});

function chooseData(data, type) {
    if (data.children && data.children.length > 0) {
        for (var indexChild = 0; indexChild < data.children.length; indexChild++) {
            var child = data.children[indexChild];
            chooseData(child, type);
        }
    } else {
        if ("add" == type) {
            allCurrentChildNode.push(data);
        } else if ("del" == type) {
            var n = allCurrentChildNode.indexOf(data);
            allCurrentChildNode.splice(n, 1); //删除对应数据
            //如果是取消选中，就删除数据
        }
    }
}

function labelSearch() {
    let selectLabels = [];
    for (let node of allCurrentChildNode) {
        selectLabels.push(node.title);
    }
    table.reload("questionTable", {
        url: "../problem/selectByLabel",
        where: {
            labelName: JSON.stringify(selectLabels).replace(/\[|]|\"/g, ''),
            value: ''
        }
    })
}

$(".downpanel").on("click", ".layui-select-title", function (e) {
    $(".layui-form-select").not($(this).parents(".layui-form-select")).removeClass("layui-form-selected");
    $(this).parents(".downpanel").toggleClass("layui-form-selected");
    layui.stope(e);
}).on("click", "dl i", function (e) {
    layui.stope(e);
});
$(document).on("click", function (e) {
    $(".layui-form-select").removeClass("layui-form-selected");
});


//表格1

let tableData1 = [];
table.render({
    elem: '#demo1'
    , height: "auto"
    , method: "post"
    // ,count: totalElements
    , url: "../problem/select"
    , id: "questionTable"
    , page: {
        layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
        limits: [10, 15]
        // limit: 5limits: [10, 15],
        // limit: 5
    }
    , skin: 'nob' //行边框风格
    , cols: [[
        // {type: 'checkbox', fixed: 'left'},
        { field: 'id', title: '编号', width: 100, sort: true }
        , { field: 'title', title: '题目', width: 120, templet: '#switchTpl', unresize: true }
        , { field: 'description', title: '题目内容', minWidth: 200, templet: '#switchTpl', unresize: true }
        , { field: 'suggestedAnswer', title: '参考答案', width: 140, event: 'checkAnswer', minWidth: 120, templet: '#switchTpl', unresize: true }
        , { field: 'runtime', title: '运行时间', width: 100, templet: '#switchTpl', unresize: true }
        , { field: 'difficulty', title: '难度', width: 60, templet: '#switchTpl', unresize: true }
        , { field: 'ram', title: '运行内存', width: 100, templet: '#switchTpl', unresize: true }
        , { fixed: 'right', title: '操作', width: 120, align: 'center', toolbar: '#barDemo1' }
    ]]
    , parseData: function (res) {
        return {
            "code": res.code,
            "msg": res.message,
            "data": res.body.content,
            "count": res.body.totalElements
        }
    }
});
//监听行工具事件
table.on('tool(test1)', function (obj) { //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
    let data = obj.data //获得当前行数据
        , layEvent = obj.event; //获得 lay-event 对应的值
    if (layEvent === 'add') { //添加
        // let data = obj.data //获得当前行数据
        //     ,layEvent = obj.event; //获得 lay-event 对应的值
        let table = layui.table;
        let temp = {};

        temp.id = obj.data.id;
        for (let i = 0; i < currenttableData.length; i++) {
            if (currenttableData[i].id === temp.id) {
                layer.msg("已经添加过该题目了");
                return;
            }
        }
        temp.title = obj.data.title;
        temp.description = obj.data.description;
        temp.suggestedAnswer = obj.data.suggestedAnswer;
        temp.runtime = obj.data.runtime;
        temp.difficulty = obj.data.difficulty;
        temp.ram = obj.data.ram;
        currenttableData.push(temp);

        table.reload('demo2', {
            data: currenttableData
        });
    } else if (layEvent === 'detail') {
        top.layer.open({
            type: 2,
            title: '查看题目详情',
            area: ['80%', '90%'],
            fix: false,
            content: './modNewQuestionWindow.html',
            maxmin: true,
            btn: ['确认', '关闭'],
            success: function (layero, index) {
                let iframeWindow = top.window[layero.find('iframe')[0]['name']]
                let iframeDocument = iframeWindow.document;
                $(iframeDocument).ready(function () {
                    $(iframeDocument).find("#title").val(data.title);
                    $(iframeDocument).find("#description").val(data.description);
                    $(iframeDocument).find("#suggestedAnswer").val(data.suggestedAnswer);
                    $(iframeDocument).find("#runtime").val(data.runtime);
                    $(iframeDocument).find("#ram").val(data.ram);
                    $(iframeDocument).find("select[name='difficultydegree']").val(data.difficulty);
                    iframeWindow.layui.form.render();
                });
            }, 
            yes: function (index, layero) {
                layer.close(index);
            }, 
            btn2: function (index, layero) {
                layer.close(index);
            }
        });
    } else if (layEvent === 'checkAnswer') {
        let answer = data.suggestedAnswer;
        let answerStr = "<pre class='layui-code'>" + answer + "</pre>";
        layer.open({
            type: 1,
            title: '查看答案',
            area: ['1000px', '600px'],
            fix: false,
            // content : './checkAnswerWindow.html',  //var url = "get1.html?"  + "name=" + name + "&pwd=" + pwd
            content: answerStr,
            maxmin: true,
            btn: ['确认', '关闭'],
            success: function (layero, idnex) {
                code({
                    about: false
                });
            },
            yes: function (index, layero) {
                layer.close(index);
            }, btn2: function (index, layero) {
                layer.close(index);
            }
        });
    }
});

//表格2
layui.use('soulTable', function() {
    soulTable = layui.soulTable;
    let tableData2 = [];
    table.render({
        elem: '#demo2'
        , data: tableData2
        , id: "demo2"
        , height: 500
        , rowDrag: {/*trigger: 'row',*/ done: function (obj) {
            // 完成时（松开时）触发
            // 如果拖动前和拖动后无变化，则不会触发此方法
            // console.log(obj.row); // 当前行数据
            // console.log(obj.cache); // 改动后全表数据
            // console.log(obj.oldIndex);// 原来的数据索引
            // console.log(obj.newIndex); // 改动后数据索引
            currenttableData = [];
            for (let i = 0; i < obj.cache.length; i++) {
                let temp = {};
                temp.id = obj.cache[i].id;
                temp.title = obj.cache[i].title;
                temp.description = obj.cache[i].description;
                temp.suggestedAnswer = obj.cache[i].suggestedAnswer;
                temp.runtime = obj.cache[i].runtime;
                temp.difficulty = obj.cache[i].difficulty;
                temp.ram = obj.cache[i].ram;
                currenttableData.push(temp);
                temp = {};
            }
        }
        }
        , totalRow: true
        , cols: [[
            { field: 'id', title: '编号', width: 100, sort: true }
            , { field: 'title', title: '题目', minWidth: 100, templet: '#switchTpl', unresize: true }
            , { field: 'description', title: '题目内容', minWidth: 200, templet: '#switchTpl', unresize: true }
            , { fixed: 'right', title: '操作', width: 60, align: 'center', toolbar: '#barDemo2' }
        ]]
        , done: function () {
            soulTable.render(this)
        }
    });
});


// let table = layui.table;
// let laypage = layui.laypage;
// let tableData2 = [];
// table.render({
//     elem: '#demo2'
//     ,height: "auto"
//     ,data: tableData2
//     // 由于一般生成的题目数量不多，所以不进行分页
//     // ,page: {
//     //     layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
//     //     limits: [10, 15],
//     //     limit: 10
//     // }
//     ,cols: [[
//         {field:'id', title:'编号', width: 100, sort: true}
//         ,{field:'title' , title:'题目', minWidth: 100, templet: '#switchTpl', unresize: true }
//         ,{field:'description' , title:'题目内容', minWidth: 200, templet: '#switchTpl', unresize: true }
//         ,{fixed: 'right', title:'操作', width: 60, align:'center', toolbar: '#barDemo2'}
//     ]]
// });

//删除一行数据
table.on('tool(test2)', function (obj) { //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
    let data = obj.data //获得当前行数据
        , layEvent = obj.event; //获得 lay-event 对应的值
    if (layEvent === 'del') {
        layer.confirm('真的删除行么', function (index) {
            obj.del(); //删除对应行（tr）的DOM结构
            let n = currenttableData.indexOf(obj.data);
            currenttableData.splice(n, 1);
            // console.log(obj.data.name);
            layer.close(index);
            // //向服务端发送删除指令 //不必，最后生成的时候再发送最终结果
            // var oldData =  table.cache["demo2"];
            table.reload('demo2', {
                data: currenttableData
            });
        });
    }
});

$("#submit").click(function () {
    let table = layui.table;
    // var questionData =  table.cache["demo2"];
    let allDay = false; //默认非全天
    let startTime; //作业开始时间
    let endTime; //作业结束时间
    let classInfo; //班级信息
    let homeworkorpractice; //作业或练习题
    let title; //作业或练习题的标题
    if (currenttableData.length == 0) {
        layer.msg("请选择题目", {icon: 0});
        return;
    }
    layui.use(['layer'], function () {
        let layer = layui.layer;
        let courseStr = "";
        for (let i = 0; i < teacherCourse.length; i++) {
            teacherCourse[i] += "%"; //每个课程以%结尾，方便后续split开
            courseStr += teacherCourse[i];
        }
        $("#teachercourse").val(courseStr); //将所有课程以字符串形式放入该页面一个隐藏输入框，方便弹出框页面取值
        layer.open({
            type: 2,
            title: '添加作业或练习题',
            area: ['650px', '670px'],
            fix: false,
            content: 'createInfoWindow.html',
            maxmin: true,
            btn: ['确认选择', '关闭'],
            yes: function (index, layero) {
                //生成题目id列表
                let questionId = ""; //题目id列表
                for (let i = 0; i < currenttableData.length; i++) {
                    if (i != currenttableData.length - 1) {
                        questionId += currenttableData[i].id + ",";
                    } else {
                        questionId += currenttableData[i].id;
                    }
                }
                let allInfo = window["layui-layer-iframe" + index].callbackdata();
                layer.close(index);
                homeworkorpractice = allInfo['homeworkorpractice'];
                classInfo = allInfo['classinfo'];
                title = allInfo['title'];
                let data;
                if (homeworkorpractice === "作业") {
                    allDay = allInfo['allday'];
                    if (allInfo['allday']) {  //如果是全天
                        startTime = allInfo['startday'] + ' ' + '00:00:00';
                        endTime = allInfo['endday'] + ' ' + '00:00:00';
                        data = { 'title': title, 'problemIds': questionId, 'startTime': startTime, 'deadline': endTime };
                        console.log(data);
                    } else { //如果是非全天
                        startTime = allInfo['startday'] + ' ' + allInfo['starttime'];
                        endTime = allInfo['endday'] + ' ' + allInfo['endtime'];
                        data = { 'title': title, 'problemIds': questionId, 'startTime': startTime, 'deadline': endTime };
                        console.log(data);
                    }
                    //向后台传递数据
                    $.ajax({
                        type: "post",
                        async: false,
                        dataType: "json",
                        data: data,
                        url: "../problem/generateHomework",
                        success: function (data) {
                            alert(data.message);
                        }
                    });
                } else if (homeworkorpractice === "练习") {
                    data = { 'title': title, 'problemIds': questionId };
                    //向后台传递数据
                    $.ajax({
                        type: "post",
                        async: false,
                        dataType: "json",
                        data: data,
                        url: "../problem/generatePractice",
                        success: function (data) {
                            alert(data.message);
                        }
                    });
                }
            }, btn2: function (index, layero) {
                layer.close(index);
            }
        });
    });
});
$("#find").click(function () {
    let keyword = document.getElementById("keyword").value; //输入框中关键字
    table.reload('questionTable', {
        where: {
            value: keyword
        }
    });

});

function dataChangeField(data) {
    let tempData = JSON.stringify(data).replace(/name/g, 'title').replace(/null/g, "[]");
    return JSON.parse(tempData);
}