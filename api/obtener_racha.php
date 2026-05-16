<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/db.php';


try {
  $pdo = getPdo();
  $row = $pdo->query("SELECT ultima_fecha_entrenamiento FROM usuarios WHERE id = 1")->fetch(PDO::FETCH_ASSOC);
  
  $ultima = $row['ultima_fecha_entrenamiento'];
  $hoy = date('Y-m-d');
  $ayer = date('Y-m-d', strtotime('-1 day'));

  $stmt = $pdo->query("SELECT COUNT(DISTINCT fecha) as dias FROM historial_series WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)");
  $total = $stmt->fetch(PDO::FETCH_ASSOC)['dias'];

  if ($ultima === $hoy || $ultima === $ayer) {
    echo json_encode(['dias' => (int)$total, 'ultimaFecha' => $ultima]);
  } else {
    echo json_encode(['dias' => 0, 'ultimaFecha' => $ultima]);
  }
} catch (PDOException $e) {
  echo json_encode(['dias' => 0, 'ultimaFecha' => null]);
}
?>
