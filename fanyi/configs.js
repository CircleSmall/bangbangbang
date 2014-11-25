/**
 * @describe: 所有相关配置
 */
(function (window, undefined) {
    var allConfigs = {
        /**
         * commonJS 和 nodejs 都可以加载此模块
         *  lib/jquery
         * -------- begin -----------*/
        //别名
        "alias": {
            "jquery": "lib/jquery",
            "backbone": "lib/backbone",
            "jsonselect": "lib/jsonselect",
            "underscore": "lib/underscore",
            "mustache": "lib/mustache",
            "server": "js/server/server",
            "common": "js/common/common"
        },
        //设置路径，方便跨目录调用
        "paths": {
            // "render": "src/scripts/render",
            // "router": "src/scripts/router",
            // "frame": "src/scripts/frame",
            // "utils": "src/scripts/utils"
        },
        /**
         * 打包模块, 可设置多个
         * path 是要打包文件的入口模块路径
         * name 是输出文件名称
         * -------- begin -----------*/
        "packModules": [
            {"path": "js/index/main", "name": "business"}
        ],

        //入口html
        "entry": ["fanyi.html"], 
        "debug": true,
        "base": "./", //请保证修改好此端口后，修改 http.port
        /* --------end-----------*/
    };

    if (typeof module !== 'undefined' && module.exports !== 'undefined') {
        module.exports = allConfigs;
    } else if (typeof define === 'function') {
        define(function () {
            return  allConfigs;
        });
    }
})(this);
