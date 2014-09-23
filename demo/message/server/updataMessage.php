<?php
header("Content-Type:text/json; charset=utf-8");

require_once("./base/conn.php");
require_once("./base/core.php");

$id = $_POST["id"];

if (strlen($id) > 0) {

	dataBase(function(){
		echo updataShowMessage($_POST);//更新isShowMessage字段
	});

} else {
	echo "fail";
}