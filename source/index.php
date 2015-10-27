<?php
	session_name('floorplan_admin');
	session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Wieden+Kennedy Floor Plan</title>
	<meta charset="utf-8">
	<link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/bootstrap-toggle.min.css">
	<link rel="stylesheet" href="css/wkfp.css">
	<link href="http://c0717682.cdn.cloudfiles.rackspacecloud.com/images/favicon.ico" rel="icon" type="image/vnd.microsoft.icon">
<?php
	if ($_SESSION['admin'] == true) {
		echo "<script>window.admin = true;</script>";
	} else {
		unset($_SESSION['admin']);
	}
?>
</head>

<body>
	<script src="output/bundle.js"></script>
</body>
</html>