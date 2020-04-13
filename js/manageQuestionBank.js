var allCurrentChildNode = []; //当前所有选中的叶子节点
var labelData = [];
var treeDfd = $.Deferred();

var table = layui.table;
var form = layui.form;
var code = layui.code;
var layer = layui.layer;
var element = layui.element;
var tree = layui.tree;

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
$("#addNewQuestion").on("click", function () {
    
    top.layer.open({
        type: 2,
        title: '新增题目',
        area: ['80%', '90%'],
        fix: false,
        content: './addNewQuestionWindow.html',  //var url = "get1.html?"  + "name=" + name + "&pwd=" + pwd
        maxmin: true,
        btn: ['确认添加', '关闭'],
        yes: function (index, layero) {
            var allInfo = parent.window["layui-layer-iframe" + index].callbackdata();
            layer.close(index);
            let title = allInfo['title']; //题目
            let content = allInfo['content']; //内容
            let answer = allInfo['answer']; //答案
            let memory = allInfo['memory']; //运行内存
            let runtime = allInfo['runtime']; //运行时间
            let difficult = allInfo['difficult']; //题目难度
            let labels = allInfo['labels'];
            //usernumber: 命题人编号
            // allCurrentChildNode: 是一个json数组，键均为title
            data = {
                'title': title, 'description': content, 'suggestedAnswer': answer, 'ram': memory,
                'runtime': runtime, 'difficulty': difficult
            }; //, "labelIds": allCurrentChildNode
            //向后台传递数据
            $.ajax({
                type: "post",
                async: false,
                dataType: "json",
                data: JSON.stringify(data),
                contentType: "application/json",
                url: "../problem/add",
                success: function (data) {
                    alert(data.message);
                    layer.close(index);
                    for (label of labels) {
                        questionBindLabel(label.title, title);
                    }
                }
            });
        }, btn2: function (index, layero) {
            layer.close(index);
        }
    });
});

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
        ,
        click: function (node) {
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

//题目表格

table.render({
    elem: '#demo'
    , height: "auto"
    , method: "post"
    , url: "../problem/select"
    , id: 'questionTable'
    , page: {
        layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
        limits: [10, 15]
        // limit: 5limits: [10, 15],
        // limit: 5
    }
    , skin: 'nob' //行边框风格
    , cols: [[
        // {type: 'checkbox', fixed: 'left'},   //去掉前面多选框
        { field: 'id', title: '编号', sort: true }
        , { field: 'title', title: '题目', minWidth: 120, templet: '#switchTpl', unresize: true }
        , { field: 'description', title: '题目内容', minWidth: 120, templet: '#switchTpl', unresize: true }
        , { field: 'suggestedAnswer', title: '参考答案', event: 'checkAnswer', minWidth: 120, templet: '#switchTpl', unresize: true }
        , { field: 'runtime', title: '运行时间', minWidth: 120, templet: '#switchTpl', unresize: true }
        , { field: 'difficulty', title: '难度', minWidth: 120, templet: '#switchTpl', unresize: true }
        , { field: 'creator', title: '创建者', minWidth: 120, templet: '#switchTpl', unresize: true }
        , { field: 'ram', title: '运行内存', minWidth: 120, templet: '#switchTpl', unresize: true }
        , { fixed: 'right', width: 165, align: 'center', toolbar: '#barDemo' }
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
table.on('tool(test)', function (obj) { //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
    var data = obj.data; //获得当前行数据
    var layEvent = obj.event; //获得 lay-event 对应的值
    if (layEvent === 'detail') {
        // var checkStatus = table.checkStatus('demo');
        // var checkData = checkStatus.data;
        // if (checkData.length === 0 || checkData.length === 1){
        //弹出详情框，暂时没有写
        // $("#title").val(obj.data.title);
        // $("#description").val(obj.data.description);
        // $("#suggestedAnswer").val(obj.data.suggestedAnswer);
        // $("#runtime").val(obj.data.runtime);
        // $("#ram").val(obj.data.ram);
        // $("#difficulty").val(obj.data.difficulty);
        top.layer.open({
            type: 2,
            title: '查看题目详情',
            area: ['80%', '90%'],
            fix: false,
            content: './modNewQuestionWindow.html',
            maxmin: true,
            btn: ['确认', '关闭'],
            success: function (layero, index) {
                let iframeWindow = top.window[layero.find('iframe')[0]['name']];
                let iframeDocument = iframeWindow.document;
                iframeWindow.getLabels(data.id);
                $(iframeDocument).ready(function () {
                    $(iframeDocument).find("#title").val(data.title);
                    $(iframeDocument).find("#description").val(data.description);
                    $(iframeDocument).find("#runtime").val(data.runtime);
                    $(iframeDocument).find("#ram").val(data.ram);
                    $(iframeDocument).find("select[name='difficultydegree']").val(data.difficulty);
                    iframeWindow.p_suggestedAnswer = data.suggestedAnswer;
                    iframeWindow.getAnswerDfd.resolve();
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
        // for (var i = 0; i < checkData.length; i++){
        //     alert(checkData[i].id); //输出该行的id
        // }
    } else if (layEvent === 'mod') { //修改
        // $("#title").val(obj.data.title);
        // $("#description").val(obj.data.description);
        // $("#suggestedAnswer").val(obj.data.suggestedAnswer);
        // $("#runtime").val(obj.data.runtime);
        // $("#ram").val(obj.data.ram);
        // $("#difficulty").val(obj.data.difficulty);
        top.layer.open({
            type: 2,
            title: '修改题目',
            area: ['80%', '90%'],
            fix: false,
            content: './modNewQuestionWindow.html',
            maxmin: true,
            btn: ['确认修改', '关闭'],
            success: function (layero, index) {
                let iframeWindow = top.window[layero.find('iframe')[0]['name']]
                let iframeDocument = iframeWindow.document;
                iframeWindow.getLabels(data.id);
                $(iframeDocument).ready(function () {
                    $(iframeDocument).find("#title").val(data.title);
                    $(iframeDocument).find("#description").val(data.description);
                    $(iframeDocument).find("#runtime").val(data.runtime);
                    $(iframeDocument).find("#ram").val(data.ram);
                    $(iframeDocument).find("select[name='difficultydegree']").val(data.difficulty);
                    iframeWindow.p_suggestedAnswer = data.suggestedAnswer;
                    iframeWindow.getAnswerDfd.resolve();
                    iframeWindow.layui.form.render();
                });
            },
            yes: function (index, layero) {
                let allInfo = top.window["layui-layer-iframe" + index].callbackdata();
                let title = allInfo['title'];
                let description = allInfo['description'];
                let suggestedAnswer = allInfo['suggestedAnswer'];
                let runtime = allInfo['runtime'];
                let ram = allInfo['ram'];
                let difficulty = allInfo['difficulty'];
                let labels = allInfo['labels'];
                let oldLabels = allInfo['oldLabels'];
                data = {
                    'id': obj.data.id, 'title': title, 'description': description, 'suggestedAnswer': suggestedAnswer, 'ram': ram,
                    'runtime': runtime, 'difficulty': difficulty
                };    //, "labelIds": allCurrentChildNode
                //向后台传递数据
                $.ajax({
                    type: "post",
                    async: false,
                    dataType: "json",
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    url: "../problem/update",
                    success: function (data) {
                        alert(data.message);
                        // 如果oldLabels里面没有，则是新加的
                        for (let label of labels) {
                            if (oldLabels[label.id] === undefined) {
                                questionBindLabel(label.title, title);
                            }
                        }
                        // 老标签中未出现在现在的标签中即为删除的标签
                        for (let id in oldLabels) {
                            if (labels.find(o => o.id == id) === undefined) {
                                questinRemoveLabel(oldLabels[id], title);
                            }
                        }
                        top.layer.close(index);
                        table.reload('questionTable');
                    }
                });

            }, btn2: function (index, layero) {
                layer.close(index);
            }
        });
    } else if (layEvent === "delete") {
        layer.confirm('真的删除行么', function (index) {
            layer.close(index);
            obj.del(); //删除对应行（tr）的DOM结构
            data = { "problemId": obj.data.id }; //传递id
            $.ajax({
                type: "post",
                async: false,
                dataType: "json",
                data: data,
                url: "../problem/delete",
                success: function (data) {
                    if(data.code == 0) {
                        table.reload('questionTable');
                    }
                    // currentUserNumber = data.body.number; //获取当前登录用户
                }
            });
        });
    } else if (layEvent === "checkAnswer") { //监听单元格事件
        //弹出一个代码修饰器框
        let answer = data.suggestedAnswer;
        let answerStr = "<pre class='layui-code'>" + answer + "</pre>";
        layer.open({
            type: 1,
            title: '查看答案',
            area: ['70%', '80%'],
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
$("#find").click(function () {
    let keyword = document.getElementById("keyword").value; //输入框中关键字
    // if (keyword === ""){
    //     layer.msg("请输入题目关键字后进行查找！");
    //     return;
    // }
    table.reload("questionTable", {
        where: { "value": keyword }
    });
    // table.render({
    //     elem: '#demo'
    //     ,height: "auto"
    //     ,method: "post"
    //     // ,count: totalElements
    //     ,url: "../problem/select"
    //     ,where:{"value": keyword}
    //     ,page: {
    //         layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
    //         limits: [10, 15]
    //         // limit: 5limits: [10, 15],
    //         // limit: 5
    //     }
    //     ,skin: 'nob' //行边框风格
    //     ,cols: [[
    //         // {type: 'checkbox', fixed: 'left'},
    //         {field:'id', title:'编号'   , sort: true}
    //         ,{field:'title' , title:'题目', minWidth: 120, templet: '#switchTpl', unresize: true }
    //         ,{field:'description' , title:'题目内容', minWidth: 120, templet: '#switchTpl', unresize: true }
    //         ,{field:'suggestedAnswer' , title:'参考答案', minWidth: 120, templet: '#switchTpl', unresize: true }
    //         ,{field:'runtime' , title:'运行时间', minWidth: 120, templet: '#switchTpl', unresize: true }
    //         ,{field:'difficulty' , title:'难度', minWidth: 120, templet: '#switchTpl', unresize: true }
    //         ,{field:'creator' , title:'创建者', minWidth: 120, templet: '#switchTpl', unresize: true }
    //         ,{field:'ram' , title:'运行内存', minWidth: 120, templet: '#switchTpl', unresize: true }
    //         ,{fixed: 'right', width: 165, align:'center', toolbar: '#barDemo'}
    //     ]]
    //     ,parseData: function(res) {
    //         return {
    //             "code": res.code,
    //             "msg": res.message,
    //             "data": res.body.content,
    //             "count": res.body.totalElements
    //         }
    //     }
    // });

});


function questionBindLabel(labelName, problemTitle) {
    $.ajax({
        type: 'post',
        url: "../label/tagLabel",
        data: { labelName: labelName, problemTitle: problemTitle },
        success: function (res) {
            if (res.code != 0) {
                alert(res.message);
            }
        }
    });
}

function questinRemoveLabel(labelName, problemName) {
    $.ajax({
        type: 'post',
        url: '../label/removeLabel',
        data: {'labelName': labelName, 'problemName': problemName},
        success: function (res) {
            if (res.code != 0) {
                alert(ress.message);
            }
        }
    });
}
function dataChangeField(data) {
    let tempData = JSON.stringify(data).replace(/name/g, 'title').replace(/null/g, "[]");
    return JSON.parse(tempData);
}