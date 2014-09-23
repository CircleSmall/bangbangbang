<?php
header("Content-Type:text/json; charset=utf-8");

require_once("./base/conn.php");
require_once("./base/core.php");

$id = $_POST["id"];

if (strlen($id) > 0) {

	dataBase(function(){
		$result = getHistory($_POST);//通过手机号码得到历史记录
		echo json_encode($result);
	});

} else {
	echo "fail";
}