function createIframe(){
    var iframe = document.createElement('iframe');
}
function createDiv(){
    var iframe = document.createElement('div');
}
function times(callback, l) {
    var length = l || 100;
    for(var i = 0 ; i < length ; i++) {
        callback && callback()
    }
}
console.time("创建10000个iframe所花费的时间");
times(createIframe,10000);
console.timeEnd("创建10000个iframe所花费的时间");

console.time("创建10000个div所花费的时间");
times(createDiv,10000);
console.timeEnd("创建10000个div所花费的时间");