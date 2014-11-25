define(function(require, exports) {

    var index = require('./index');
    require('common')
    console.log($.J_mustache)
    var captionhtml = $('#captioncomponent').html(); //组件字符串

    $(".table ").on("click", ".caption", function(e) {

        var that = $(this);
        var row = that.parent();
        if (row.attr("caption") !== "done") {
            row.append($.J_mustache.render(captionhtml, {}));
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
        if (that.children('a').attr('data-type') == "sure") {
            //如果是确定
            save(row);
        }
        // return false;
    });

    //保存数据(参数是row)
    function save(row) {
        //保存前先要过滤数据
        var sourceText = row.find('.source p').text();
        var targetText = row.find('.target p').text();
        var sid = row.attr('data-sid');
        var orderID =  row.attr('order-id');

        //发送url保存
        index.translated({
            orderID: orderID,
            sid: sid,
            sourceText: sourceText,
            targetText: targetText,
            editor: 1
        }, function(data) {
            console.log(data)
        });

    }

    //进度控制
    function setProgress(width){
        
    }
    
})
