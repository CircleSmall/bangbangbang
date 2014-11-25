define(function(require, exports) {

    require('common');

    var baseServer = require('server');

    /*服务器端口*/
    var server = baseServer.index;

    function translated(data, callback) {

        $.J_xhr(server.translated, data, function(data) {
            //回调函数
            var result = $.J_json.parse(data);
            callback && callback(result);
        })

    }

    function getPercent(data, callback) {

        $.J_xhr(server.getPercent, data, function(data) {
            //回调函数
            var result = $.J_json.parse(data);
            callback && callback(result);
        })

    }

    function exportorigin(data, callback) {

        $.J_xhr(server.exportorigin, data, function(data) {
            //回调函数
            var result = $.J_json.parse(data);
            callback && callback(result);
        })

    }

    function exportresult(data, callback) {

        $.J_xhr(server.exportresult, data, function(data) {
            //回调函数
            var result = $.J_json.parse(data);
            callback && callback(result);
        })

    }

    function exportbi(data, callback) {

        $.J_xhr(server.exportbi, data, function(data) {
            //回调函数
            var result = $.J_json.parse(data);
            callback && callback(result);
        })

    }

    return {
        translated: translated,
        getPercent: getPercent,
        exportorigin: exportorigin,
        exportresult: exportresult,
        exportbi: exportbi
    }

})
