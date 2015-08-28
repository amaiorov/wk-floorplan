<?php
	// foreach ($_POST as $key => $value) {
	// 	echo 'key: ' . $key . '<br>';
	// 	echo 'value: ' . $value . '<br>';
	// }

	// echo $_POST['action'];
	// echo '<br><br>';
	// echo $_POST['path'];
	// echo '<br><br>';
	// echo $_POST['filename'];
	// echo '<br><br>';
	// echo $_POST['json'];

	$action = $_POST['action'];


	switch ($action) {
		case 'saveDefaultJson':
			echo 'save default json';

			$file = $_POST['path'] . $_POST['filename'];
			file_put_contents($file, $_POST['json']);

			break;
		
		default:
			echo 'do something else';
			break;
	}
?>