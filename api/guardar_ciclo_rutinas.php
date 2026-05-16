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

  $sql = "UPDATE ciclo_rutinas SET
    next_rutina_id = :next,
    completadas_hoy = :completadas,
    ultima_fecha = :fecha,
    ultima_rutina_id = :ultima
    WHERE id = 1";

  $pdo->prepare($sql)->execute([
    ':next' => intval($body['nextRutinaId']),
    ':completadas' => json_encode($body['completadasHoy'] ?? []),
    ':fecha' => $body['ultimaFecha'],
    ':ultima' => isset($body['ultimaRutinaId']) ? intval($body['ultimaRutinaId']) : null,
  ]);

  echo json_encode(['ok' => true]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Error al guardar ciclo']);
}
?>
