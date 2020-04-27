layui.use(['table', 'upload', 'layer'], function() {
    var table = layui.table;
    var upload = layui.upload;
    var layer = layui.layer;
    var $ = layui.$;
    var searchdata = "";
    var teacherName = "";
    $.ajax({
        type: "get",
        async: false,
        url: "../login/getCurrentUser",
        success: function(data) {
            if (data.code == 0) {
                searchdata = data.body.number;
                teacherName = data.body.username;
            } else {
                if (data.code == 12) {
                    alert(data.message);
                    top.location.href = "../index.html";
                } else {
                    alert(data.message);
                }
            }
        }
    })
    table.render({
        elem: '#test',
        url: '../course/getByTeacherNumber',
        method: 'get',
        where: {
            "teacherNumber": searchdata
        },
        toolbar: '#toolbarDemo',
        cellMinWidth: 80,
        title: '课程表',
        cols: [
            [{
                field: 'name',
                title: '课程名称',
                width: '10%'
            }, {
                field: 'number',
                title: '课程编号',
                width: '10%'
            }, {
                field: 'teacherNumber',
                title: '教师工号',
                width: '10%'
            }, {
                field: 'studentAmount',
                title: '学生数量',
                width: '10%'
            }, {
                fixed: 'right',
                title: '操作',
                toolbar: '#barDemo1',
                width: '40%'
            }, {
                fixed: 'right',
                title: '直播操作',
                toolbar: '#barDemo2',
                width: '20%'
            }]
        ],
        page: {
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
            // limits: [10，20，30],
            // limit: 20
        },
        response: {
            statusCode: 0
        },
        parseData: function(res) {
            var ifdata = 0;
            $.ajax({
                type: "get",
                url: "../course/getByTeacherNumber",
                data: {
                    "teacherNumber": searchdata,
                    "field": $('#field').val(),
                    "value": $('#usernamell').val(),
                    "method": $('#query').val()
                },
                async: false,
                success: function(data) {
                    if (data.code == 12) {
                        alert(data.message);
                        top.location.href = "../index.html";
                    } else if (data.code == 0) {
                        ifdata = 1;
                    } else {
                        ifdata = 0;
                    }
                }
            })
            if (ifdata == 1) {
                return {
                    "code": res.code,
                    "msg": res.message,
                    "data": res.body.content,
                    "count": res.body.totalElements,
                }
            } else {
                return {
                    "code": res.code,
                    "msg": res.message,
                    "data": [],
                    // "count": res.body.totalElements,
                }
            }
        }
    });

    var active = {
        reload: function() {
            var usernamell = $('#usernamell').val();
            var query = $('#query').val();
            var field = $('#field').val();

            //执行重载
            $.ajax({
                type: "get",
                url: "../getAuthStatement",
                success: function(data) {
                    if (data.code == 12) {
                        alert(data.message);
                        top.location.href = "../index.html";
                    } else {
                        table.reload('test', {
                            page: {
                                curr: 1 //重新从第 1 页开始
                            },
                            where: {
                                field: field,
                                value: usernamell,
                                method: query
                            }
                        });
                    }
                }
            })

        }
    };

    $('.demoTable .layui-btn').on('click', function() {
        var type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });


    table.on('tool(test)', function(obj) {
        switch (obj.event) {
            case "record":
                var meetingID = obj.data.id;
                window.open("../../AIEducation/AIEducation/liveRecordmanage.html?meetingID="+ meetingID+"&name="+obj.data.name); //
                break;
            case "living":
                // 需要添加一个是否正在直播的判定
                var meetingID = obj.data.id;
                var title = obj.data.name;
                var description = "";
                var welcomeMsg = "<br>欢迎来到" + teacherName + "老师的" + title + "课堂直播！<br>";
                $.ajax({
                    type: "GET",
                    url: '../../btest/demo10_helper.jsp',
                    data: "command=isRunning&meetingID="+meetingID,
                    dataType: "xml",
                    cache: false,
                    success: function(xml) {
                        response = $.xml2json(xml); //正在直播为true

                            layer.prompt({
                                    title: '直播内容描述',
                                    formType: 2,
                                },
                                function(value, index, elem) {
                                    description = value;
                                    var metadata = {
                                        "description": description,
                                        "email": teacherName,
                                        "title": title
                                    };
                                    layer.close(index);
                                    start_live(teacherName, meetingID, welcomeMsg, description, title);
                                }
                            );

                    },
                    error: function() {
                        alert("Failed to connect to API.");
                    }
                });

                break;
            case "view":
                $("#hidforclass").val(obj.data.number);
                $.ajax({
                    type: "post",
                    url: "../studentCourse/getStudentInCourse",
                    data: {
                        courseNumber: $("#hidforclass").val()
                    },
                    success: function(data) {
                        if (data.code != 0) {
                            if (data.code == 12) {
                                alert(data.message);
                                top.location.href = "../index.html";
                            } else {
                                alert(data.message);
                            }
                        } else {
                            layer.open({
                                type: 2,
                                area: ["70%", "90%"],
                                title: "查看学生",
                                closeBtn: 1,
                                content: "./studentView.html",
                                anmi: 2
                            })
                        }
                    }
                })

                break;

            case "push":
                $("#hidforclass").val(obj.data.number);
                $.ajax({
                    type: "get",
                    url: "../getAuthStatement",
                    success: function(data) {
                        if (data.code != 0) {
                            if (data.code == 12) {
                                alert(data.message);
                                top.location.href = "../index.html";
                            } else {
                                alert(data.message);
                            }
                        } else {
                            layer.open({
                                type: 2,
                                area: ["70%", "90%"],
                                title: "推送课件",
                                closeBtn: 1,
                                content: "./jiaoAnFromTeacher.html",
                                anmi: 2
                            })
                        }
                    }
                })

                break;

            case "pushed":
                $("#hidforclass").val(obj.data.number);
                $.ajax({
                    type: "get",
                    url: "../getAuthStatement",
                    success: function(data) {
                        if (data.code != 0) {
                            if (data.code == 12) {
                                alert(data.message);
                                top.location.href = "../index.html";
                            } else {
                                alert(data.message);
                            }
                        } else {
                            layer.open({
                                type: 2,
                                area: ["70%", "90%"],
                                title: "查看推送的教案",
                                closeBtn: 1,
                                content: "./pushedJiaoAn.html",
                                anmi: 2
                            })
                        }
                    }
                })

                break;
            case "homework":
                var courseNumber = obj.data.number;
                layer.open({
                    type: 2,
                    area: ["80%", "80%"],
                    title: "作业列表",
                    closeBtn: 1,
                    content: "./problem/homeworkListTea.html?courseNumber=" + courseNumber,
                    anmi: 2
                });
                // window.open('./problem/homeworkListTea.html?courseNumber='+courseNumber, '_balnk');
        }
    });

    function start_live(teacherName, meetingID, welcomeMsg, description, title) {
        $.ajax({
            type: "post",
            url: "../../btest/start_helper.jsp",
            //url: "./bbb/start_helper.jsp",
            data: {
                "username": teacherName,
                "meetingID": meetingID,
                "welcomeMsg": welcomeMsg,
                "description": description,
                "title": title
            },
            // dataType: "xml",
            //processData: false,   // jQuery不要去处理发送的数据
            // contentType: false,
            success: function(xml) {
                response = $.xml2json(xml);

                var joinURL = response.joinURL;
                var inviteURL = response.inviteURL; //会议邀请码
                window.open(joinURL); //在新窗口打开

                // alert(inviteURL);
                // console.log(joinURL);

                // var username = response.username;
                // var meetingID = response.meetingID;
                //
                // console.log(username);
                // console.log(meetingID);

                // window.location.href = joinURL; //在本窗口打开

            },
            error: function(e) {
                alert("failed to connect to API");
            }
        });
    }
});