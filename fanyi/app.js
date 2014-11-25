var path = require('path');
var cssmin = require('cssmin');
var fs = require('fs');

var cmd = process.cwd();
var config = require("./configs");
var _ = require('./node-circle/base/utils.js');
var log = require('./node-circle/base/log.js');
var line = require('./node-circle/line.js');


config.packModules.forEach(function(packModule) {
    require('jspacker').pack(
        path.resolve(cmd, packModule.path),
        cmd + "/dist",
        packModule.name,
        cmd,
        config
    );
});

//解析入口html
config.entry.forEach(function(entryfile) {
    var output = "";
    var cssoutput = "";
    var styleobj = {};
    var script = false;
    var content = line(cmd + "\\" + entryfile, function(data) {
        var s = data;
        if (s.indexOf('<link') >= 0 && s.indexOf('stylesheet') >= 0) {
            var href = /href="([^\'\"]+)/g.exec(s)[1];
            styleobj[href] = true;
        } else if (s.indexOf('<script') >= 0) {
            script = true;
            if (s.indexOf('</script>') >= 0) {
                script = false;
            }
        } else if (s.indexOf('</script>') >= 0) {
            script = false;
        } else {
            if (s.indexOf('</head>') >= 0) {
                var style = "";
                for (var j in styleobj) {
                    if (styleobj[j]) {
                        style = style + _.read(path.resolve(cmd, j)).toString();
                    }
                }
                cssoutput = cssmin(style);
                _.write(path.resolve(cmd, "debug_" + "index.css"), cssoutput);
                output = output + "<link rel='stylesheet' href='" + "debug_index.css" + "'  />" + "\n";
            }

            if(s.indexOf('</body>') >= 0) {
                output = output + '<script type="text/javascript" data-main="/js/index/main" src="' + 'dist/business-min.js' + '"></script>' + '\n';
            }

            if(!script) {
                output = output + s;
            }

        }

    }, function() {
        _.write(path.resolve(cmd, "debug_" + entryfile), output);
    });
});