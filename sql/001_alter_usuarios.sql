ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS ultima_fecha_entrenamiento DATE NULL;

CREATE TABLE IF NOT EXISTS records_personales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ejercicio_id INT NOT NULL,
  nombre_ejercicio VARCHAR(255) NOT NULL,
  peso_kg DECIMAL(7,2) NOT NULL,
  fecha DATE NOT NULL,
  UNIQUE KEY uniq_records_ejercicio (ejercicio_id)
);

CREATE TABLE IF NOT EXISTS historial_ejercicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ejercicio_id INT NOT NULL,
  nombre_ejercicio VARCHAR(255) NOT NULL,
  peso_kg DECIMAL(7,2) NOT NULL,
  repeticiones INT NULL,
  fecha DATETIME NOT NULL,
  INDEX idx_historial_ejercicio_fecha (ejercicio_id, fecha)
);

CREATE TABLE IF NOT EXISTS ciclo_rutinas (
  id INT PRIMARY KEY,
  next_rutina_id INT NOT NULL DEFAULT 1,
  completadas_hoy JSON NULL,
  ultima_fecha DATE NULL,
  ultima_rutina_id INT NULL
);

INSERT INTO ciclo_rutinas (id, next_rutina_id, completadas_hoy, ultima_fecha, ultima_rutina_id)
VALUES (1, 1, JSON_ARRAY(), NULL, NULL)
ON DUPLICATE KEY UPDATE id = id;
