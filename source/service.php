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
	$fullName = $_POST['firstName'] . '.' . $_POST['lastName'];
	$fullName = $_GET['firstName'] . '.' . $_GET['lastName'];

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
		case 'getHeadshot':
			$url = 'http://www.wk.com/' . $fullName;

			$html = file_get_contents($url);

			$doc = new DOMDocument();
			@$doc->loadHTML($html);

			$tags = $doc->getElementsByTagName('img');
			if ($tags->length == 2) {
				echo 'correct page';
			} else {
				echo 'FAIL: incorrect page';
			}
			break;
		default:
		$url = 'http://www.wk.com/' . $fullName;
		// $url = 'http://www.wk.com/alex.maiorov';

		$html = file_get_contents($url);

		$doc = new DOMDocument();
		@$doc->loadHTML($html);

		$tags = $doc->getElementsByTagName('img');
		if ($tags->length == 2) {
			// echo 'correct page';
			// header('Content-Type: image/jpeg');
			echo md5_file($tags[1]->getAttribute('src'));
		} else {
			echo 'FAIL: incorrect page';
		}
		break;
			echo 'do something else, aka FAIL';
			break;
			// echo file_get_contents('http://www.wk.com/alex.maiorov');

			// $doc->loadHTML(file_get_contents('http://www.wk.com/alex.maiorov'));


	}
?>