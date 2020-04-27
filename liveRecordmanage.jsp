<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    request.setCharacterEncoding("UTF-8");
    response.setCharacterEncoding("UTF-8");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>测试管理直播回放页面</title>
    <script src="js/jquery.min.js"></script>
    <script src="js/xml2json.js" type="text/javascript"></script>
    <link rel="stylesheet" href="layui/css/layui.css" media="all">

</head>
<body>
<%--<button type="button" onclick="create()" class="layui-btn" style="margin:20px 100px;">创建</button>--%>
<table id = "demo"  lay-filter = "test"></table>
<script type="text/html" id="barDemo">
    <a class="layui-btn  layui-btn-normal layui-btn-xs" lay-event="delete">删除</a>
    <a class="layui-btn  layui-btn-normal layui-btn-xs" lay-event="publish">发布</a>
    <a class="layui-btn  layui-btn-normal layui-btn-xs" lay-event="unpublish">取消发布</a>
    <!--    <a class="layui-btn layui-btn-xs" lay-event="hORPDetail">题集详情</a>-->
</script>
<script src="layui/layui.js"></script>
<script>
    var currenttableData = [];
    var afterUrl =  window.location.search.substring(1);
    var meetingID = afterUrl.substr(afterUrl.indexOf('=')+1);

    layui.use(['layer', 'table'], function() {
        var layer = layui.layer;
        var table = layui.table;
        table.render({
            elem: '#demo'
            ,height: "auto"
            ,method: "get"
            // ,count: totalElements
            ,data: []  //{"title":"随机过程","teachername":"谢雨杉"}, {"title":"组合数学","teachername":"李彦"}
            //,url: "demo10_helper.jsp?command=getRecords&meetingID="+meetingID
            ,page: {
                layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
                limits: [10, 15]
                // limits: [10, 15],
                // limit: 5
            }
            // ,where:{"value": keyword}
            ,skin: 'nob' //行边框风格
            ,cols: [[
                // {type: 'checkbox', fixed: 'left'}
                {field:'name', title:'课程名称', width: "15%", sort: true}
                ,{field:'description' , title:'课程描述', width: "25%"}
                ,{field:'startTime' , title:'录制日期', width: "15%"}
                ,{field:'published' , title:'是否发布', width: "10%", templet: function(d) {
                    if (d.published === "true")
                        return "已发布";
                    else
                        return "未发布";
                }}
                ,{field:'playback' , title:'回放', width: "10%", templet: function(d) {
                    return "<a class='layui-btn layui-btn-xs' href='" + d.playback + "' target='_blank'>查看回放</a>"
                }}                ,{field:'length' , title:'长度', width: "5%"}
                ,{title:'操作', width: "20%", align:'center', toolbar: '#barDemo'}
            ]]
            ,id: 'recordTable'
            // ,parseData: function(response) {
            //     var res = $.xml2json(xml);
            //     alert(res);
            //     return {
            //         "Course": res.recordings.recording.name,
            //         "Description": res.recordings.recording.description,
            //         "Date Recorded": res.recordings.recording.startTime,
            //         "Published": res.recordings.recording.published,
            //         "Playback": res.recordings.recording.playback,
            //         "Length": res.recordings.recording.length//单位：分钟
            //     }
            // }
        });

        $.ajax({
            type: "get",
            url: "demo10_helper.jsp?command=getRecords&meetingID="+meetingID,
            dataType: "xml",
            //processData: false,   // jQuery不要去处理发送的数据
            // contentType: false,
            success: function(xml){
                var x2js = new X2JS();

                var response = x2js.xml2json(xml);
				  var recording = response.recordings.recording;
				  var data = (recording instanceof Array) ? recording : [recording];
                table.reload('recordTable', {
                    data: data
                });
                // var joinURL = response.joinURL;
                // var inviteURL = response.inviteURL; //会议邀请码
                // window.open(joinURL); //在新窗口打开

                // alert(inviteURL);
                // console.log(joinURL);

                // var username = response.username;
                // var meetingID = response.meetingID;
                //
                // console.log(username);
                // console.log(meetingID);

                // window.location.href = joinURL; //在本窗口打开

            },
            error: function (e) {
                alert("failed to connect to API");
            }
        });

        function sendRecordingAction(recordID,action){
            $.ajax({
                type: "GET",
                url: 'demo10_helper.jsp',
                data: "command="+action+"&recordID="+recordID,
                dataType: "xml",
                cache: false,
                success: function(xml) {
                    window.location.reload(true);
                    $("#recordgrid").trigger("reloadGrid");
                },
                error: function() {
                    alert("Failed to connect to API.");
                }
            });
        }

        table.on('tool(test)', function (obj) { //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
            var data = obj.data //获得当前行数据
            var action = obj.event; //获得 lay-event 对应的值
            if (action === 'delete'){
                var answer = confirm ("真的要删除该回放吗？");
                if (!answer){
                    return;
                }
            }
            var recordID = data.recordID;
            sendRecordingAction(recordID,action);
            // if (layEvent === 'delete') {
                // var teachername = obj.data.teachername;
                // var meetingID = obj.data.meetingID;
                //
                // $.ajax({
                //     type: "post",
                //     url: "./start_helper.jsp",
                //     data: {"username": teachername, "meetingID": meetingID},
                //     // dataType: "xml",
                //     //processData: false,   // jQuery不要去处理发送的数据
                //     // contentType: false,
                //     success: function(xml){
                //         response = $.xml2json(xml);
                //
                //         var joinURL = response.joinURL;
                //         var inviteURL = response.inviteURL; //会议邀请码
                //         window.open(joinURL); //在新窗口打开
                //
                //         // alert(inviteURL);
                //         // console.log(joinURL);
                //
                //         // var username = response.username;
                //         // var meetingID = response.meetingID;
                //         //
                //         // console.log(username);
                //         // console.log(meetingID);
                //
                //         // window.location.href = joinURL; //在本窗口打开
                //
                //     },
                //     error: function (e) {
                //         alert("failed to connect to API");
                //     }
                // });
                // layer.confirm('真的删除行么', function (index) {
                //     obj.del(); //删除对应行（tr）的DOM结构
                //     let n = currenttableData.indexOf(obj.data);
                //     currenttableData.splice(n, 1);
                //     // console.log(obj.data.name);
                //     layer.close(index);
                //     // //向服务端发送删除指令 //不必，最后生成的时候再发送最终结果
                //     // var oldData =  table.cache["demo2"];
                //     table.reload('demo2', {
                //         data: currenttableData
                //     });
                // });
                <%--alert(obj.data.title);--%>
                <%--window.location.href="<%=joinURL%>";--%>
                <%--<a href="<%=joinURL%>">Start Meeting</a>--%>
            // }
        });
    });

</script>

</body>
<%@ include file="bbb_api.jsp"%>
<%@ page import="java.util.regex.*"%>
<%@ page import="org.apache.commons.lang.StringEscapeUtils"%>
</html>