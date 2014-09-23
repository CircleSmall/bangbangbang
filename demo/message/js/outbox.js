var navs = $('#main .outbox_nav li'),
	panelBody = $('.panel-body');

//短信发送的接口
var messageUrl = "",
	templateData = [],
	templateStr = "",
	contactData = {};
checkSession = "server/checkSession.php",
exitUrl = "server/exit.php",
sendMessageUrl = "server/sendMessage.php";

//时间
var currentTime,
	username;

//session检查
$.get(checkSession, function(data) {
	data = JSON.parse(data);
	if (data.status == "success") {
		username = data.username;
		$('#username').html(username);
	} else {
		location.href = "login.html";
	}

});

//退出登录
$('#returnLogin').click(function() {
	$.get(exitUrl, function(data) {
		location.href = "login.html";
	});
});

// navs.click(function() {

// 	changePanel($(this));

// });

$('.returnFill').click(function(){
	changePanel($(navs[0]));
});
$('.seeReply').click(function(){
	location.href = "inbox.html";
})

$('.outbox_button').click(function() {

	var link = $(navs[$(this).attr('next_rel')]);

	changePanel(link);

	if (link.attr('rel') == "messageContent") {

		templateData = [],
		templateStr = "",
		contactData = {};
		getTemplateData();

	} else if (link.attr('rel') == "returnStatus") {

		getTemplateResult();

	}
});

//拿到模板渲染结果
function getTemplateResult() {

	var content = $('#messageContent textarea')[0].value;

	var i = 0,
		result = "";

	$('#returnStatus ul').html(""); //清空第三个面板
	
	for (var i in templateData) {
		sendMessage(content, templateData[i]);
	};

	//发动短信后
	
	$('#fillDerection textarea')[0].value = "";//清空第一个面板
	$('#messageContent textarea')[0].value = "";//清空第二个面板

}

//发送短信
function sendMessage(content, templateData) {

	var message = Mustache.render(content, templateData);

	//构造联系人map
	var obj =  $.extend({}, contactData[templateData.number]);

	(function(obj){
		$.post(sendMessageUrl, {
			time: new Date().getTime(),
			type: 1, //1代表sendMessage
			content: message,
			broadcaster: username,
			receiver: templateData.number
		}, function(data) {
			obj.status = data;
			showContactStatus(obj);
		})
	})(obj);
	//在平台接口的回调里,把数据存到数据库
	
}

function showContactStatus(obj) {
	var str = "";
	str = str + '<li> <a href="">' +
		obj.num +
		'</a> <span class="glyphicon ' + (obj.status == 1 ? 'glyphicon-ok' : 'glyphicon-remove') +
		'"></span> </li>';

	$('#returnStatus ul').append(str);

}

//得到模板数据
function getTemplateData() {

	templateData = [];
	var val = $('#fillDerection textarea')[0].value;
	var rows = val.split("\n");

	for (var i in rows) {

		var row = rows[i];
		var lists = row.split(",");
		var obj = {
			number: lists[0]
		};

		//存储联系人数据
		if (contactData[obj.number]) {
			alert('您输入了重复的联系人');
			return;
		}
		contactData[obj.number] = {};
		contactData[obj.number].num = obj.number;

		for (var j = 1; j < lists.length; j++) {
			obj[j] = lists[j];
		}

		templateData.push(obj);
	}
}

function changePanel(obj) {
	obj.parent().children('li').removeClass("active");
	obj.addClass("active");

	if (obj.attr("rel")) {

		$('.outbox_panel .body_content').hide();
		$('#' + obj.attr("rel")).show();

	}
}