-- Tabla profiles: espejo de auth.users para exponer nombre y avatar
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  avatar_url TEXT
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);

-- Trigger: crea perfil automáticamente cuando un usuario se registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill usuarios existentes
INSERT INTO profiles (id, name, avatar_url)
SELECT
  id,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Vista leaderboard: top usuarios por aciertos
CREATE VIEW leaderboard AS
SELECT
  p.id,
  p.name,
  p.avatar_url,
  COUNT(*) FILTER (WHERE
    (g.home_score > g.away_score AND v.team = 'home') OR
    (g.away_score > g.home_score AND v.team = 'away')
  )::int AS aciertos,
  COUNT(*)::int AS jugados
FROM votes v
JOIN games g ON v.game_id = g.id
JOIN profiles p ON v.user_id = p.id
WHERE g.home_score IS NOT NULL AND g.away_score IS NOT NULL
GROUP BY p.id, p.name, p.avatar_url
ORDER BY aciertos DESC, jugados ASC;
