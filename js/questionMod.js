var allCurrentChildNode = [];
var oldNode = {}; // {id: title}
var deletNode = [];
var labelData = [];
var bindedLabel = [];
var p_suggestedAnswer = "";
var treeDfd = $.Deferred();
var getBindDfd = $.Deferred();
var getAnswerDfd = $.Deferred();
// document.getElementById('title').value = p_title;
// document.getElementById('description').value = p_description;
// document.getElementById('suggestedAnswer').value = p_suggestedAnswer;
// document.getElementById('runtime').value = p_runtime;
// document.getElementById('ram').value = p_ram;
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
function getLabels(problemId) {
    $.ajax({
        type: "get",
        url: "../problem/getLabels",
        data: {problemId: problemId},
        success: function (res){
            if (res.code == 0) {
                bindedLabel = res.body;
                getBindDfd.resolve();
            } else {
                alert(res.message);
            }
        }
    });
}
//修改后的页面数据
let title = null; //题目
let description = null; //内容
let suggestedAnswer = null; //答案
let ram = null; //运行内存
let runtime = null; //运行时间
let difficulty = null; //题目对应难度
let allInfo = null;
layui.use(['form', 'laydate', 'tree'], function () {
    let tree = layui.tree;
    // if (p_difficult === '高') {
    //     $("select[name='difficultydegree']").val('高');
    // } else if (p_difficult === '中') {
    //     $("select[name='difficultydegree']").val('中');
    // } else if (p_difficult === '低') {
    //     $("select[name='difficultydegree']").val('低');
    // }
    let form = layui.form;//表单
    form.on('select', function (data) {
        difficulty = data.value;
    });
    form.render();

    $.when(treeDfd, getBindDfd).done(function() {
        tree.render({
            elem: "#classtree"
            ,id: "labelTree"
            ,oncheck: function(obj) {
                if (obj.checked) {
                    chooseData(obj.data, "add");

                } else {
                    chooseData(obj.data, "del");
                }
            }
            ,showCheckbox:true
            ,data: labelData
            ,click: function (node) {
                var $select = $($(this)[0].elem).parents(".layui-form-select");
                $select.removeClass("layui-form-selected").find(".layui-select-title span").html(node.name).end().find("input:hidden[name='selectID']").val(node.id);
            }
        });
        let checkedNode = nodeSetCheck();
        tree.setChecked('labelTree' ,checkedNode);
    })


    function chooseData(data, type) {
        if (data.children && data.children.length > 0) {
            for (var indexChild = 0; indexChild < data.children.length; indexChild++){
                var child = data.children[indexChild];
                chooseData(child, type);
            }
        } else {
            if ("add" == type){
                console.log(data); //会根据选中的节点的叶子节点的数目进行递归到此处，如此可以获取所有子节点
                allCurrentChildNode.push(data);
            } else if ("del" == type) {
                console.log(data);
                var n = allCurrentChildNode.indexOf(data);
                allCurrentChildNode.splice(n, 1); //删除对应数据
                //如果是取消选中，就删除数据
            }
        }
    }

    $(".downpanel").on("click", ".layui-select-title", function (e) {
        $(".layui-form-select").not($(this).parents(".layui-form-select")).removeClass("layui-form-selected");
        $(this).parents(".downpanel").toggleClass("layui-form-selected");
        layui.stope(e);
    }).on("click", "dl i", function (e) {
        layui.stope(e);
    });
});
require.config({ paths: { 'vs': '../monaco-editor/min/vs' } });
require(['vs/editor/editor.main'], function () {
    monacoEditor = monaco.editor.create(document.getElementById('suggestedAnswer'), {
        value: [
        ].join('\n'),
        language: 'python',
        fontSize: "16px",
        theme: 'vs-light'
    });
    getAnswerDfd.done(function() {
        monacoEditor.setValue(p_suggestedAnswer);
    })
});

var callbackdata = function () {
    title = document.getElementById("title").value;
    description = document.getElementById("description").value;
    // suggestedAnswer = document.getElementById("suggestedAnswer").value;
    suggestedAnswer = monacoEditor.getValue();
    ram = document.getElementById("ram").value;
    runtime = document.getElementById("runtime").value;
    difficulty = document.getElementById("difficulty").value;

    allInfo = { "title": title, "description": description, "suggestedAnswer": suggestedAnswer, "ram": ram, "runtime": runtime, "difficulty": difficulty, 'labels': allCurrentChildNode, 'oldLabels': oldNode};

    return allInfo;
}

function dataChangeField(data) {
    let tempData = JSON.stringify(data).replace(/name/g, 'title').replace(/null/g, "[]");
    return JSON.parse(tempData);
}

function nodeSetCheck() {
    let checkedId = [];
    for (let label of bindedLabel) {
        checkedId.push(label.id);
        oldNode[label.id] = label.name;
    }
    return checkedId;   
}