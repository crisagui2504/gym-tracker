<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/db.php';

$rutina_id = isset($_GET['rutina_id']) ? intval($_GET['rutina_id']) : 0;

if ($rutina_id === 0) {
  echo json_encode(['error' => 'rutina_id requerido']);
  exit;
}

try {
  $pdo = getPdo();

  $sql = "
    SELECT re.id, re.ejercicio_id, e.nombre, e.grupo_muscular,
      re.orden, re.series_objetivo, re.reps_objetivo, re.descanso_segundos,
      r.nombre_rutina, r.enfoque
    FROM rutina_ejercicios re
    JOIN ejercicios e ON e.id = re.ejercicio_id
    JOIN rutinas r ON r.id = re.rutina_id
    WHERE re.rutina_id = :rutina_id
    ORDER BY re.orden ASC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([':rutina_id' => $rutina_id]);
  $ejercicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(['rutina_id' => $rutina_id, 'ejercicios' => $ejercicios]);

} catch (PDOException $e) {
  echo json_encode(['error' => 'Error de base de datos']);
}
?>
