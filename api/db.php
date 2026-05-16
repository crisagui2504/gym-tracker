<?php

function getPdo(): PDO {
  $host = getenv('DB_HOST') ?: 'localhost';
  $db = getenv('DB_NAME') ?: 'gym_bd';
  $user = getenv('DB_USER') ?: 'gymuser';
  $pass = getenv('DB_PASS') ?: '';

  $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  return $pdo;
}

?>
