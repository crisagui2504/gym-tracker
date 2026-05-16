<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

$body = json_decode(file_get_contents('php://input'), true);

if (!$body || !isset($body['rutina_id']) || !isset($body['series'])) {
  echo json_encode(['error' => 'Datos incompletos']);
  exit;
}

try {
  $pdo = getPdo();

  $pdo->beginTransaction();

  $sql = "INSERT INTO historial_series 
    (fecha, ejercicio_id, rutina_id, numero_serie, peso_kg, repeticiones_logradas) 
    VALUES (:fecha, :ejercicio_id, :rutina_id, :numero_serie, :peso_kg, :reps)";

  $stmt = $pdo->prepare($sql);
  $fecha = date('Y-m-d');

  foreach ($body['series'] as $ejercicio_id => $series) {
    foreach ($series as $serie) {
      $stmt->execute([
        ':fecha'        => $fecha,
        ':ejercicio_id' => intval($ejercicio_id),
        ':rutina_id'    => intval($body['rutina_id']),
        ':numero_serie' => intval($serie['numero_serie']),
        ':peso_kg'      => floatval($serie['peso_kg']),
        ':reps'         => intval($serie['repeticiones'])
      ]);
    }
  }

  $pdo->prepare("UPDATE usuarios SET ultima_fecha_entrenamiento = :fecha WHERE id = 1")
      ->execute([':fecha' => $fecha]);

  $pdo->commit();
  echo json_encode(['ok' => true, 'mensaje' => 'Entrenamiento guardado']);

} catch (PDOException $e) {
  $pdo->rollBack();
  echo json_encode(['error' => 'Error al guardar']);
}
?>
