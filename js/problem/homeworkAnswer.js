/*
 *@author: liyan
 *@date: 2019/11/9
 *@description: 训练场完成作业页面的前端js, 实现获取题目内容、题目分页跳转、提交答案
                未对作答进行实时保存。
 *@update: 修改代码运行接口参数
 */

var questions = [];
var title = "";
var homeworkId = UrlParam.paramValues("homeworkId")[0];
var layer = layui.layer;
var loadIndex = 0;
var studentId;

var userDfd = new $.Deferred();
var questionDfd = new $.Deferred();

var monacoEditor;
var monacoEditorDfd = new $.Deferred();
var oldPage = 1;
var laypage = layui.laypage;
var element = layui.element;

var blocklyArea = document.getElementById('blocklyArea');
var blocklyDiv = document.getElementById('blocklyDiv');
var workspace;
var isResizing = false;
var lastDownY = 0;
var runAreaHeight = 200;
var contrainer = $("#ide");
var runArea = $("#runArea");

var model = 'code';

$(document).ready(function() {
    loadIndex = layer.load(2, {shade: 0.8});
    $.ajax({
        type: 'get',
        url: '../../login/getCurrentUser',
        success: function(res) {
            if (0 == res.code) {
                studentId = res.body.number;
                userDfd.resolve();
            } else if (12 == res.code) {
                alert(res.message);
                top.location.href="../../index.html";
            } else {
                alert(res.message);
            }
        }
    });
    $.ajax({
        type: "get",
        url: "../../problem/viewHomework",
        // url: '../../data/json/homework.json',
        data: {'homeworkId': homeworkId},
        success: function(res) {
            if (0 == res.code) {
                title = res.body.title;
                questions = res.body.problems;
                if (questions.length == 0) {
                    layer.alert("该试题暂无题目，请联系教师或管理员", {icon: 2});
                    layer.close(loadIndex);
                    return;
                }
                questionDfd.resolve();

            } else {
                alert(res.message);
            }
        }
    });
    $.when(userDfd, questionDfd).done(function(v0, v1) {
        let len = questions.length;
        let answerDfd = $.Deferred();
        for (let idx in questions) {
            $.ajax({
                type: "get",
                url: "../../getcode",
                async: false,
                data: {id: studentId, problemSetId: homeworkId, problemid: questions[idx].id},
                success: function (res) {
                    let _idx = idx;
                    if (res.code == 0) {
                        questions[_idx].answer = res.body;
                    } else {
                        questions[_idx].answer = "";
                    }
                    if (_idx == len - 1) {
                        answerDfd.resolve();
                    }
                }
            });
        }
        answerDfd.done(function() {
           laypageRender(); 
        });
        layer.close(loadIndex);
    })
});

//分页渲染
function laypageRender() {
    laypage.render({
        elem: 'questionPage',
        count: questions.length,
        limit: 1,
        prev: '上一题',
        next: '下一题',
        first: '第一题',
        last: '最后一题',
        // layout: ['prev', 'page', 'next', 'skip'],
        jump: function(obj, first) {
            var curr = obj.curr;
            if (first) {
                editorRender();
                monacoEditorDfd.done(function() {
                    showAnswer(curr - 1);
                });
            } else {
                showAnswer(curr - 1);
            }
            showQuestion(curr - 1);
            showConsole(curr - 1);
            oldPage = curr;
        }
    });
}

//编辑器渲染
function editorRender() {
    require.config({ paths: { 'vs': '../../monaco-editor/min/vs' }});
    require(['vs/editor/editor.main'], function() {
        monacoEditor = monaco.editor.create(document.getElementById('code-editor'), {
            value: [
            ].join('\n'),
            language: 'python',
            fontSize: "16px",
            theme: 'vs-dark'
        });
        monacoEditorDfd.resolve();
    });

    workspace = Blockly.inject(blocklyDiv,{
        toolbox: document.getElementById('toolbox'), 
        scrollbars: true,
        media: "../../blockly/media/",
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        },
        trashcan: true
    });
    onresize();
    Blockly.svgResize(workspace);
}

