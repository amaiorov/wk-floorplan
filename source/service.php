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

	$action = isset($_POST['action']) ? $_POST['action'] : $_GET['action'];
	$fileName = $_POST['filename'];
	$path = './json/';
	$fullName = $_POST['fullName'];
	$fullName = $_GET['fullName'];

	function getFilelist() {

		$glob = glob('./json/*.{json}', GLOB_BRACE);
		$glob = str_replace('./json/', '', $glob);

		for($i = 0; $i < sizeof($glob); $i++) {
			$glob[$i] = urldecode( $glob[$i] );
		}

		return array_values($glob);
	}

	switch ($action) {
		case 'test':
			break;
		case 'createJson':
		case 'saveJson':
			file_put_contents($path . urlencode($fileName), $_POST['json']);
			$JSON = json_encode(array(
				'filelist' => getFilelist(),
				'file' => $fileName
			));
			header('Content-Type: application/json');
			echo $JSON;
			break;
		case 'loadDefaultJson':
		case 'loadCustomJson':
			$JSON = json_encode(array(
				'filelist' => getFilelist(),
				'file' => $fileName,
				'content' => file_get_contents($path . urlencode($fileName))
			));
			header('Content-Type: application/json');
			echo $JSON;
			break;
		case 'getHeadshot':

			break;
		default:
			// return;
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