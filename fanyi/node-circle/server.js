var server = function(contents) {
    this.contents = contents;
    this.port = "1314";
    this.init();
}

server.prototype.init = function() {
    this.initserver();
    this.initclient();
}

server.prototype.initserver = function() {
    var sv = new http.Server();
    sv.on('error', function(err) {
        console.log(err);
    });
    sv.listen(this.port, function(err) {
        if (err) {
            console.log(err);
        }
    });
    sv.on('request', function(request, response) {
        request.on('data', function() {});
        request.on('end', function() {
            var script = fis.util.fs.readFileSync('./livereload.js');
            res.writeHead(200, {
                'Content-Length': script.length,
                'Content-Type': 'text/javascript',
                'Connection': 'close'
            });
            res.end(script);
        });
    });
}

server.prototype.initclient = function() {

    var options = {
        hostname: '127.0.0.1',
        port: "1314",
        path: '',
        method: 'POST'
    };

    var req = http.request(options, function(res) {
        var status = res.statusCode;
        var body = '';
        res
            .on('data', function(chunk) {
                body += chunk;
            })
            .on('end', function() {
                if (status >= 200 && status < 300 || status === 304) {} else {}
            })
            .on('error', function(err) {
                console.log(err)
            });
    });

    var lists = this.contents;
    for (var l in lists) {
        req.write(lists[l]);
    }
    req.end();
}

return server;