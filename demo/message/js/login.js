$('.login').click(loginClick);

function loginClick() {
	var username = $('.username').val();
	var password = $('.password').val();
	$.post("server/checkLogin.php", {
		username: username,
		password: password
	}, function(data) {
		if (data == "success") {
			location.href = "outbox.html";
		} else {
			alert('请输入正确的用户名和密码');
		}
	});
}

var checkSession = "server/checkSession.php";

//session检查
$.get(checkSession, function(data) {
	data = JSON.parse(data);
	if (data.status == "success") {
		$('.username').val(data.username);
		$('.password').val(data.password);
	}
});

document.onkeydown = function(event) {
	var e = event || window.event || arguments.callee.caller.arguments[0];
	if (e && e.keyCode == 13) { // 按 Enter
		$('.login').trigger("click", loginClick);
	}
}