//显示题目
function showQuestion(idx) {
    let question = questions[idx];
    $("#question").data("id", question.title);
    $("#question_title").text(question.title);
    $("#question_description").text(question.description);
    let apiList = question.apiList;
    let labelList = question.labelList;
    if (apiList.length != 0) {
        for (let api of apiList) {
            let apiLi = $(`<li class="api-li"><button type="button" class="layui-btn layui-btn-normal layui-btn-sm layui-btn-radius" data-id="${api.id}">${apd.title}</button></li>`);
            $("#api-ul").append(apiLi);
        }
        $(".api-content .layui-colla-title").trigger("click");
    } else {
        $("#api-ul").text("暂无绑定API");
    }

    if (labelList.length != 0) {
        $("#label-ul").empty();
        if ($("#label-colla").hasClass("layui-show")) {
            $(".label-content .layui-colla-title").trigger("click");
        }
        for (let label of labelList) {
            let labelLi = $(`<li class="lable-li"><button type="button" class="layui-btn layui-btn-normal layui-btn-sm layui-btn-radius" data-id="${label.id}">${label.name}</button></li>`)
            $("#label-ul").append(labelLi);
        }
        $(".label-content .layui-colla-title").trigger("click");
    } else {
        $("#label-ul").text("暂无绑定标签");
    }
}
 
// 显示换页前的回答
function showAnswer(idx) {
    // 换页时将之前的答案存到js中
    if (idx != oldPage - 1) {
        updateAnswer(oldPage - 1);
    }
    if (questions[idx].answer) {
        if (model == 'code') {
            monacoEditor.setValue(questions[idx].answer);
        } else {
            workspace.clear();
        }
    } else {
        monacoEditor.setValue('');
        workspace.clear();
    }
}

// 显示换页前的console内容
function showConsole(idx) {
    let console = questions[idx]["console"]? questions[idx].console: "";
    $("#console").html(console);
}

// 更新回答至questions
function updateAnswer(idx) {
    let code = model == 'code' ? monacoEditor.getValue(): Blockly.Python.workspaceToCode(workspace);
    questions[idx].answer = code;
}

// 提交答案
function submitAnswer() {
    updateAnswer(oldPage - 1);
    var answerMap = {};
    for (let question of questions) {
        answerMap[question.id] = question.answer === undefined ? "": question.answer;
    }
    var submitData = {
        answerMap: answerMap,
        problemSetId: homeworkId,
        submitter: studentId
    }

    $.ajax({
        type: "post",
        url: "../../training/stuSubmitWorks",
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(submitData),
        success: function(res) {
            var icon = 6;
            if (0 == res.code) {
                icon = 6;
            } else if (12 == res.code) {
                icon = 5;
            } else {
                icon = 3;
            }
            layer.msg(res.message, {icon: icon});
        }
    });
}

// 切换编辑模式
$("#change_mode").on("click", function() {
    let blockspace = $("#block-editor");
    let codespace = $("#code-editor");
    if (blockspace.hasClass("active")) {
        blockspace.css("display", "none").removeClass("active");
        codespace.css("display", "block").addClass("active");
        monacoEditor.layout();
        var code = Blockly.Python.workspaceToCode(workspace);
        monacoEditor.setValue(code);
        model = 'code';
    } else {
        codespace.css("display", "none").removeClass("active");
        blockspace.css("display", "block").addClass("active");
        editorLayout();
        model = 'block';
    }
});

