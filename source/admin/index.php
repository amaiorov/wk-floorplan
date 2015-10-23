<?php
	session_name('floorplan_admin');
	session_start();

	if ($_SESSION['admin']) {
		header('Location: /');
	} else {
		echo 'Please reload the page.';
		$_SESSION['admin'] = true;
	}

?>