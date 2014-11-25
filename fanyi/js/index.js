$.J_xhr = function(obj, data, callback) {
    if (!obj.url) {
        console.log('没有合法调用xhr');
    }
    var url = obj.url;
    var para = obj.get || obj.post;
    var paraObj = $.J_urlMerge(para, data);
    var sendStr = JSON.stringify(paraObj);
    //传送的字符串
    if (obj.type) {
        sendStr = obj.type + "=" + sendStr;
    }
    if (obj.get) {
        $.get(url, sendStr, function(returnData) {
            callback && callback(returnData);
        });
    } else if (obj.post) {
        $.post(url, sendStr, function(returnData) {
            callback && callback(returnData);
        });
    } else {
        console.log("请指定一个get 或 post 方法");
    }
}

$.J_urlMerge = function(para, data) {
    var re = {};
    for (var i in data) {
        if (para[i] && para[i] == "?") {
            re[i] = data[i];
        }
    }
    return re;
};


var captionhtml = $('#captioncomponent').html();

$(".table .caption").on("click", "a", function(e) {

    var that = $(this);
    var row = that.parent().parent();
    if (row.attr("caption") !== "done") {
        row.append(Mustache.render(captionhtml, {}));
        row.attr("caption", "done");
    }

    row.children(".captioncomponent").show();

    return false; //阻止事件冒泡和本身
})


$(document).on('click', function(e) {
    $('.captioncomponent').hide();
});

$(document).on("click", ".captioncomponent li", function(e) {
    var that = $(this);
    var row = that.parents('.row');
    if(that.attr('data-type') == "sure") {
        $.J_xhr(urlServer.index.translated, {
            orderID: row.attr('order-id'),
            sid: row.attr('order-id'),
            sourceText: ,
            targetText: ,
            editor: 
        }, function(){

        });
    }
    return false;
});