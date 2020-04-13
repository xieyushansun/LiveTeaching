/*
 *@author: liyan
 *@date: 2019/11/19
 *@description: 训练场模块学生端展示作业列表页面的js.获取作业列表并显示，点击答题跳转至作答页面
 *@update: 增加批改结果查询 by @liyan
 */

var studentNumber = "";
var homeworkListData = [];
var courseLists = [];
var getListDtd = new $.Deferred();
var layerIndex;
$.ajax({
    type: "get",
    url: "../../login/getCurrentUser",
}).done(function(res) {
    if (0 == res.code) {
        studentNumber = res.body.number;
        $.ajax({
            type: "post",
            url: "../../studentCourse/getCourseStudentChoose",
            data: {"number": studentNumber, "limit": 100},  
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

var table = layui.table;
var form = layui.form;
var layer = layui.layer;

table.render({
    elem: '#homeworkList',
    id: "homeworkListTable",
    url: "../../problem/checkHomework",
    method: "post",
    cols: [[
        {field: 'title', title: '标题'},
        {field: 'startTime', title: '开始时间', templet: function(d) {return transformTime(d.startTime)}},
        {field: 'deadline', title: '截止时间', templet: function(d) {return transformTime(d.deadline)}},
        {field: 'creator', title: '创建人'},
        {title: '操作', algin: 'center', toolbar: '#barDoWork'}
    ]],
    where: {
        studentNumber: studentNumber
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
    },
    page: true,
    limit: 10,
    limits: [10, 20, 30]
});

getListDtd.done(function() {
    form.render();
});

form.on('select(courseSelect)', function(data) {
    var courseNumber = data.value;
    if (courseNumber === "") {
        table.reload('homeworkListTable', {
            url: "../../problem/checkHomework",
            request: {
                pageName: 1
            }
        });
    } else {
        table.reload('homeworkListTable', {
            url: "../../problem/findHomeworkByCourse",
            where: {
                courseNumber: courseNumber
            },
            request: {
                pageName: 1
            }
        });
    }
});


// 点击做题
table.on('tool(homeworkList)', function(obj) {
    let data = obj.data;
    let id = data.id;
    let layEvent = obj.event;
    if ('doWork' == layEvent) {
        // window.location.href = "./homeworkAnswer.html?homeworkId=" + id;
        top.layer.open({
            type: 2,
            area: ["100%", "100%"],
            title: "作业作答",
            closeBtn: 1,
            content: "./problem/homeworkAnswer.html?homeworkId=" + id,
            anmi: 2
        });
    } else if ('viewCorrect' == layEvent) {
        $.ajax({
            type: 'get',
            url: '../../training/stuCheckAnswerSet',
            data: {problemSetId: id}
        }).done(function(res) {
            if (0 == res.code) {
                layerIndex = top.layer.open({
                    type: 2,
                    title: '批改结果',
                    area: ['100%', '100%'],
                    content: "./problem/homeworkCheckCorrect.html?problemSetId=" + id,
                });
            } else if (12 == res.code) {
                alert(res.message);
                top.location.href = "../../index.html";
            } else {
                layer.msg(res.message, {icon: 2});
            }
        }) 
    }
});


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