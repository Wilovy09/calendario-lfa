-- Agregar columnas de resultado a la tabla games
ALTER TABLE games
ADD COLUMN home_score INTEGER,
ADD COLUMN away_score INTEGER;

-- Política RLS: solo el admin puede actualizar resultados
CREATE POLICY "Admin can update games"
ON games FOR UPDATE
USING (auth.uid() = '07d157cd-571e-47e8-94db-9a6552cd57a0');
