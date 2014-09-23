/*
页面逻辑：
	1、读取session
	2、读取未接受短信并插入数据库
	3、页面初始化
*/


var reveiveData = {}, //收件箱的map映射
	username;

var checkSessionUrl = "server/checkSession.php",
	exitUrl = "server/exit.php",
	sendMessageUrl = "server/sendMessage.php",
	updataMessageUrl = "server/updataMessage.php",
	getHistoryUrl = "server/getHistory.php";



//session检查
$.get(checkSessionUrl, function(data) {
	data = JSON.parse(data);
	if (data.status == "success") {
		username = data.username;
		$('#username').html(username);
		init();
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

function init(){
	//初始化
	$.post("server/receiveMessage.php", {
		username: username
	}, function(data) {
		var data = JSON.parse(data);
		reveiveData = data;
		initPage();
	});
}


function initPage() {
	showContacts();
	// showPanel();
	addEvent();
};

function addEvent() {
	$('#num a').click(function() {
		$('.panel-body').hide();
		$(this).parent().children('a').removeClass('active');
		$(this).addClass("active");
		var id = $.trim($(this).attr("uid"));
		showDetail(id,$(this));
	});

	// 给回复按钮添加发送短信事件
	$('.reply').click(function() {
		var num = $(this).attr('rel'); //num是发动目标的手机号码
		sendMesage(num, $('#textarea_content')[0].value);
	});
}

//显示联系人
function showContacts() {
	$('#num').html(""); //清空联系人
	var str = '';
	for (var i in reveiveData) {
		var count = reveiveData[i].count > 0 ? reveiveData[i].count : '';
		str = str + //
			'<a href="#" class="list-group-item" uid="' + //
			reveiveData[i].id + '">' + //
			reveiveData[i].id + '<span class="badge">' + count.toString() +//
			'</span><span class="content">' + //
			// "saasfasdfasf" + //
			reveiveData[i].content.toString() + 
			'</span></a>';
	}
	$('#num').html(str);
}

//显示相对应联系人的面板
function showPanel() {
	var str = "";
	for (var i in reveiveData) {
		str = str + '<div class="panel-body main_panel" id="' + reveiveData[i].num +
			'"><p class="content">' + reveiveData[i].content +
			'</p><textarea class="form-control" name="" id="textarea_content" rows="4"></textarea>' +
			'<div style="text-align:right;"><button type="button" class="btn btn-default navbar-btn reply" rel="' + reveiveData[i].num +
			'">回复</button></div> </div>';
	};
	$('#main_panel').append(str);
}

//显示短信内容
function showDetail(id,targetObj) {
	//更新用户回复信息的状态(在数据库中将isShowMessage 改为 false)
	$('.reply').attr('rel',id);
	$.post(updataMessageUrl, {id:id},function (data){
		if(data != 'false'){
			$(targetObj.children('.badge')).html("");
		}
	});
	$.post(getHistoryUrl, {id:id}, function (data) {

		$('#main_panel .main_panel p').remove();

		var str = "";
		for (var i in data) {
			var content = data[i].content;
			if(data[i].type == 2) {
				str = '<p class="content">' + content + '</p>';
			} else {
				str = '<p class="content username">' + content + '</p>';
			}
			$("#main_panel .main_panel").prepend(str);
		}
		$('.panel-body').show();
	})
	
};

//发送短信函数
function sendMesage(num,message) {
	//调用接口
	$.post(sendMessageUrl, {
		time: new Date().getTime(),
		status: status || 2, //1代表完成,2代表失败
		type: 1, //1代表sendMessage
		content: message,
		broadcaster: username,
		receiver: num
	}, function(data) {
		if (data == 1) {
			alert("回复成功");
			$("#textarea_content").before('<p class="content username">' + message + '</p>');
			$("#textarea_content").val('');
		} else {
			alert("回复失败");
		}
	})
}

