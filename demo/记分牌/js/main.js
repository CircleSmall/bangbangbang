// (function() {

/*canvas设置*/
var imageB = document.createElement('img');
imageB.src = "img/dai2.png";
var imageBian = document.createElement('img');
imageBian.src = "img/bian.png";
var imgYuanbao = document.createElement('img');
imgYuanbao.src = "img/yuanbao.png";

var canvas1 = document.getElementById('c1');

var canvas2 = document.getElementById('c2');

// gravityBall([{
// 	canvas: canvas1,
// 	img: imageB,
// }, {
// 	canvas: canvas2,
// 	img: imageB
// }]);

/*计分*/
$('.count span').on('click', function(evnet) {

	var ele = $(this).parents('.team').children('.score');

	var score = parseInt(ele.html()) + parseInt($(this).html());

	ele.html(filterNum(score));

	switch ($(this).html()) {
		case '+50':
			rain({
				id: filterObj($(this)),
				image: imgYuanbao,
				speed: 5,
				num: 10,
				width: 40,
				height: 22
			});
			break;
		case '+500':
			rain({
				id: filterObj($(this)),
				image: imgYuanbao,
				speed: 15,
				num: 20,
				width: 40,
				height: 22
			});
			break;
		case '+1000':
			rain({
				id: filterObj($(this)),
				image: imgYuanbao,
				speed: 20,
				num: 30,
				width: 40,
				height: 22
			});
			break;
		case '-50':
			rain({
				id: filterObj($(this)),
				image: imageBian,
				speed: 5,
				num: 10,
				width: 30,
				height: 25
			});
			break;
		case '-500':
			rain({
				id: filterObj($(this)),
				image: imageBian,
				speed: 15,
				num: 40,
				width: 30,
				height: 25
			});
			break;
		case '-1000':
			rain({
				id: filterObj($(this)),
				image: imageBian,
				speed: 40,
				num: 30,
				width: 30,
				height: 25
			});
			break;


	}

})

function filterObj(obj) {
	var c = obj.parents('.count').attr('rel');
	return c;
}

function filterNum(num) {
	var num = parseInt(num);
	if (num > 9999) {
		num = 9999;
	} else if (num < 0) {
		num = 0000;
	}
	return num;
}

/*
 *计时器的实现
 */
var timerEle = $('.timer');
var poor = 0;
var timer;

timerEle.find('.start').on('click', function() {

	if ($(this).attr('rel') == "start") {
		currentTime = new Date().getTime();

		timer = setInterval(function() {

			poor++;

			updateTime(poor);

		}, 1000)

		$(this).attr('rel', 'end');
		$(this).html('结束');

	} else {

		clearInterval(timer);
		$(this).attr('rel', 'start');
		$(this).html('开始');

	}


})

timerEle.find('.reset').on('click', function() {

	clearInterval(timer);
	poor = 0;
	updateTime(0);
	$(timerEle.find('.start')).attr('rel', 'start');
	$(timerEle.find('.start')).html('开始');

})

//更新计时器时间
function updateTime(poor) {

	var hourEle = timerEle.find('.hour'),
		minuteEle = timerEle.find('.minute'),
		secondEle = timerEle.find('.second');


	var hours = Math.floor(poor / (60 * 60)),
		minute = Math.floor(poor / (60)),
		second = poor;

	hours = changeTime(hours);
	minute = changeTime(minute);
	second = changeTime(second);

	hourEle.html(hours);
	minuteEle.html(minute);
	secondEle.html(second);

}

function changeTime(x) {

	x = parseInt(x) % 60;

	if (parseInt(x) < 10) {

		x = '0' + x.toString();

	}

	return x;
}


// })()