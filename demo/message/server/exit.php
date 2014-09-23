<?php
	//session设置
	session_start();
	if(isset($_SESSION['username'])) {
		unset($_SESSION['username']);
	};
?>