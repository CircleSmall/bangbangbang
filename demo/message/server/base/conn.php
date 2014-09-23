<?php

function dataBase($callback){

	// database configure
	$_config = array();
	$_config['dbhost'] = 'localhost:3306';
	$_config['dbuser'] = 'root';
	$_config['dbpwd'] = '';
	$_config['charset'] = 'utf-8';
	// $_config['dbname'] = 'youke_sms_platform';
	$_config['dbname'] = 'message_test';

	// create a connection with database
	$conn = mysql_connect($_config['dbhost'], $_config['dbuser'], $_config['dbpwd']);
	mysql_select_db($_config['dbname'], $conn);
	mysql_query("set names utf8");

	// mysql_query("set character set 'gbk'");   //避免中文乱码字符转换
	// mysql_query("set character set 'utf8'");

	$GLOBALS['con'] = $conn;

	//执行回调
	$callback && $callback();

	mysql_close($conn);
}
