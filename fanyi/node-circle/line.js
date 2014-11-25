var fs = require('fs');
var stream = require('stream')
var liner = new stream.Transform({
    objectMode: true
})

liner._transform = function(chunk, encoding, done) {
    var data = chunk.toString()
    if (this._lastLineData) data = this._lastLineData + data

    var lines = data.split('\n')
    this._lastLineData = lines.splice(lines.length - 1, 1)[0]

    lines.forEach(this.push.bind(this))
    done()
}

liner._flush = function(done) {
    if (this._lastLineData) this.push(this._lastLineData)
    this._lastLineData = null
    done()
}


function start(path, callback, complete) {
    var source = fs.createReadStream(path);
    source.pipe(liner);
    liner.on('readable', function() {
        var line
        while (line = liner.read()) {
            callback && callback(line)
        }
    })
    liner.on('end', function() {
        complete && complete();
    })
}

module.exports = start;