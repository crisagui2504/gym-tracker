<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/db.php';

try {
  $pdo = getPdo();

  $records = $pdo->query("SELECT ejercicio_id, nombre_ejercicio, peso_kg, fecha FROM records_personales")
    ->fetchAll(PDO::FETCH_ASSOC);

  $ciclo = $pdo->query("SELECT * FROM ciclo_rutinas LIMIT 1")->fetch(PDO::FETCH_ASSOC);

  $racha = $pdo->query("SELECT ultima_fecha_entrenamiento FROM usuarios WHERE id = 1")->fetch(PDO::FETCH_ASSOC);

  $recordsMap = [];
  foreach ($records as $r) {
    $recordsMap[$r['ejercicio_id']] = [
      'ejercicio_id' => (int)$r['ejercicio_id'],
      'nombre' => $r['nombre_ejercicio'],
      'peso' => (float)$r['peso_kg'],
      'fecha' => $r['fecha'],
    ];
  }

  echo json_encode([
    'records' => $recordsMap,
    'ciclo' => [
      'nextRutinaId' => (int)($ciclo['next_rutina_id'] ?? 1),
      'completadasHoy' => json_decode($ciclo['completadas_hoy'] ?? '[]'),
      'ultimaFecha' => $ciclo['ultima_fecha'] ?? null,
      'ultimaRutinaId' => $ciclo['ultima_rutina_id'] ? (int)$ciclo['ultima_rutina_id'] : null,
    ],
    'ultimaFechaEntrenamiento' => $racha['ultima_fecha_entrenamiento'] ?? null,
  ]);

} catch (PDOException $e) {
  echo json_encode(['error' => 'Error de base de datos']);
}
?>
