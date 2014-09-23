var rain = (function() {

    var MAX_STAR_SPEED = 10;
    var TIME_OUT = 5000; //每次下雨的时间
    var RAIN_COUNT = 10; //canvas里一共多少雨滴
    var canvases = {}; //canvas数组缓存
    var MAX_RAIN_SIZE = 50;

    function rainEntrance(obj) {

        var image = obj.image,
            id = obj.id,
            speed = obj.speed || MAX_STAR_SPEED,
            rainCount = obj.num || RAIN_COUNT,
            width = obj.width || 100,
            height = obj.height || 100;

        if (canvases[id]) {


        } else {

            var canvas = document.getElementById(id);

            if (!canvas) return false;

            canvases[id] = {};
            canvases[id].count = 1;
            canvases[id].image = image;
            canvases[id].rains = [];
            canvases[id].startTime = new Date().getTime();
            canvases[id].canvas = canvas;
            canvases[id].context = canvas.getContext('2d');
            canvases[id].speed = speed;
            canvases[id].timer = setInterval(function() {
                render(id); //漂亮！！为interval函数传参
            }, 33); //为每个新来的canvas开启计时器

            for (var i = 0; i < rainCount; ++i) {

                var s = new rain({
                    canvas: canvases[id].canvas,
                    image: canvases[id].image,
                    context: canvases[id].context,
                    speed: canvases[id].speed,
                    width: width,
                    height: height,
                    rainCount: rainCount
                });

                canvases[id].rains.push(s);

            }

        }

    }

    function rain(obj) {
        this.canvas = obj.canvas;
        this.context = obj.context;
        this.image = obj.image;

        this.initWidth = obj.width;
        this.width = rad(20, this.initWidth);
        this.height = (this.width / obj.width) * obj.height;

        this.speed = rad(obj.speed / 2, obj.speed);

        this.x = rad(this.canvas.width);
        this.y = 0;

        this.vy = this.speed * this.width / this.initWidth;

    }

    rain.prototype.reset = function() {

        this.x = rad(this.canvas.width);
        this.y = 0;
        this.vy = this.speed * this.width / this.initWidth;
        //this.width = rad(20, this.initWidth);
        //this.height = (this.width/obj.width) * obj.height;

    }

    rain.prototype.move = function() {

        this.y = this.y + this.vy;

        if (this.x <= 0 || this.x >= this.canvas.width || this.y <= 0 || this.y >= this.canvas.height) {

            this.reset();

        }

        // this.context.drawImage(this.image, this.x, this.y, this.width * this.size, this.height * this.size);
        this.context.drawImage(this.image, this.x, this.y, this.width, this.height);

    }

    function render(id) {

        var nowTime = new Date().getTime();

        if (canvases[id]) {

            var canvas = canvases[id];

            canvas.context.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

            if (nowTime - canvas.startTime > TIME_OUT) {

                if (canvas.timer) {

                    clearInterval(canvas.timer); //及时清理计时器

                }

                canvases[id] = null;
                delete canvas;

                return false;

            }

            for (var j = 0, lg = canvas.rains.length; j < lg; ++j) {

                canvas.rains[j].move();

            }

        }


    }

    function isNullObj(obj) {

        var y = true;

        for (var i in obj) {
            if (obj[i]) {
                y = false;
            }
        }

        return y;

    }


    function rad(n, m) {

        if (m) {
            var c = m - n;
            return (Math.random() * c + n);
        } else {
            return (Math.random() * n);
        }


    }


    return rainEntrance;

})();