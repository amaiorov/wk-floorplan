<?php

$mailTo = 'alex.kaminsky@wk.com';
$mailFrom = 'error@wk.com';
$subject = 'Error with seating';
$message = $_POST['message'];

			
mail($mailTo, $subject, $message, "From: ".$mailFrom);
?>