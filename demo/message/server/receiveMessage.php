<?php

require_once("./base/conn.php");
require_once("./base/core.php");

dataBase(function(){
	$result = initReceive($_POST['username']);
	echo json_encode($result);
});

?>