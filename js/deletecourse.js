var pathData = [];
$(document).ready(function(){
    var option_list = [];
    $.ajax({
        type: "get",
        url: "../node/listDirs",
        async: false,
        success: function (res) {
            if(res.code==12){
                alert(res.message);
                top.location.href="../index.html";
            }else if (res.code == 0) {
                var dirs = res.body;
                if (dirs.length == 0) return;
                option_list = makeOption(dirs);
                changeOption('folderName', option_list);
            }else {
                alert(res.body.message);
            }
        }
    });

    if (option_list.length != 0) {
       $.ajax({
            type: "get",
            url: "../node/listKnowledgeSubdirs",
            data: {"dirName": option_list[0].val},
            async: false,
            success: function (res) {
                if(res.code==12){
                    alert(res.message);
                    top.location.href="../index.html";
                }else if (res.code == 0) {
                    var data = res.body;
                    dataPro(data);
                }else {
                    alert(res.body.message);
                }
            }
        });
    }
});

layui.use(["form", "table", "layer"], function(){
    var form = layui.form;
    var table = layui.table;
    var layer = layui.layer;
    
    table.render({
        elem: "#pathTable",
        data: pathData,
        id: "pathTable",
        cols: [[
            {field: 'path', title: '知识点', width: '60%',sort: true},
            {title:'操作', algin: 'center', toolbar: '#barDemo', width: '40%'},
        ]],
        page: true,
        limits: [10, 20]
    });

    form.on('select(folderName)', function(data) {
        var value = data.value;
        $.ajax({
            type: "get",
            url: "../node/listKnowledgeSubdirs",
            data: {"dirName": value},
            async: false,
            success: function (res){
                if(res.code==12){
                    alert(res.message);
                    top.location.href="../index.html";
                }else if(res.code == 0){
                    var data = res.body;
                    dataPro(data);
                    table.reload('pathTable', {
                        data: pathData
                    });
                }else {
                    alert(res.body.message);
                }
            }
        });
    });
    // operate
    table.on('tool(path)', function(obj){
        var data = obj.data;
        var id = data.id;
        var layEvent = obj.event;
       if ('del' == layEvent) {
            layer.confirm(`确定删除"${data.path}"`, function(index) {
                $.ajax({
                    type: "post",
                    url: " ",
                    data: {id: id},
                    success: function(res) {
                        if(res.code==12){
                            alert(res.message);
                            top.location.href="../index.html";
                        }else if (res.code == 0) {
                            obj.del();
                            layer.close(index);
                        } else {
                            layer.close(index);
                            layer.msg(res.message, {icon: 0, time: 1000});
                        }
                    }
                });
            })
        } 
    });
    $("#searchFile").on('change', function(){
        var searchVal = $(this).val();
        var searchRes = pathData.filter((word) => {return word.path.indexOf(searchVal) != -1});
        table.reload('pathTable', {
            data: searchRes
        });
    });
});

function dataPro(data) {
    pathData = [];
    for (let d of data) {
        pathData.push({path: d});
    }
}

function makeOption(data_list){
    let option_list = [];
    for (let data of data_list){
        option_list.push({"val": data, "text": data});
    }
    return option_list;
}

function changeOption(filter, option_list){
    let selector = "[lay-filter="+filter+"]";
    $(selector).empty();
    if(option_list)
        for(let i = 0, len = option_list.length; i < len; i++){
            var option = $("<option>").val(option_list[i].val).text(option_list[i].text);
            $(selector).append(option);
        }
}

// function getPath() {
//     var checked = layui.table.checkStatus('pathTable');
//     if (checked.data.length == 1) {
//         return checked.data[0].path;
//     } else {
//         parent.layer.msg("请选择一个文件进行绑定", {icon:0, time: 1500});
//         return undefined;
//     }
// }