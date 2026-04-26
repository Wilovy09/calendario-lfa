-- Reemplaza la vista con ranking por porcentaje y sin empates
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id,
  p.name,
  p.avatar_url,
  COUNT(*) FILTER (WHERE
    (g.home_score > g.away_score AND v.team = 'home') OR
    (g.away_score > g.home_score AND v.team = 'away')
  )::int AS aciertos,
  -- Empates no cuentan como jugado (no hay respuesta correcta)
  COUNT(*) FILTER (WHERE g.home_score != g.away_score)::int AS jugados,
  CASE
    WHEN COUNT(*) FILTER (WHERE g.home_score != g.away_score) = 0 THEN 0
    ELSE ROUND(
      COUNT(*) FILTER (WHERE
        (g.home_score > g.away_score AND v.team = 'home') OR
        (g.away_score > g.home_score AND v.team = 'away')
      )::numeric
      / COUNT(*) FILTER (WHERE g.home_score != g.away_score)::numeric * 100
    )::int
  END AS porcentaje
FROM votes v
JOIN games g ON v.game_id = g.id
JOIN profiles p ON v.user_id = p.id
WHERE g.home_score IS NOT NULL AND g.away_score IS NOT NULL
GROUP BY p.id, p.name, p.avatar_url
ORDER BY aciertos DESC, jugados DESC;
