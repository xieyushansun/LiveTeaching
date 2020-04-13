var title = null; //题目
var content = null; //内容
var answer = null; //答案
var memory = null; //运行内存
var runtime = null; //运行时间
var difficult = null; //题目对应难度
var allInfo = null;
var allCurrentChildNode = [];
var labelData = [];
var treeDfd = $.Deferred();
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
layui.use(['form', 'laydate', 'tree'], function () {
    var form = layui.form;//表单
    var tree = layui.tree;
    form.on('select', function (data) {
        difficult = data.value;
    });

    treeDfd.done(function (){
        tree.render({
            elem: "#classtree"
            ,oncheck: function(obj) {
                if (obj.checked) {
                    chooseData(obj.data, "add");

                } else {
                    chooseData(obj.data, "del");
                }
            }
            ,showCheckbox:true
            ,data: labelData
            ,
            click: function (node) {
                var $select = $($(this)[0].elem).parents(".layui-form-select");
                $select.removeClass("layui-form-selected").find(".layui-select-title span").html(node.name).end().find("input:hidden[name='selectID']").val(node.id);
            }
        });
    });
    
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
    // $(document).on("click", function (e) {
    //     $(".layui-form-select").removeClass("layui-form-selected");
    // });
});
require.config({ paths: { 'vs': '../monaco-editor/min/vs' } });
require(['vs/editor/editor.main'], function () {
    monacoEditor = monaco.editor.create(document.getElementById('answer'), {
        value: [
        ].join('\n'),
        language: 'python',
        fontSize: "16px",
        theme: 'vs-light'
    });
});
var callbackdata = function () {
    title = document.getElementById("title").value;
    content = document.getElementById("content").value;
    // answer = document.getElementById("answer").value;
    answer = monacoEditor.getValue(); //从代码修饰器中获取填写的代码
    memory = document.getElementById("memory").value;
    runtime = document.getElementById("runtime").value;

    allInfo = { "title": title, "content": content, "answer": answer, "memory": memory, "runtime": runtime, "difficult": difficult, "labels": allCurrentChildNode};

    return allInfo;
}

function dataChangeField(data) {
    let tempData = JSON.stringify(data).replace(/name/g, 'title').replace(/null/g, "[]");
    return JSON.parse(tempData);
}