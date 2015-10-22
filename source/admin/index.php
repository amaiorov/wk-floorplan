<?php
	session_name('floorplan_admin');
	session_start();

	if ($_SESSION['admin']) {
		header('Location: /');
	} else {
		echo 'session cookie "admin" is not set';
		$_SESSION['admin'] = true;
	}

?>