<?php
header("Content-Type:text/json; charset=utf-8");

require_once("./base/conn.php");
require_once("./base/core.php");

$time = $_POST["time"];
$type = $_POST["type"];
$content = $_POST["content"];
$broadcaster = $_POST["broadcaster"];
$receiver = $_POST["receiver"];

if (strlen($time) > 0 && strlen($type) > 0 && strlen($content) > 0 && strlen($broadcaster) > 0 && strlen($receiver) > 0) {

	dataBase(function(){
		insertMessage($_POST);
	});

} else {
	echo "fail";
}