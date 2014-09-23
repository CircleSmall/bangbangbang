<?php
header("Content-Type:text/json; charset=utf-8");

require_once("./base/conn.php");
require_once("./base/core.php");

$sendPerson = $_GET["SrcMobile"];
$content = $_GET["Content"];
$time = $_GET["RecvTime"];

if (strlen($sendPerson) > 0 && strlen($content) > 0 && strlen($time) > 0 ) {

	dataBase(function(){
		insertReplyMessage($_GET);
	});

} else {
	echo "fail";
}