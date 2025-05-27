-- Setup script for Forte Card Likes D1 Database
-- Run this script to create the necessary tables

CREATE TABLE IF NOT EXISTS card_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    card_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, card_path)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_card_likes_session_id ON card_likes(session_id);
CREATE INDEX IF NOT EXISTS idx_card_likes_card_path ON card_likes(card_path);
CREATE INDEX IF NOT EXISTS idx_card_likes_created_at ON card_likes(created_at);

-- Optional: Create a view for like counts per card
CREATE VIEW IF NOT EXISTS card_like_counts AS
SELECT 
    card_path,
    COUNT(*) as like_count,
    MAX(created_at) as last_liked
FROM card_likes 
GROUP BY card_path; 