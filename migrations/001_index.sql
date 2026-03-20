-- Tabla principal
CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    game_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    team TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (game_id, user_id)
);

-- Politicas
CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);

CREATE POLICY "votes_insert" ON votes FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "votes_update" ON votes
FOR UPDATE
    USING (auth.uid () = user_id);

-- Agregar RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;