-- Agregar campos de schedule a la tabla games
ALTER TABLE games
ADD COLUMN week INTEGER,
ADD COLUMN home_team TEXT,
ADD COLUMN away_team TEXT;

-- Poblar con los datos de la temporada 2026
UPDATE games SET week = 1, home_team = 'Osos',         away_team = 'Dinos'         WHERE id = 's1-osos-vs-dinos';
UPDATE games SET week = 1, home_team = 'Caudillos',    away_team = 'Raptors'       WHERE id = 's1-caudillos-vs-raptors';
UPDATE games SET week = 1, home_team = 'Gallos Negros',away_team = 'Reyes'         WHERE id = 's1-gallos-negros-vs-reyes';
UPDATE games SET week = 2, home_team = 'Dinos',        away_team = 'Gallos Negros' WHERE id = 's2-dinos-vs-gallos-negros';
UPDATE games SET week = 2, home_team = 'Raptors',      away_team = 'Mexicas'       WHERE id = 's2-raptors-vs-mexicas';
UPDATE games SET week = 2, home_team = 'Caudillos',    away_team = 'Osos'          WHERE id = 's2-caudillos-vs-osos';
UPDATE games SET week = 3, home_team = 'Raptors',      away_team = 'Dinos'         WHERE id = 's3-raptors-vs-dinos';
UPDATE games SET week = 3, home_team = 'Gallos Negros',away_team = 'Mexicas'       WHERE id = 's3-gallos-negros-vs-mexicas';
UPDATE games SET week = 3, home_team = 'Reyes',        away_team = 'Osos'          WHERE id = 's3-reyes-vs-osos';
UPDATE games SET week = 4, home_team = 'Osos',         away_team = 'Mexicas'       WHERE id = 's4-osos-vs-mexicas';
UPDATE games SET week = 4, home_team = 'Raptors',      away_team = 'Gallos Negros' WHERE id = 's4-raptors-vs-gallos-negros';
UPDATE games SET week = 4, home_team = 'Reyes',        away_team = 'Caudillos'     WHERE id = 's4-reyes-vs-caudillos';
UPDATE games SET week = 5, home_team = 'Caudillos',    away_team = 'Gallos Negros' WHERE id = 's5-caudillos-vs-gallos-negros';
UPDATE games SET week = 5, home_team = 'Reyes',        away_team = 'Raptors'       WHERE id = 's5-reyes-vs-raptors';
UPDATE games SET week = 5, home_team = 'Mexicas',      away_team = 'Dinos'         WHERE id = 's5-mexicas-vs-dinos';
UPDATE games SET week = 6, home_team = 'Osos',         away_team = 'Raptors'       WHERE id = 's6-osos-vs-raptors';
UPDATE games SET week = 6, home_team = 'Dinos',        away_team = 'Caudillos'     WHERE id = 's6-dinos-vs-caudillos';
UPDATE games SET week = 6, home_team = 'Mexicas',      away_team = 'Reyes'         WHERE id = 's6-mexicas-vs-reyes';
UPDATE games SET week = 7, home_team = 'Dinos',        away_team = 'Reyes'         WHERE id = 's7-dinos-vs-reyes';
UPDATE games SET week = 7, home_team = 'Gallos Negros',away_team = 'Osos'          WHERE id = 's7-gallos-negros-vs-osos';
UPDATE games SET week = 7, home_team = 'Mexicas',      away_team = 'Caudillos'     WHERE id = 's7-mexicas-vs-caudillos';

-- Hacer los campos NOT NULL ahora que están poblados
ALTER TABLE games
ALTER COLUMN week SET NOT NULL,
ALTER COLUMN home_team SET NOT NULL,
ALTER COLUMN away_team SET NOT NULL;
