<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/db.php';


try {
  $pdo = getPdo();
  $hoy = date('Y-m-d');
  $pdo->prepare("UPDATE usuarios SET ultima_fecha_entrenamiento = :fecha WHERE id = 1")
      ->execute([':fecha' => $hoy]);
  echo json_encode(['ok' => true]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Error']);
}
?>
