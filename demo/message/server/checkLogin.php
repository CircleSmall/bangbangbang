<?php

require_once("./base/conn.php");
require_once("./base/core.php");

dataBase(function(){

	$username = $_POST["username"];
	$password = $_POST["password"];

	if (isset($username) && isset($password) && strlen($username) > 0 && strlen($password) > 0) {

		$checkLoginResult = checkLogin($username, $password);

		if ($checkLoginResult == "success") {
			//session设置
			saveSession($username,$password);
		}

		echo $checkLoginResult;

	} else {

		echo "fail";

	}
});