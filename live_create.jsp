
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    request.setCharacterEncoding("UTF-8");
    response.setCharacterEncoding("UTF-8");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>测试管理页面</title>
    <script src="js/jquery.min.js"></script>
    <script src="js/jquery.xml2json.js" type="text/javascript"></script>
    <link rel="stylesheet" href="./layui/css/layui.css" media="all">

<%--    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">--%>
<%--    <title>测试管理页面</title>--%>
<%--    <link rel="stylesheet" type="text/css" href="css/ui.jqgrid.css" />--%>
<%--    <link rel="stylesheet" type="text/css" href="css/redmond/jquery-ui-redmond.css" />--%>
<%--    <script type="text/javascript" src="js/jquery.min.js"></script>--%>
<%--    <script type="text/javascript" src="js/jquery-ui.js"></script>--%>
<%--    <script type="text/javascript" src="js/jquery.validate.min.js"></script>--%>
<%--    <script src="js/grid.locale-en.js" type="text/javascript"></script>--%>
<%--    <script src="js/jquery.jqGrid.min.js" type="text/javascript"></script>--%>
<%--    <script src="js/jquery.xml2json.js" type="text/javascript"></script>--%>
<%--    <link rel="stylesheet" href="css/layui/css/layui.css" media="all">--%>
</head>
<body>
<button type="button" onclick="create()" class="layui-btn" style="margin:20px 100px;">创建</button>
<table id = "demo"  lay-filter = "test"></table>
<script type="text/html" id="barDemo">
    <a class="layui-btn  layui-btn-normal layui-btn-xs" lay-event="start">开始直播</a>
<!--    <a class="layui-btn layui-btn-xs" lay-event="hORPDetail">题集详情</a>-->
</script>
<script src="./layui/layui.js"></script>
<script>
    function GUID() {
        this.date = new Date(); /* 判断是否初始化过，如果初始化过以下代码，则以下代码将不再执行，实际中只执行一次 */
        if (typeof this.newGUID != 'function') { /* 生成GUID码 */
            GUID.prototype.newGUID = function () {
                this.date = new Date(); var guidStr = '';
                sexadecimalDate = this.hexadecimal(this.getGUIDDate(), 16);
                sexadecimalTime = this.hexadecimal(this.getGUIDTime(), 16);
                for (var i = 0; i < 9; i++) {
                    guidStr += Math.floor(Math.random() * 16).toString(16);
                }
                guidStr += sexadecimalDate;
                guidStr += sexadecimalTime;
                while (guidStr.length < 32) {
                    guidStr += Math.floor(Math.random() * 16).toString(16);
                }
                return this.formatGUID(guidStr);
            }
            /* * 功能：获取当前日期的GUID格式，即8位数的日期：19700101 * 返回值：返回GUID日期格式的字条串 */
            GUID.prototype.getGUIDDate = function () {
                return this.date.getFullYear() + this.addZero(this.date.getMonth() + 1) + this.addZero(this.date.getDay());
            }
            /* * 功能：获取当前时间的GUID格式，即8位数的时间，包括毫秒，毫秒为2位数：12300933 * 返回值：返回GUID日期格式的字条串 */
            GUID.prototype.getGUIDTime = function () {
                return this.addZero(this.date.getHours()) + this.addZero(this.date.getMinutes()) + this.addZero(this.date.getSeconds()) + this.addZero(parseInt(this.date.getMilliseconds() / 10));
            }
            /* * 功能: 为一位数的正整数前面添加0，如果是可以转成非NaN数字的字符串也可以实现 * 参数: 参数表示准备再前面添加0的数字或可以转换成数字的字符串 * 返回值: 如果符合条件，返回添加0后的字条串类型，否则返回自身的字符串 */
            GUID.prototype.addZero = function (num) {
                if (Number(num).toString() != 'NaN' && num >= 0 && num < 10) {
                    return '0' + Math.floor(num);
                } else {
                    return num.toString();
                }
            }
            /* * 功能：将y进制的数值，转换为x进制的数值 * 参数：第1个参数表示欲转换的数值；第2个参数表示欲转换的进制；第3个参数可选，表示当前的进制数，如不写则为10 * 返回值：返回转换后的字符串 */GUID.prototype.hexadecimal = function (num, x, y) {
                if (y != undefined) { return parseInt(num.toString(), y).toString(x); }
                else { return parseInt(num.toString()).toString(x); }
            }
            /* * 功能：格式化32位的字符串为GUID模式的字符串 * 参数：第1个参数表示32位的字符串 * 返回值：标准GUID格式的字符串 */
            GUID.prototype.formatGUID = function (guidStr) {
                var str1 = guidStr.slice(0, 8) + '-', str2 = guidStr.slice(8, 12) + '-', str3 = guidStr.slice(12, 16) + '-', str4 = guidStr.slice(16, 20) + '-', str5 = guidStr.slice(20);
                return str1 + str2 + str3 + str4 + str5;
            }
        }
    }
