<?php

// 检查session
function checkSession() {

	session_start();

	if (isset($_SESSION['username']) && isset($_SESSION['password'])) {

		$arr = array ('username'=>$_SESSION['username'],'password'=>$_SESSION['password'],'status'=>"success");

	} else {

		$arr = array ('username'=>null,'password'=>null,'status'=>"fail");

	}

	return json_encode($arr);
}

//存储session
function saveSession($username,$password) {

	session_start();

	$_SESSION['username'] = $username;
	$_SESSION['password'] = $password;

}

//检查用户名和密码
function checkLogin( $uname, $upwd) {

	$result = mysql_query("SELECT password FROM users WHERE username = '".$uname."'");
	$con = $GLOBALS['con'];

	if (!$con) {
	  die('Could not connect: ' . mysql_error());
	}

	$row = mysql_fetch_array($result);

	return $row['password'] == $upwd ? "success" : "fail";

}

//插入发送信息
function insertMessage($P) {

	$uidResult = mysql_query("SELECT id FROM users WHERE username = '".$P["broadcaster"]."'");
	$uidRow = mysql_fetch_array($uidResult);

	$status = sendSms($P,$uidRow['id']);//向第三方平台发送数据并返回
	// $status = 1;
	
	$time = $P["time"];
	$type = $P["type"];
	$content = $P["content"];
	$broadcaster = $uidRow['id'];
	$receiver = $P["receiver"];

	$con = $GLOBALS['con'];

	//向数据库中插入数据
	$sql="INSERT INTO message (time, status, type, content, broadcaster, receiver)
	VALUES
	('$time','$status','$type','$content','$broadcaster','$receiver')";

	if (!mysql_query($sql,$con)) {
	  die('Error: ' . mysql_error());
	}
	echo $status;
};

//初始化收件箱
function initReceive($username) {
	$con = $GLOBALS['con'];

	$uidResult = mysql_query("SELECT id FROM users WHERE username = '".$username."'");
	$uidRow = mysql_fetch_array($uidResult);
	$uid = $uidRow["id"];

	$sql = "select distinct receiver, IF(count IS NULL ,0,count) as count from message u
			left join 
			(select receiver as user, count(id) as count from message 
				where isShowMessage = 'true' and broadcaster = '".$uid."' group by receiver) a 
			on  u.receiver=a.user 
			where  broadcaster = '".$uid."' and status = 1 
			ORDER BY `id` DESC  
			limit 100";
	//$sql = "SELECT DISTINCT * FROM message WHERE type = '2' and isShowMessage = 'true' and broadcaster = '".$uid."' ORDER BY `id` DESC ";
	$result = queryexec( $sql, $con );
	$re_arr = null;

	$i = 0;

	if ($result) {
		while ($row = mysql_fetch_row($result)) {
			$x['id'] = $row['0'];
			$x['count'] = $row['1'];

			$s = mysql_query("SELECT distinct content FROM message WHERE receiver  = '".$x['id']."' ORDER BY `id` DESC  ");
			$sre = mysql_fetch_array($s);
			$x['content'] = $sre['content'];

			$re_arr[$i] = $x;
			$i++;
		}
	}

	if ( $re_arr ) {
		return $re_arr;
	}
	return false;
}


//更新message为不可显示（当用户点击收件箱中的联系人时）
function updataShowMessage($P) {
	//id为用户的电话号码，更新该用户发来的信息的isShowMesage字段
	$id = $P['id'];
	return mysql_query("UPDATE message SET isShowMessage = 'false' WHERE receiver = '".$id."' and isShowMessage = 'true' ");
}

//通过手机号码得到历史记录（只取后十个）
function getHistory($P) {

	$id = $P['id'];
	$con = $GLOBALS['con'];

	$result = mysql_query("SELECT content,type FROM message WHERE receiver = '".$id."' ORDER BY `id` DESC limit 20 ");

	$re_arr = null;
	$i = 0;

	if ($result) {
		while ($row = mysql_fetch_array($result)) {

			$x["content"] = $row["content"];
			$x["type"] = $row["type"];
			$re_arr[$i] = $x;
			$i++;
		}
	}

	if ( $re_arr ) {
		return $re_arr;
	}

	return false;
}

// 发送短信给第三方接口
function sendSms($P,$uid) {
	$time = $P["time"];
	$content = $P["content"];
	$broadcaster = $P["broadcaster"];
	$receiver = $P["receiver"];

	$url = "http://221.179.180.158:9007/QxtSms/QxtFirewall?".
		"OperID=youke".
		"&OperPass=ikEy0u".
		"&SendTime=&ValidTime=".
		"&AppendID=".$uid.
		"&DesMobile=".$receiver.
		"&Content=".mb_convert_encoding($content, "GBK", "UTF-8").
		"&ContentType=8";
	$re = file_get_contents($url);

	if (strpos($re, "<code>03</code>")) {
		return 1;//发送成功状态码
	} else {
		return 2;//发送失败状态码	
	}
}

//插入回复信息
function insertReplyMessage($P) {

	$status = 1;
	$time = $P["RecvTime"];
	$type = 2;
	$content = urldecode($P["Content"]);
	$receiver = $P["SrcMobile"];
	$broadcaster = substr($P["AppendID"], -4);//截取id

	$con = $GLOBALS['con'];

	//向数据库中插入数据
	$sql="INSERT INTO message (time, status, type, content, broadcaster, receiver, isShowMessage)
	VALUES
	('$time','$status','$type','$content','$broadcaster','$receiver', 'true')";

	if (!mysql_query($sql,$con)) {
	  die('Error: ' . mysql_error());
	}
	echo "success";
}

// exec mysql query
function queryexec( $str, $conn ) {
	return mysql_query( $str, $conn );
}
