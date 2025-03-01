-- Echo News Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    reputation INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    last_login TIMESTAMP
);

-- Create user_preferences table
CREATE TABLE user_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
    default_view VARCHAR(20) NOT NULL DEFAULT 'trending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create articles table
CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source_url VARCHAR(255),
    category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
    submitted_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create comments table
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(article_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    parent_comment_id INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create tags table
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create article_tags table (many-to-many relationship)
CREATE TABLE article_tags (
    article_id INTEGER REFERENCES articles(article_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Create votes table
CREATE TABLE votes (
    vote_id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(article_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE (article_id, user_id)
);

-- Create notifications table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    entity_id INTEGER,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_activity table
CREATE TABLE user_activity (
    activity_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create badges table
CREATE TABLE badges (
    badge_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_badges table (many-to-many relationship)
CREATE TABLE user_badges (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(badge_id) ON DELETE CASCADE,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);

-- Create indexes for performance
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_submitted_by ON articles(submitted_by);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_votes_article_id ON votes(article_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON article_tags(tag_id);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create views for common queries
CREATE OR REPLACE VIEW trending_articles AS
SELECT 
    a.article_id, a.title, a.description, a.source_url, a.created_at, 
    a.upvotes, a.downvotes, a.views, a.is_featured,
    c.name as category,
    u.username as submitted_by,
    (a.upvotes - a.downvotes) as score,
    (a.upvotes - a.downvotes) / GREATEST(1, EXTRACT(EPOCH FROM (NOW() - a.created_at))/3600) as trending_score
FROM 
    articles a
JOIN 
    categories c ON a.category_id = c.category_id
JOIN 
    users u ON a.submitted_by = u.user_id
WHERE 
    a.status = 'approved'
ORDER BY 
    a.is_featured DESC, trending_score DESC;

-- Create functions and triggers
-- Function to update article vote counts
CREATE OR REPLACE FUNCTION update_article_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE articles SET upvotes = upvotes + 1 WHERE article_id = NEW.article_id;
        ELSIF NEW.vote_type = 'downvote' THEN
            UPDATE articles SET downvotes = downvotes + 1 WHERE article_id = NEW.article_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
            UPDATE articles SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE article_id = NEW.article_id;
        ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
            UPDATE articles SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE article_id = NEW.article_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE articles SET upvotes = upvotes - 1 WHERE article_id = OLD.article_id;
        ELSIF OLD.vote_type = 'downvote' THEN
            UPDATE articles SET downvotes = downvotes - 1 WHERE article_id = OLD.article_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for votes
CREATE TRIGGER votes_trigger
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_article_votes();

-- Function to update user reputation based on votes
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
DECLARE
    article_author_id INTEGER;
BEGIN
    -- Get the article author
    SELECT submitted_by INTO article_author_id FROM articles WHERE article_id = NEW.article_id;
    
    -- Update reputation based on vote type
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE users SET reputation = reputation + 1 WHERE user_id = article_author_id;
        ELSIF NEW.vote_type = 'downvote' THEN
            UPDATE users SET reputation = reputation - 1 WHERE user_id = article_author_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
            UPDATE users SET reputation = reputation - 2 WHERE user_id = article_author_id;
        ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
            UPDATE users SET reputation = reputation + 2 WHERE user_id = article_author_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE users SET reputation = reputation - 1 WHERE user_id = article_author_id;
        ELSIF OLD.vote_type = 'downvote' THEN
            UPDATE users SET reputation = reputation + 1 WHERE user_id = article_author_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user reputation
CREATE TRIGGER user_reputation_trigger
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

-- Insert initial data
-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Technology', 'News about technology, gadgets, and innovation'),
('Politics', 'Political news and current events'),
('Business', 'Business, finance, and economic news'),
('Science', 'Scientific discoveries and research'),
('Health', 'Health, wellness, and medical news'),
('Entertainment', 'Entertainment, movies, music, and celebrity news'),
('Sports', 'Sports news and events'),
('World', 'International news and global events');

-- Insert default badges
INSERT INTO badges (name, description, icon) VALUES
('New Member', 'Awarded when you join the community', 'user-plus'),
('First Article', 'Awarded when you submit your first article', 'newspaper'),
('First Comment', 'Awarded when you post your first comment', 'comment'),
('Popular Article', 'Awarded when one of your articles gets 10+ upvotes', 'fire'),
('Contributor', 'Awarded when you submit 5+ articles', 'pen'),
('Commenter', 'Awarded when you post 10+ comments', 'comments'),
('Influencer', 'Awarded when you reach 100+ reputation', 'star'); 