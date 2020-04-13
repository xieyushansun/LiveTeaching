var teacherCourse = []; //获取教师对应的课程
var courseStr = ""; //将课程转为字符串
$.ajax({
    type: "get",
    async: false,
    dataType: "json",
    url: "../login/getCurrentUser",
    success: function (data) {
        currentUserNumber = data.body.number; //获取当前登录用户的id，通过id查找当前用户所下属的课程
        var d = {"teacherNumber": currentUserNumber, "page": 1, "limit": 5};
        $.ajax({
            type: "get",
            async: false,
            data: d,  //不需要JSON.stringfy(d)
            dataType: "json",
            url: "../course/getByTeacherNumber",
            success: function (data) {
                if (data.code === 0){
                    for (var i = 0; i < data.body.content.length; i++){
                        teacherCourse.push(data.body.content[i].name+" ("+data.body.content[i].number+")");
                        // alert(data.body.content[i].number);
                    }
                }else{
                    let layer = layui.layer;
                    layer.alert(data.message);
                }

            }
        });
    }
});

var homeworkorpractice_Radio = "homework"; //默认单选框选中homework
var table = layui.table;
var form = layui.form;
var util = layui.util;
form.on('radio(homeworkorpractice)', function(data){
    homeworkorpractice_Radio = data.value; //单选框选择作业或者练习
    // $("#homeworkOrPractice").val(homeworkorpractice_Radio);
    if (homeworkorpractice_Radio === "homework"){
        table.render({
            elem: '#demo'
            ,height: "auto"
            ,method: "post"
            // ,count: totalElements
            ,url: "../problem/findHomework"
            ,page: {
                layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
                limits: [10, 15]
                // limits: [10, 15],
                // limit: 5
            }
            ,skin: 'nob' //行边框风格
            ,cols: [[
                // {type: 'checkbox', fixed: 'left'}
                {field:'id', title:'编号', width: 250, sort: true}
                ,{field:'title' , title:'题集标题', width: 400, templet: '#switchTpl', unresize: true }
                ,{field:'startTime' , title:'开始时间', minWidth: 250, templet: function (e) {
                        var unixtime = util.toDateString(e.startTime, 'yyyy-MM-dd HH:mm:ss');
                        return unixtime;
                    }}
                ,{field:'deadline' , title:'截止时间', minWidth: 250, templet: function (e) {
                        var unixtime = util.toDateString(e.deadline, 'yyyy-MM-dd HH:mm:ss');
                        return unixtime;
                    }}
                ,{fixed: 'right', title:'操作', width: 300, align:'center', toolbar: '#barDemo'}
            ]]
            ,parseData: function(res) {
                return {
                    "code": res.code,
                    "msg": res.message,
                    "data": res.body.content,
                    "count": res.body.totalElements
                }
            }
        });
    }else if (homeworkorpractice_Radio === "practice"){
        table.render({
            elem: '#demo'
            ,height: "auto"
            ,method: "post"
            // ,count: totalElements
            ,url: "../problem/findPractice"
            ,page: {
                layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
                limits: [10, 15]
                // limits: [10, 15],
                // limit: 5
            }
            ,skin: 'nob' //行边框风格
            ,cols: [[
                // {type: 'checkbox', fixed: 'left'}
                {field:'id', title:'编号', sort: true}
                ,{field:'title' , title:'题集标题', minWidth: 220, templet: '#switchTpl', unresize: true }
                ,{fixed: 'right', width: 300, align:'center', toolbar: '#barDemo'}
            ]]
            ,parseData: function(res) {
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
form.render();
table.render({
    elem: '#demo'
    ,height: "auto"
    ,method: "post"
    // ,count: totalElements
    ,url: "../problem/findHomework"
    ,page: {
        layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
        limits: [10, 15]
        // limits: [10, 15],
        // limit: 5
    }
    ,skin: 'nob' //行边框风格
    ,cols: [[
        // {type: 'checkbox', fixed: 'left'}
        {field:'id', title:'编号', width: 250, sort: true}
        ,{field:'title' , title:'题集标题', minWidth: 400, templet: '#switchTpl', unresize: true }
        ,{field:'startTime' , title:'开始时间', minWidth: 250, templet: function (e) {
                var unixtime = util.toDateString(e.startTime, 'yyyy-MM-dd HH:mm:ss');
                return unixtime;
            }}
        ,{field:'deadline' , title:'截止时间', minWidth: 250, templet: function (e) {
                var unixtime = util.toDateString(e.deadline, 'yyyy-MM-dd HH:mm:ss');
                return unixtime;
            }}
        ,{fixed: 'right', title:'操作', width: 300, align:'center', toolbar: '#barDemo'}
    ]]
    ,parseData: function(res) {
        return {
            "code": res.code,
            "msg": res.message,
            "data": res.body.content,
            "count": res.body.totalElements
        }
    }
});

//监听行工具事件
table.on('tool(test)', function(obj){  //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
    var data = obj.data; //获得当前行数据
    var layEvent = obj.event; //获得 lay-event 对应的值
    if(layEvent === 'assign'){   //给班级布置作业
        var courseStr = "";

        for (var i = 0; i < teacherCourse.length; i++){
            // teacherCourse[i] += "%"; //每个课程以%结尾，方便后续split开
            courseStr += teacherCourse[i] + "%";
        }
        layui.use(['layer'], function(){
            $("#teachercourse").val(courseStr); //将所有课程以字符串形式放入该页面一个隐藏输入框，方便弹出框页面取值
            $("#choosedproblemid").val(data.id);
            let layer = layui.layer;
            layer.open({
                type : 2,
                title : '布置'+' —— 题集名称：'+data.title,
                area : [ '500px', '600px' ],
                fix : false,
                content : './assignHomeworkOrPracticeWindow.html',
                maxmin: true,
                btn: ['确认选择', '关闭'],
                yes: function(index, layero){
                    let allInfo = window["layui-layer-iframe" + index].callbackdata();
                    layer.close(index);
                    let classNum = [];
                    let classInfo = allInfo['classInfo']; //班级信息
                    for (let k = 0; k < classInfo.length; k++){
                        classNum[k] = classInfo[k].split("(")[1]
                        classNum[k] = classNum[k].substring(0,classNum[k].length-1);
                    }
                    // console.log(classInfo);
                    // classInfo = classInfo.substring(0,classInfo.length-1);
                    // let classNum = classInfo.split("(")[1];
                    //向后台传递数据

                    for (let k = 0; k < classNum.length; k++){
                        let postData = {"problemSetId":data.id, "courseNumber":classNum[k]};
                        console.log("sdf");
                        $.ajax({
                            type: "post",
                            async: false,
                            dataType: "json",
                            data: postData,
                            url: "../problem/assignHomework",
                            success: function (data) {
                                if (k === classNum.length-1){
                                    alert(data.message); //布置成功
                                }
                            }
                        });
                    }
                }, btn2: function(index, layero){
                    layer.close(index);
                }
            });
        });
    } else if(layEvent === 'hORPDetail'){ //作业或练习对应的具体题目
        $("#id").val(data.id);
        $("#homeworkOrPractice").val(homeworkorpractice_Radio);
        layer.open({
            type : 2,
            title : '作业/练习题目详情',
            area : [ '650px', '620px' ],
            fix : false,
            content : 'hORPDetailWindow.html',
            maxmin: true,
            btn: ['关闭'],
            btn1: function(index, layero){
                layer.close(index);
            }
        });
    }else if (layEvent === 'assignDetail'){ //已布置给哪些班级
        $("#id").val(data.id);
        layer.open({
            type : 2,
            title : '作业/练习题目详情',
            area : [ '650px', '620px' ],
            fix : false,
            content : 'assignDetailWindow.html',
            maxmin: true,
            btn: ['关闭'],
            btn1: function(index, layero){
                layer.close(index);
            }
        });
    }else if (layEvent === 'delete'){ //删除该题集
        layer.confirm('真的删除行么', function(index){
            obj.del(); //删除对应行（tr）的DOM结构
            layer.close(index);
            data = {"id": data.id}; //传递id
            $.ajax({
                type: "post",
                async:false,
                dataType: "json",
                data: data,
                url: "../problem/deleteHomeworkOrPractice",
                success: function (data) {
                    // currentUserNumber = data.body.number; //获取当前登录用户
                    alert(data.message);
                }
            });
        });
    }
});

$("#find").click(function () {
    var keyword = document.getElementById("keyword").value; //输入框中关键字
    if (homeworkorpractice_Radio === "homework"){
        var table = layui.table;
        table.render({
            elem: '#demo'
            ,height: "auto"
            ,method: "post"
            // ,count: totalElements
            ,url: "../problem/findHomework"
            ,where:{"value": keyword}
            ,page: {
                layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
                limits: [10, 15]
                // limits: [10, 15],
                // limit: 5
            }
            ,skin: 'nob' //行边框风格
            ,cols: [[
                // {type: 'checkbox', fixed: 'left'}
                {field:'id', title:'编号', sort: true}
                ,{field:'title' , title:'题集标题', minWidth: 220, templet: '#switchTpl', unresize: true }
                ,{field:'startTime' , title:'开始时间', minWidth: 220, templet: '#switchTpl', unresize: true }
                ,{field:'deadline' , title:'截止时间', minWidth: 220, templet: '#switchTpl', unresize: true }
                ,{fixed: 'right', title:'操作', width: 300, align:'center', toolbar: '#barDemo'}
            ]]
            ,parseData: function(res) {
                return {
                    "code": res.code,
                    "msg": res.message,
                    "data": res.body.content,
                    "count": res.body.totalElements
                }
            }
        });
    }else if (homeworkorpractice_Radio === "practice"){
        layui.table.render({
            elem: '#demo'
            ,height: "auto"
            ,method: "post"
            // ,count: totalElements
            ,url: "../problem/findPractice"
            ,where:{"value": keyword}
            ,page: {
                layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
                limits: [10, 15]
                // limits: [10, 15],
                // limit: 5
            }
            ,skin: 'nob' //行边框风格
            ,cols: [[
                // {type: 'checkbox', fixed: 'left'}
                {field:'id', title:'编号', sort: true}
                ,{field:'title' , title:'题集标题', minWidth: 220, templet: '#switchTpl', unresize: true }
                ,{fixed: 'right', title:'操作', width: 300, align:'center', toolbar: '#barDemo'}
            ]]
            ,parseData: function(res) {
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
