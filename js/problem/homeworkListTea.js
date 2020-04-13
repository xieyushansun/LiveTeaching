/*
 *@author: liyan
 *@date: 2019/12/23
 *@description: 训练场模块教师端显示作业列表页面js
 *@update: 修改学生名单打开方式，添加课程选择 by @liyan
 */


var courseNumbers = UrlParam.paramValues("courseNumber");
var courseNumber;
var courseLists;
var getListDtd = new $.Deferred();
var table = layui.table;
var form = layui.form;
var layer = layui.layer;

$(document).ready(function() {
    
    table.render({
        elem: "#homeworkList",
        id: 'homeworkList',
        data: [],
        cols: [[
            {field: 'title', title: '标题'},
            {field: 'startTime', title: '开始时间', templet: function(d) {return transformTime(d.startTime)}},
            {field: 'deadline', title: '截止时间', templet: function(d) {return transformTime(d.deadline)}},
            {field: 'creator', title: '创建人'},
            {title: '操作', algin: 'center', toolbar: '#barView'}
        ]],
        page: true,
        limit: 10,
        limits: [10, 20]
    });
    if (courseNumbers) {
        $(".choose-course").css("display", "none");
        courseNumber = courseNumbers[0];
        $.ajax({
            type: 'post',
            url: '../../course/getByNumber',
            data: {number: courseNumber},
            success: function(res) {
                if (0 == res.code) {
                    $(".courseName span").text(res.body.name);
                    $(".courseNumber span").text(res.body.number);
                } else if (12 == res.code) {
                    alert(res.message);
                    top.location.href = '../../inedx.html';
                } else {
                    alert(res.message);
                }
            }
        });
        table.reload('homeworkList', {
            url: '../../problem/findHomeworkByCourse',
            method: 'post',
            where: {
                courseNumber: courseNumber
            },
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
                    "data": res.body.content,
                    "count": res.body.totalElements
                }
            }
        });
    } else {
        $.ajax({
            type: "get",
            url: "../../login/getCurrentUser",
        }).done(function(res) {
            if (0 == res.code) {
                teacherNumber = res.body.number;
                $.ajax({
                    type: "get",
                    url: "../../course/getByTeacherNumber",
                    data: {"teacherNumber": teacherNumber, "limit": 20},  
                }).done(function(res) {
                    if (0 == res.code) {
                        courseLists = res.body.content;
                        changeOption("chooseCourse", makeOption(courseLists));
                        getListDtd.resolve();
                    } else {
                        alert(res.message);
                    }
                });
            } else if (12 == res.code) {
                alert(res.message);
                top.location.href="../index.html";
            } else {
                alert(res.message);
            }
        });
        
        table.reload('homeworkList', {
            url: '../../problem/findHomework',
            method: 'post',
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
                    "data": res.body.content,
                    "count": res.body.totalElements
                }
            }
        });
        form.on('select(courseSelect)', function(data) {
            courseNumber = data.value;
            if (courseNumber === "") {
                table.reload('homeworkList', {
                    url: '../../problem/findHomework',
                    method: 'post',
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
                            "data": res.body.content,
                            "count": res.body.totalElements
                        }
                    }
                });
                $(".courseName span").text("");
                $(".courseNumber span").text("");
            } else {
                $(".courseName span").text(data.elem.selectedOptions[0].label);
                $(".courseNumber span").text(courseNumber);
                table.reload('homeworkList', {
                    url: "../../problem/findHomeworkByCourse",
                    where: {
                        courseNumber: courseNumber
                    },
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
                            "data": res.body.content,
                            "count": res.body.totalElements
                        }
                    }
                });
            }
        });
    }
});

getListDtd.done(function() {
    form.render();
})

table.on('tool(homeworkList)', function (obj) {
    var data = obj.data;
    var id = data.id;
    var layEvent = obj.event;
    if ('list' == layEvent) {
        parent.layer.open({
            type: 2,
            area: ["800px", "675px"],
            title: "学生列表",
            closeBtn: 1,
            content: './problem/homeworkStudentList.html?problemSetId='+data.id+'&courseNumber='+courseNumber,
            anmi: 2
        });
        // window.location.href = './homeworkStudentList.html?problemSetId='+data.id+'&courseNumber='+courseNumber;
        // $(".layui-layer-title", parent.document).text("学生名单");
    }
});


function transformTime(timestamp) {
    if (timestamp) {
        var time = new Date(timestamp);
        var y = time.getFullYear();
        var M = time.getMonth() + 1;
        var d = time.getDate();
        var h = time.getHours();
        var m = time.getMinutes();
        var s = time.getSeconds();
        return y + '-' + addZero(M) + '-' + addZero(d) + ' ' + addZero(h) + ':' + addZero(m) + ':' + addZero(s);
    } else {
        return '';
    }
}

function addZero(m) {
    return m < 10 ? '0' + m : m;
}


function makeOption(data_list){
    let option_list = [{"val": "", "text": "全部课程"}];
    for (let indexList = 0; indexList < data_list.length; indexList++) {
        let data = data_list[indexList];
        if (!data) {
            continue;
        }
        option_list.push({"val": data.number, "text": data.name});
    }
    return option_list;
}

function changeOption(name, option_list){
    let selector = "select[name="+name+"]";
    $(selector).empty();
    if(option_list) {
        for(let i = 0, len = option_list.length; i < len; i++){
            var option = $("<option>").val(option_list[i].val).text(option_list[i].text);
            $(selector).append(option);
        }
    }
}
