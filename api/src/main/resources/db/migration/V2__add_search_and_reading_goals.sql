-- Permite buscar "memorias" e encontrar "Memórias"
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE reading_goals (
    id        UUID PRIMARY KEY,
    user_id   UUID NOT NULL REFERENCES users (id),
    goal_year INTEGER NOT NULL,
    target    INTEGER NOT NULL,
    UNIQUE (user_id, goal_year)
);
