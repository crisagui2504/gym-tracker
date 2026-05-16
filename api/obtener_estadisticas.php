<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/db.php';

$ejercicio_id = isset($_GET['ejercicio_id']) ? intval($_GET['ejercicio_id']) : 0;

if ($ejercicio_id === 0) {
  echo json_encode(['error' => 'ejercicio_id requerido']);
  exit;
}

try {
  $pdo = getPdo();

  $sql = "
    SELECT 
      fecha,
      MAX(peso_kg) as peso_kg
    FROM historial_series
    WHERE ejercicio_id = :ejercicio_id
    GROUP BY fecha
    ORDER BY fecha ASC
    LIMIT 90
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([':ejercicio_id' => $ejercicio_id]);
  $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    'ejercicio_id' => $ejercicio_id,
    'historial' => $historial
  ]);

} catch (PDOException $e) {
  echo json_encode(['error' => 'Error de base de datos']);
}
?>
