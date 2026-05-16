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

  $sql = "INSERT INTO records_personales (ejercicio_id, nombre_ejercicio, peso_kg, fecha)
    VALUES (:eid, :nombre, :peso, :fecha)
    ON DUPLICATE KEY UPDATE
      peso_kg = IF(:peso2 > peso_kg, :peso2, peso_kg),
      nombre_ejercicio = :nombre2,
      fecha = IF(:peso3 > peso_kg, :fecha2, fecha)";

  $pdo->prepare($sql)->execute([
    ':eid' => intval($body['ejercicio_id']),
    ':nombre' => $body['nombre_ejercicio'],
    ':peso' => floatval($body['peso_kg']),
    ':fecha' => $body['fecha'],
    ':peso2' => floatval($body['peso_kg']),
    ':nombre2' => $body['nombre_ejercicio'],
    ':peso3' => floatval($body['peso_kg']),
    ':fecha2' => $body['fecha'],
  ]);

  echo json_encode(['ok' => true]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Error al guardar']);
}
?>
