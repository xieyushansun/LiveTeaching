/*
 *@author: liyan
 *@date: 2019/11/19
 *@description: 训练场模块教师端批改作业查看学生列表js
 *@update: none
 */

var courseNumber = UrlParam.paramValues("courseNumber")[0];
var problemSetId = UrlParam.paramValues("problemSetId")[0];
var finishedStates = {};
var table = layui.table;
var layer = layui.layer;

$(document).ready(function() {
    $.ajax({
        type: "post",
        url: "../../course/getByNumber",
        data: {number: courseNumber},
        success: function(res) {
            if (0 == res.code) {
                $("courseName").text(res.body.name);
            } else if (12 == res.code) {
                alert(res.message);
                top.location.href = "../../index.html";
            } else {
                alert(res.message);
            }
        }
    });
    $.ajax({
        type: 'post',
        url: '../../problem/checkStudentFinishingHomework',
        data: {problemSetId: problemSetId, courseNumber: courseNumber},
        success: function(res) {
            if (0 == res.code) {
                finishedStates = finished(res.body);
            } else {
                alert(res.message);
            }
            table.render({
                elem: "#studentList",
                id: 'studentList',
                url: '../../studentCourse/getStudentInCourse',
                method: 'post',
                where: {
                    courseNumber: courseNumber
                },
                cols: [[
                    {field: 'number', title: '学号'},
                    {field: 'username', title: '姓名'},
                    {field: 'male', title: '性别', templet: function(d) {
                        if (d.male == true) {
                            return '男';
                        } else {
                            return '女';
                        }
                    }},
                    {title: '操作', center: 'center', toolbar: '#barCorrect'}
                ]],
                page: true,
                limit: 10,
                limits: [10, 20],
                done: function(res, curr, count) {
                    if (12 == res.code) {
                        alert(res.message);
                        top.location.href = "../../index.html";
                    }
                },
                parseData: function(res) {
                    return {
                        "code": res.code,
                        "msg": res.message,
                        "data": res.body.content? res.body.content: [],
                        "count": res.body.totalElements
                    }
                },
            });
        }
    });
});

table.on('tool(studentList)', function(obj) {
    let studentNumber = obj.data.number;
    if (obj.event == "correct") {
        top.layer.open({
            type: 2,
            area: ["100%", "100%"],
            title: "作业列表",
            closeBtn: 1,
            content: './problem/homeworkCorrecting.html?problemSetId='+problemSetId+'&studentNumber='+studentNumber+'&corrected=0',
            anmi: 2
        });
        // window.open('./homeworkCorrecting.html?problemSetId='+problemSetId+'&studentNumber='+studentNumber, '_balnk2');
    } else if (obj.event == "unSubmit") {
        layer.msg("该学生暂未提交答卷", {icon: 0, time: 3000});
    } else if (obj.event == "corrected") {
        top.layer.open({
            type: 2,
            area: ["100%", "100%"],
            title: "作业列表",
            closeBtn: 1,
            content: './problem/homeworkCorrecting.html?problemSetId='+problemSetId+'&studentNumber='+studentNumber+'&corrected=1',
            anmi: 2
        });
    }
});

function finished(body) {
    let finishedStates = {};
    for(let student of body) {
        finishedStates[student.number] = student.status;
    }
    return finishedStates;
}