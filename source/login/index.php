<?php
/* -*- coding: utf-8 -*-
 * Copyright 2015 Okta, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('../simplesamlphp/lib/_autoload.php');
session_start();

$title = 'Login: W+K New York Floorplan';
$user_session_key = 'user_session';
$saml_sso = 'saml_sso';

// If the user is logged in and requesting a logout.
if (isset($_SESSION[$user_session_key]) && isset($_REQUEST['logout'])) {
   $sp = $_SESSION[$user_session_key]['sp'];
   unset($_SESSION[$user_session_key]);
   $as = new SimpleSAML_Auth_Simple($sp);
   $as->logout(["ReturnTo" => $_SERVER['PHP_SELF']]);
}

// If the user is logging in.
if (isset($_REQUEST[$saml_sso])) {
    $sp = $_REQUEST[$saml_sso];
    $as = new SimpleSAML_Auth_Simple($sp);
    $as->requireAuth();
    $user = array(
        'sp'         => $sp,
        'authed'     => $as->isAuthenticated(),
        'idp'        => $as->getAuthData('saml:sp:IdP'),
        'nameId'     => $as->getAuthData('saml:sp:NameID')['Value'],
        'attributes' => $as->getAttributes(),
    );
    
    $_SESSION[$user_session_key] = $user;
}


if (isset($_SESSION[$user_session_key])) {
  
  $attributes = $_SESSION[$user_session_key]['attributes'];
  $_SESSION["FirstName"] = $attributes["FirstName"][0];
  $_SESSION["LastName"] = $attributes["LastName"][0];
  $_SESSION["Email"] = $attributes["Email"][0];

  header ("Location: /");
}

?>  
<!DOCTYPE html>
<html>
  <head>
    <title><?= $title ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>

  <body>
    <?php if(isset($_SESSION[$user_session_key])) { ?>
    <a href="?logout=true">Logout</a>
    <?php } ?>

    <div class="container">
    <?php if(isset($_SESSION[$user_session_key])) { ?>
      <h1>Logged in</h1>
      <p>Contents of the most recent SAML assertion:</p>
      <div>
        <table>
        <?php foreach($_SESSION[$user_session_key]['attributes'] as $key => $value) { ?>
          <tr>
            <td><?= $key ?></td>
            <td><?= $value[0] ?></td>
          </tr>
        <?php } ?>
        </table>
      </div>
      <?php
      } else {
        $sources = SimpleSAML_Auth_Source::getSources();
      ?>
      <p class="lead">Select the IdP you want to use to authenticate:</p>
      <ol>
        <?php foreach($sources as $source) { ?>
        <li><a href="?<?= $saml_sso ?>=<?= $source ?>"><?= $source ?></a></li>
        <?php } ?>
      </ol>
    <?php } ?>
    </div>
  </body>

</html>
