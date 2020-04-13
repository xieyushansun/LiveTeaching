/*
 *@author: liyan
 *@date: 2019/11/17
 *@description: 训练场模块学生端查看作业批改结果js
 *@update: none
 */

var problemSetId = UrlParam.paramValues("problemSetId")[0];
var answerMap,
    scoreMap,
    submitter,
    gmtModified,
    submitTimes,
    homeworkTitle,
    creator,
    startTime,
    deadline,
    comment = "";
var cnt = 0;
var totalScore = 0;
var problems;
var homeworkDfd = new $.Deferred();

$(document).ready(function() {
    $.when(
        $.ajax({
            type: 'get',
            url: '../../training/stuCheckAnswerSet',
            data: {problemSetId: problemSetId}
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
            comment = body1.comment;
            $(".comment-content").text(comment);
            $("#totalScore span").text(totalScore);
        } else if (res1.code == 12) {
            alert(res1.message);
            top.location.href = "../../index.html";
        } else {
            alert(res1.message);
            parent.layer.close(parent.layerIndex);
            // window.close();
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
            parent.layer.close(parent.layerIndex);
        }
        homeworkDfd.resolve();
    });
});

var laypage = layui.laypage;
var layer = layui.layer;
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
            $("#answer").text(answerMap[problem.id]);
            $("#score").val(scoreMap[problem.id]);
            layui.code({
                about: false
            });
        }
    });
}); 

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
