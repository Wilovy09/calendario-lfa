-- Tabla de juegos con horario oficial
CREATE TABLE games (
    id TEXT PRIMARY KEY,
    starts_at TIMESTAMPTZ NOT NULL
);

-- Seed: todos los juegos de la temporada 2026
-- Los horarios están en hora local de México (America/Mexico_City)
INSERT INTO games (id, starts_at) VALUES
    ('s1-osos-vs-dinos',                   '2026-04-09 20:00:00 America/Mexico_City'),
    ('s1-caudillos-vs-raptors',            '2026-04-11 19:00:00 America/Mexico_City'),
    ('s1-gallos-negros-vs-reyes',          '2026-04-11 19:00:00 America/Mexico_City'),
    ('s2-dinos-vs-gallos-negros',          '2026-04-18 19:00:00 America/Mexico_City'),
    ('s2-raptors-vs-mexicas',              '2026-04-18 19:00:00 America/Mexico_City'),
    ('s2-caudillos-vs-osos',               '2026-04-18 19:00:00 America/Mexico_City'),
    ('s3-raptors-vs-dinos',                '2026-04-25 19:00:00 America/Mexico_City'),
    ('s3-gallos-negros-vs-mexicas',        '2026-04-25 19:00:00 America/Mexico_City'),
    ('s3-reyes-vs-osos',                   '2026-04-26 19:00:00 America/Mexico_City'),
    ('s4-osos-vs-mexicas',                 '2026-05-02 19:00:00 America/Mexico_City'),
    ('s4-raptors-vs-gallos-negros',        '2026-05-02 19:00:00 America/Mexico_City'),
    ('s4-reyes-vs-caudillos',              '2026-05-03 19:00:00 America/Mexico_City'),
    ('s5-caudillos-vs-gallos-negros',      '2026-05-09 19:00:00 America/Mexico_City'),
    ('s5-reyes-vs-raptors',                '2026-05-09 19:00:00 America/Mexico_City'),
    ('s5-mexicas-vs-dinos',                '2026-05-09 19:00:00 America/Mexico_City'),
    ('s6-osos-vs-raptors',                 '2026-05-16 19:00:00 America/Mexico_City'),
    ('s6-dinos-vs-caudillos',              '2026-05-16 19:00:00 America/Mexico_City'),
    ('s6-mexicas-vs-reyes',                '2026-05-16 19:00:00 America/Mexico_City'),
    ('s7-dinos-vs-reyes',                  '2026-05-23 19:00:00 America/Mexico_City'),
    ('s7-gallos-negros-vs-osos',           '2026-05-23 19:00:00 America/Mexico_City'),
    ('s7-mexicas-vs-caudillos',            '2026-05-23 19:00:00 America/Mexico_City');

-- Política de lectura pública
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "games_select" ON games FOR SELECT USING (true);

-- Helper: devuelve true si aún se puede votar en ese juego
CREATE OR REPLACE FUNCTION vote_is_open(gid TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM games
        WHERE id = gid
        AND NOW() < starts_at - INTERVAL '30 minutes'
    );
$$;

-- Reemplazar políticas de INSERT y UPDATE para incluir el bloqueo
DROP POLICY IF EXISTS "votes_insert" ON votes;
DROP POLICY IF EXISTS "votes_update" ON votes;

CREATE POLICY "votes_insert" ON votes FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND vote_is_open(game_id)
);

CREATE POLICY "votes_update" ON votes FOR UPDATE
USING (
    auth.uid() = user_id
    AND vote_is_open(game_id)
);

-- Agregar política DELETE (necesaria para el toggle-off del voto)
CREATE POLICY "votes_delete" ON votes FOR DELETE
USING (
    auth.uid() = user_id
    AND vote_is_open(game_id)
);
