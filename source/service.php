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
	$file = $_POST['path'] . $_POST['filename'];

	switch ($action) {
		case 'saveDefaultJson':
		case 'saveCustomJson':
			file_put_contents($file, $_POST['json']);
			break;
		case 'loadDefaultJson':
		case 'loadCustomJson':
			header('Content-Type: application/json');
			echo json_encode(file_get_contents($file));
			break;
		default:
			echo 'do something else, aka FAIL';
	}
?>