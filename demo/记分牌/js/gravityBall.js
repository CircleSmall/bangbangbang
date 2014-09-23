var gravityBall = (function() {
    /*
     *重力球插件
     *传入参数：数组或对象
     *元素：canvas，img,left(距页面左端的高度)，top(距离页面顶部的高度)
     */

    var particles = [],
        allContext = [];

    var gravityBall = function(totalArr) {

        if (totalArr.constructor === Array) {
            //为参数为数组的情况
            for (var i = 0, l = totalArr.length; i < l; i++) {
                new item(totalArr[i]);
            }
        } else {
            //参数为对象
            new item(totalArr);
        }

    };


    function item(obj) {

        this.canvas = obj.canvas;
        this.img = obj.img;
        this.context = this.canvas.getContext('2d');
        this.left = obj.left || getPos(this.canvas).x;
        this.top = obj.top || getPos(this.canvas).y;

        allContext.push({
            context: this.context,
            canvas: this.canvas
        });

        this.ballData = {
            canvas: this.canvas,
            img: this.img,
            context: this.context,
            left: this.left,
            top: this.top
        }

        this.init();

    };
    
    //获取dom元素相对于屏幕的距离
    function getPos(ele){
    
        var pos = { x:null, y:null }
        var offsetParent = ele.offsetParent;

        while (offsetParent) {

            pos.x += ele.offsetLeft;
            pos.y += ele.offsetTop;

            ele = ele.offsetParent;
            offsetParent = ele.offsetParent;
            //if(offsetParent==document.body)
            //return pos;
            //只有body没有offsetParent，body已经是顶级元素了   

        }

        return pos; 
    }


    item.prototype.init = function() {

        var canvas = this.canvas,
            ballData = this.ballData,
            throwBall = this.throwBall;


        canvas.addEventListener('click', function(event) {

            throwBall(event.clientX, event.clientY, ballData);

        }, false);

        canvas.addEventListener('mousedown', function(event) {

            event.preventDefault();

            document.addEventListener('mousemove', onMouseMove, false);

        }, false);

        canvas.addEventListener('mouseup', function(event) {

            event.preventDefault();

            throwBall(event.clientX, event.clientY, ballData);

            document.removeEventListener('mousemove', onMouseMove, false);

        }, false);

        function onMouseMove(event) {

            event.preventDefault();

            throwBall(event.clientX, event.clientY, ballData);

        };
    }

    item.prototype.throwBall = function(x, y, ballData) {

        // console.log(particles.length);
        var particle = new Particle({
            x: x,
            y: y,
            context: ballData.context,
            image: ballData.img,
            sx: Math.floor(Math.random() * 6 - 3) * 2,
            sy: -Math.random() * 16, //sy控制下落的速度和方向
            canvas: ballData.canvas,
            left: ballData.left,
            top: ballData.top
        });
        // console.log(particle);
        particles.push(particle);
        // console.log(particles.length)
    }


    var Particle = function(obj) {

        if (obj.sx === 0) obj.sx = 2;

        //初始化属性
        this.clientX = obj.x;
        this.clientY = obj.y;
        this.sx = obj.sx;
        this.sy = obj.sy;
        this.image = obj.image;
        this.context = obj.context;
        this.canvas = obj.canvas;
        this.left = obj.left || 0;
        this.top = obj.top || 0;

        this.width = 30,
        this.height = 30,
        this.widthhalf = this.width / 2;
        this.heighthalf = this.height / 2;


        if (document.documentElement) {
            x1 = document.documentElement.scrollLeft || 0;
            y1 = document.documentElement.scrollTop || 0;
        }

        if (document.body) {
            x2 = document.body.scrollLeft || 0;
            y2 = document.body.scrollTop || 0;
        }

        var x3 = window.scrollX || 0;
        var y3 = window.scrollY || 0;

        // 滚动条到页面顶部的水平距离
        var xLevel = Math.max(x1, Math.max(x2, x3));

        // 滚动条到页面顶部的垂直距离
        var yVertical = Math.max(y1, Math.max(y2, y3));

        //极端出相对布局的x\y的值
        this.x = this.clientX - this.left + xLevel;
        this.y = this.clientY - this.top + yVertical;

        //创建对象
        // this.context.drawImage(this.image, Math.floor(this.x - this.widthhalf - this.left), Math.floor(this.y - this.heighthalf - this.top), this.width, this.height);
        this.move();
    }

    Particle.prototype.move = function() {

        this.x += this.sx;
        this.y += this.sy;

        if (this.x < (-this.widthhalf) || this.y > (this.canvas.width + this.widthhalf)) {

            var index = particles.indexOf(this);

            particles.splice(index, 1);

            return false;

        }

        if (this.y > this.canvas.height - this.heighthalf) {

            this.y = this.canvas.height - this.heighthalf;
            this.sy = -this.sy * 0.85;

        }

        this.sy += 0.98;

        //创建对象
        this.context.drawImage(this.image, Math.floor(this.x - this.widthhalf), Math.floor(this.y - this.heighthalf), this.width, this.height);

        return true;
    };

    setInterval(function() {

        for (var i = 0, l = allContext.length; i < l; i++) {

            allContext[i].context.clearRect(0, 0, allContext[i].canvas.width, allContext[i].canvas.height);

        }

        var i = 0,
            l = particles.length;

        while (i < l) {

            particles[i].move() ? i++ : l--;

        }

    }, 1000 / 60);

    return gravityBall;

})()