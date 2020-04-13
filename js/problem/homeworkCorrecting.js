/*
 *@author: liyan
 *@date: 2019/11/19
 *@description: 训练场模块教师端修改作业页面js
 *@update: none
 */

var problemSetId = UrlParam.paramValues("problemSetId")[0];
var studentNumber = UrlParam.paramValues("studentNumber")[0];
var corrected = UrlParam.paramValues("corrected")[0];
var answerMap,
    scoreMap,
    submitter,
    gmtModified,
    submitTimes,
    homeworkTitle,
    creator,
    startTime,
    deadline,
    oldComment = "";
var cnt = 0;
var totalScore = 0;
var problems;
var homeworkDfd = new $.Deferred();

$(document).ready(function() {
    if(corrected == 1) {
        $("#correctSubmit").css("display", "none");
        $("input").attr("readonly", "true");
        $("textarea").attr("readonly", "true");
    }
    $.when(
        $.ajax({
            type: 'get',
            url: '../../training/teaCheckAnswerSet',
            data: {problemSetId: problemSetId, submitter: studentNumber}
        }), 
        $.ajax({
            type: 'get',
            url: '../../problem/viewHomework',
            data: {homeworkId: problemSetId}
        })
    ).done(function(v1, v2) {
        let res1 = v1[0];
        let res2 = v2[0];
        if (res1.code == 0) {
            let body1 = res1.body;
            answerMap = body1.answerMap;
            scoreMap = body1.scoreMap;
            totalScore = body1.score == -1 ? 0 : body1.score;
            gmtModified = body1.gmtModified;
            submitTimes = body1.submitTimes;
            oldComment = body1.comment;
            $("#totalScore span").text(totalScore);
            $("#comments").val(oldComment);
        } else if (res1.code == 12) {
            alert(res1.message);
            top.location.href = "../../index.html";
        } else {
            alert(res1.message);
            window.close();
        }

        if (res2.code == 0) {
            let body2 = res2.body;
            homeworkTitle = body2.title;
            creator = body2.creator;
            startTime = body2.startTime;
            deadline = body2.deadline;
            problems = body2.problems;
            cnt = problems.length;
        } else {
            alert(res2.message);
            window.close();
        }
        homeworkDfd.resolve();
    });
});

var laypage = layui.laypage;
var layer = layui.layer;
var form = layui.form;
homeworkDfd.done(function () {
    laypage.render({
        elem: 'questionPage',
        count: cnt,
        limit: 1,
        prev: '上一题',
        next: '下一题',
        first: '第一题',
        last: '最后一题',
        jump: function(obj, first) {
            let idx = obj.curr - 1;
            $(".page-btn").removeClass("layui-disabled");
            if (idx == 0) {
                $(".last-btn").addClass("layui-disabled");
            }
            if (obj.curr == cnt) {
                $(".next-btn").addClass("layui-disabled");
            }
            let problem = problems[idx];
            $("#questionAnswer").data("id", problem.id);
            $("#questionTitle").text(problem.title);
            $("#question-description").text(problem.description);
            let answer = answerMap[problem.id];
            $("#answer").text(answer);
            if (problem.suggestedAnswer) {
                $("#sug-answer").text(problem.suggestedAnswer);
            } else {
                $("#sug-answer").text("//无参考答案");
            }
            let score = scoreMap[problem.id] == -1 ? "" : scoreMap[problem.id];
            $("#score").val(score);
            layui.code({
                about: false
            });
        }
    });

    $("#score").change(function() {
        let that = this;
        if (!socreVerify()) {
            return;
        }
        let problemId = $("#questionAnswer").data("id");
        scoreMap[problemId] = parseInt(this.value);
        cntTotalScore();
    });
    $("#score").on("keyup", function(e) {
        if(!socreVerify()) {
            e.preventDefault();
            return false;
        }
    });

    $("#correctSubmit").on("click", function() {
        if (!socreVerify()) return;
        let unCorrected = allScoreVerify();
        if (unCorrected != "") {
            layer.msg(`第${unCorrected}题尚未批改`, {icon: 0});
            return;
        }
        let comment = $("#comments").val();
        let problemsArr = "";
        let scoreArr = "";
        for (let problem of problems) {
            problemsArr += problem.id + ',';
            scoreArr += scoreMap[problem.id].toString() + ',';
        }
        $.ajax({
            type: 'post',
            url: '../../training/scoreStuWorks',
            data: {problemSetId: problemSetId, 
                   submitter: studentNumber, 
                   comment: comment, 
                   problems: problemsArr,
                   scoreOfProblem: scoreArr,
                   score: totalScore
                },
            success: function(res) {
                if (0 == res.code) {
                    layer.msg(res.message, {icon: 6});
                    window.close();
                } else if (12 == res.code) {
                    alert(res.message);
                } else {
                    layer.msg(res.message , {icon: 5});
                }
            }
        });
    });
});

function cntTotalScore() {
    totalScore = 0;
    for (let i in scoreMap) {
        totalScore += (scoreMap[i] == -1 ? 0 : scoreMap[i]);
    }
    $("#totalScore span").text(totalScore);
}

$(".last-btn").on("click", function() {
    if ($(this).hasClass("layui-disabled")) {
        return;
    }
    $(".layui-laypage-prev")[0].click();
});

$(".next-btn").on("click", function() {
    if($(this).hasClass("layui-disabled")) {
        return;
    }
    $(".layui-laypage-next")[0].click();
});

function socreVerify() {
    let elem = $("#score");
    if (!(/(^\d+$)/.test(elem.val()))) {
        layer.tips("分数只能为非负整数", '#score');
        setTimeout(function() {
            elem.focus();
        }, 7);
        return false;
    }
    return true;
}

function allScoreVerify() {
    let idx = 0;
    let unCorrected = "";
    for (let problem of problems) {
        idx++;
        if (scoreMap[problem.id] == -1) {
            unCorrected += idx.toString() + ",";
        }
    }
    if (unCorrected != "") {
        unCorrected = unCorrected.slice(0, unCorrected.length-1);
    }
    return unCorrected;
}
