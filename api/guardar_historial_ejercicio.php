<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/db.php';

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) { echo json_encode(['error' => 'Datos inválidos']); exit; }

try {
  $pdo = getPdo();

  $sql = "INSERT INTO historial_ejercicios (ejercicio_id, nombre_ejercicio, peso_kg, repeticiones, fecha)
    VALUES (:eid, :nombre, :peso, :reps, :fecha)";

  $pdo->prepare($sql)->execute([
    ':eid' => intval($body['ejercicio_id']),
    ':nombre' => $body['nombre_ejercicio'] ?? '',
    ':peso' => floatval($body['peso_kg']),
    ':reps' => isset($body['repeticiones']) ? intval($body['repeticiones']) : null,
    ':fecha' => $body['fecha'],
  ]);

  echo json_encode(['ok' => true]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Error al guardar']);
}
?>