</script>
<script>
    var currenttableData = [];
    function create() {
        layer.open({
            type: 2,
            title: '直播信息',
            area: ['650px', '250px'],
            fix: false,
            content: './createInfoWindow.html',  //var url = "get1.html?"  + "name=" + name + "&pwd=" + pwd
            maxmin: true,
            btn: ['确认添加', '关闭'],
            yes: function (index, layero) {
                // var allInfo = parent.window["layui-layer-iframe" + index].callbackdata();
                // layer.close(index);
                // var title = allInfo['title']; //题目
                // var teachername = allInfo['teachername']; //内容
                // alert(title);
                layer.close(index);
                var iframeWindow = window[layero.find('iframe')[0]['name']];
                var info = iframeWindow.callbackdata();
                var title = info["title"];
                var teachername = info["teachername"];
                var guid = new GUID();
                var temp = {};
                temp.title = title;
                temp.teachername = teachername;
                temp.meetingID = guid.newGUID();
                // document.getElementById("meetingID").value = temp.meetingID;
                // document.getElementById("teachername").value = teachername;

<%--                <%--%>
<%--//                    meetingID = request.getParameter("meetingID");--%>
<%--//                    username = request.getParameter("teachername");--%>
<%--                        String meetingID = "16ed97c1-0134-3bd3-b7e7-035c48aab54f";--%>
<%--                        String username = "shanshan";--%>

<%--                        //    } else if (request.getParameter("action").equals("create")) {--%>
<%--                    //    //--%>
<%--                    //    // User has requested to create a meeting--%>
<%--                    //    //--%>
<%--                    //--%>
<%--                    ////		String username = request.getParameter("username1");--%>
<%--                    //    String username = "Teacher";--%>
<%--                    //    String meetingID = username + "'s meeting";--%>
<%--                    //--%>
<%--                    //    //--%>
<%--                    //    // This is the URL for to join the meeting as moderator--%>
<%--                    //    //--%>

<%--                        String joinURL = getJoinURL(username, meetingID, "false", "<br>Welcome to %%CONFNAME%%.<br>", null, null);--%>

<%--                    //    其他人加入直播的链接--%>
<%--                    //    String url = BigBlueButtonURL.replace("bigbluebutton/","demo/");--%>
<%--                    //    String inviteURL = url + "create_test.jsp?action=invite&meetingID=" + URLEncoder.encode(meetingID, "UTF-8");--%>
<%--                %>--%>
                currenttableData.push(temp);
                var table = layui.table;
                table.reload('demo', {
                    data: currenttableData
                });

            }, btn2: function (index, layero) {
                layer.close(index);
            }
        });
    }
    layui.use(['layer', 'table'], function() {
        var layer = layui.layer;
        var table = layui.table;
        table.render({
            elem: '#demo'
            ,height: "auto"
            ,method: "post"
            // ,count: totalElements
            ,data: []  //{"title":"随机过程","teachername":"谢雨杉"}, {"title":"组合数学","teachername":"李彦"}
            ,page: {
                layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
                limits: [10, 15]
                // limits: [10, 15],
                // limit: 5
            }
            ,skin: 'nob' //行边框风格
            ,cols: [[
                // {type: 'checkbox', fixed: 'left'}
                {field:'meetingID', title:'编号', width: "20%", sort: true}
                ,{field:'title' , title:'直播标题', width: "30%", templet: '#switchTpl', unresize: true }
                ,{field:'teachername' , title:'教师名称', width: "10%", templet: '#switchTpl', unresize: true }
                ,{field:'inviteurl' , title:'会议邀请码', width: "20%", templet: '#switchTpl', unresize: true }
                ,{fixed: 'right', title:'操作', width: "20%", align:'center', toolbar: '#barDemo'}
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
        table.on('tool(test)', function (obj) { //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
            var data = obj.data //获得当前行数据
                , layEvent = obj.event; //获得 lay-event 对应的值
            if (layEvent === 'start') {
                var teachername = obj.data.teachername;
                var meetingID = obj.data.meetingID;
                $.ajax({
                    type: "post",
                    url: "./start_helper.jsp",
                    data: {"username": teachername, "meetingID": meetingID},
                    // dataType: "xml",
                    //processData: false,   // jQuery不要去处理发送的数据
                    // contentType: false,
                    success: function(xml){
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
                    error: function (e) {
                        alert("failed to connect to API");
                    }
                });


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
            }
        });
    });

</script>

</body>
<%@ include file="bbb_api.jsp"%>
<%@ page import="java.util.regex.*"%>
<%@ page import="org.apache.commons.lang.StringEscapeUtils"%>
</html>