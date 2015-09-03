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

	$action = defined($_POST['action']) ? $_POST['action'] : $_GET['action'] ;
	$file = $_POST['path'] . $_POST['filename'];
	$fullName = $_POST['firstName'] . '.' . $_POST['lastName'];
	$fullName = $_GET['firstName'] . '.' . $_GET['lastName'];

	switch ($action) {
		case 'test':
			header('Content-Type: application/json');
			$fileList = 'filelist: ' . json_encode(scandir('./json/')). ',';
			$jsonContents = file_get_contents('./json/default.json');
			$json .= $fileList . $jsonContents;
			echo json_encode($json);
			break;
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

			break;
		default:
			$url = 'http://www.wk.com/' . $fullName;
			// $url = 'http://www.wk.com/alex.maiorov';

			$html = file_get_contents($url);

			$doc = new DOMDocument();
			@$doc->loadHTML($html);

			$tags = $doc->getElementsByTagName('img');
			if ($tags->length == 2) {
				$localHeadshotSrc = './headshots/'. $fullName . '.jpg';
				$localMD5 = md5_file($localHeadshotSrc);
				$remoteHeadshotSrc = $tags[1]->getAttribute('src');
				$remoteMD5 = md5_file($remoteHeadshotSrc);
				if (file_exists($localHeadshotSrc) && $localMD5 == $remoteMD5) {
					echo 'local file ' . $localHeadshotSrc . ' exists and MD5 match';
				} else if (file_exists($localHeadshotSrc) && $localMD5 != $remoteMD5) {
					echo 'local file ' . $localHeadshotSrc . ' exists and MD5 do not match';
				} else {
					echo 'local file ' . $localHeadshotSrc . ' does not exist';
				}

				// echo 'correct page';
				// header('Content-Type: image/jpeg');
				// echo );
			} else {
				echo 'FAIL: incorrect page';
			}
			// echo 'do something else, aka FAIL';
			break;
			// echo file_get_contents('http://www.wk.com/alex.maiorov');

			// $doc->loadHTML(file_get_contents('http://www.wk.com/alex.maiorov'));


	}
?>