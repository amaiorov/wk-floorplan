<?php
	$extension = end(explode(".", $_FILES["file"]["name"]));

	move_uploaded_file($_FILES["file"]["tmp_name"],
      "upload/" . $_POST['floor-name'] . "." . $extension);
	echo "The following image has been uploaded:<br>";
	echo "<img src='"."upload/" . $_POST['floor-name'] . "." . $extension . "'>";
?>