// 运行代码
$("#run-button").on("click", function() {
    let page = oldPage;
    let question = questions[oldPage - 1];
    let problemId = question.id;
    let codeName = question.title;
    let code = model == 'code' ? monacoEditor.getValue(): Blockly.Python.workspaceToCode(workspace);
    let timeout = question.runtime ? question.runtime: 20000;
    $.ajax({
        type: 'post',
        url: '../../runcode',
        data: {
            id: studentId,
            problemSetId : homeworkId,
            problemid: problemId, 
            code: code,
        },
        beforeSend: function() {
            consoleShow();
            $("#console").text("正在运行...");
            questions[page - 1]["console"] = "正在运行...";
        },
        success: function(res) {
            if (0 == res.code) {
                let result = res.body;
                result += "ms";
                questions[page - 1]["console"] = result;
                if (oldPage == page) {
                    consoleShow();
                    $("#console").html(result);
                }

            } else {
                layer.msg(res.message, {icon: 5});
                let result = res.body;
                result += "ms";
                questions[page - 1]["console"] = result;
                if (oldPage == page) {
                    consoleShow();
                    $("#console").html(result);
                }
            }
        }
    });
});

$("#console-btn").on('click', function() {
    if (runArea.hasClass("opened")) {
        runArea.removeClass("opened").addClass("closed");
    } else {
        consoleShow();
    }
    editorLayout();
});

function consoleShow() {
    if (runArea.hasClass("closed")) {
        var oldHeight = $("#code-editor .monaco-editor").height();
        $("#code-editor .monaco-editor").css("height", oldHeight - runAreaHeight + 'px');
        runArea.css("height", runAreaHeight + "px");
        runArea.removeClass("closed").addClass("opened");
    }
    editorLayout();
}

function editorLayout() {
    onresize();
    Blockly.svgResize(workspace);
    monacoEditor.layout();
}

var isResizing = false;
var lastDownY = 0;
var runAreaHeight = 200;
var contrainer = $("#ide");
var runArea = $("#runArea");
var resizor = $("#runBar");
resizor.on("mousedown", function(e) {
    isResizing = true;
    lastDownY = e.clientY;
});

$(document).on('mousemove', function(e) {
    if (!isResizing) return true;
    runAreaHeight = contrainer.offset().top + contrainer.height() - e.clientY;
    if (runAreaHeight < 20) {
        console.log("over");
        runAreaHeight = 22;
        isResizing = false;
        return true;
    } else if (runAreaHeight > (contrainer.height() - 20)) {
        runAreaHeight = contrainer.height() - 22;
        isResizing = false;
        return true;
    }

    runArea.css('height', runAreaHeight);
    var oldHeight = $("#code-editor .monaco-editor").height();
    $("#code-editor .monaco-editor").css("height", oldHeight - runAreaHeight + 'px');
    editorLayout();

    // if (clientY < )
}).on('mouseup', function(e) {
    isResizing = false;
});

$(window).on('resize', function() {
    window.setTimeout(function() {
        editorLayout();
    }, 250);
});

$.fn.gresizeW = function () {
    return this.each(function () {
        var elem = $(this);
        elem.on("mousedown", function(e) {
            document.onselectstart = function(e) {return false;}
            $(document).on('mousemove.resize', function(e) {
                var containerOffsetLeft = elem.parent().offset().left;
                var pointerRelativeXpos = e.clientX - containerOffsetLeft;
                var boxAminWidth = 300;
                elem.prev().css({"width": Math.max(boxAminWidth, pointerRelativeXpos)  + 'px', 
                                    "flexGrow": 0});
                monacoEditor.layout();
                onresize();
            });
            $(document).on("mouseup", function() {
                $(document).off('mousemove.resize');
                document.onselectstart = function(e) {return true;}
            });
        });
    });
}
$(".resize-bar").gresizeW();

var onresize = function(e) {
    // Compute the absolute coordinates and dimensions of blocklyArea.
    var element = blocklyArea;
    var x = 0;
    var y = 0;
    do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
    } while (element);
    // Position blocklyDiv over blocklyArea.
    // blocklyDiv.style.left = x + 'px';
    // blocklyDiv.style.top = y + 'px';
    blocklyDiv.style.width = blocklyArea.clientWidth + 'px';
    blocklyDiv.style.height = blocklyArea.clientHeight + 'px';
    Blockly.svgResize(workspace);
};