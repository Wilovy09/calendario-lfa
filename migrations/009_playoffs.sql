-- week nullable: playoff games have no week number
ALTER TABLE games ALTER COLUMN week DROP NOT NULL;

-- game type: 'regular' or 'playoff'
ALTER TABLE games ADD COLUMN game_type TEXT NOT NULL DEFAULT 'regular';

-- round name: 'Semifinales', 'Final', etc. (null for regular season)
ALTER TABLE games ADD COLUMN round TEXT;

-- flashscore match ID for reliable lookup and deduplication
ALTER TABLE games ADD COLUMN flashscore_mid TEXT UNIQUE;
