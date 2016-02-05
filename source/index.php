<?php
	error_reporting(0);
	session_start();

	$prodDomain = "floorplan.wknyc.com";

	if ($_SERVER["HTTP_HOST"] != $prodDomain) {

		if (isset($_GET['admin'])) {
		    $_SESSION['admin'] = true;
		}

	}else if (!isset($_SESSION["FirstName"]) && !isset($_SESSION["LastName"]) && !isset($_SESSION["Email"])) {
		
		header("Location: /login/?saml_sso=wknyc-floorplan");

	}else {

		$admins = array(
			"jessi.ortolano@wk.com",
			"joe.zhou@wk.com",
			"alex.maiorov@wk.com"
		);

		if (in_array( strtolower($_SESSION["Email"]), $admins)) {
		    $_SESSION['admin'] = true;
		}
	}

	if (isset($_GET['admindemo'])) {
	    $_SESSION['admindemo'] = true;
	}else {
		unset($_SESSION['admindemo']);
	}

	if ($_SESSION['admin'] != true) {
		unset($_SESSION['admin']);
	}

	$config = array(
		"admin" => $_SESSION['admin'],
		"admindemo" => $_SESSION['admindemo'],
		"firstname" => $_SESSION["FirstName"],
		"lastname" => $_SESSION["LastName"],
		"email" => strtolower($_SESSION["Email"])
	);
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

	<script type="application/json" id="config">
		<?= json_encode($config); ?>
	</script>
</head>

<body>
	<script src="output/bundle.js"></script>
</body>
</html>