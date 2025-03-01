-- Echo News Aggregator Database Schema

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- user, moderator, admin
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, suspended, banned
    reputation INTEGER NOT NULL DEFAULT 0,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE
);

-- User Badges Table
CREATE TABLE badges (
    badge_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User-Badge Relationship
CREATE TABLE user_badges (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(badge_id) ON DELETE CASCADE,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
);

-- Categories Table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL
);

-- Tags Table
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL
);

-- Articles Table
CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    source_url VARCHAR(255),
    image_url VARCHAR(255),
    category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
    submitted_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, featured
    moderated_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    moderated_at TIMESTAMP,
    moderation_reason TEXT,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE
);

-- Article-Tag Relationship
CREATE TABLE article_tags (
    article_id INTEGER REFERENCES articles(article_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Votes Table
CREATE TABLE votes (
    vote_id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(article_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL, -- upvote, downvote
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE (article_id, user_id)
);

-- Comments Table
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(article_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    parent_comment_id INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Comment Votes Table
CREATE TABLE comment_votes (
    comment_vote_id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL, -- upvote, downvote
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (comment_id, user_id)
);

-- User Activity Log
CREATE TABLE user_activity (
    activity_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- login, article_submit, vote, comment, etc.
    entity_id INTEGER, -- ID of the related entity (article_id, comment_id, etc.)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Article View History
CREATE TABLE article_views (
    view_id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(article_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- vote, comment, reply, badge, etc.
    entity_id INTEGER, -- ID of the related entity (article_id, comment_id, etc.)
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions Table
CREATE TABLE sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Moderation Log
CREATE TABLE moderation_log (
    log_id SERIAL PRIMARY KEY,
    moderator_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- approve_article, reject_article, ban_user, etc.
    entity_id INTEGER, -- ID of the related entity (article_id, user_id, etc.)
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Saved Articles (Bookmarks)
CREATE TABLE saved_articles (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    article_id INTEGER REFERENCES articles(article_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, article_id)
);

-- User Preferences
CREATE TABLE user_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    theme VARCHAR(20) NOT NULL DEFAULT 'light', -- light, dark
    preferred_categories INTEGER[] DEFAULT '{}',
    preferred_tags INTEGER[] DEFAULT '{}',
    email_digest BOOLEAN NOT NULL DEFAULT FALSE,
    digest_frequency VARCHAR(20) DEFAULT 'daily' -- daily, weekly, monthly
);

-- Create indexes for performance
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_articles_is_featured ON articles(is_featured);
CREATE INDEX idx_votes_article_id ON votes(article_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON article_tags(tag_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_article_views_article_id ON article_views(article_id);

-- Create views for common queries
CREATE VIEW trending_articles AS
SELECT 
    a.*,
    (a.upvotes - a.downvotes) AS score,
    (a.upvotes - a.downvotes) / GREATEST(1, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - a.created_at))/3600) AS trending_score
FROM 
    articles a
WHERE 
    a.status = 'approved'
ORDER BY 
    trending_score DESC;

CREATE VIEW user_stats AS
SELECT 
    u.user_id,
    u.username,
    u.reputation,
    COUNT(DISTINCT a.article_id) AS articles_count,
    COUNT(DISTINCT c.comment_id) AS comments_count,
    COUNT(DISTINCT v.vote_id) AS votes_count
FROM 
    users u
LEFT JOIN 
    articles a ON u.user_id = a.submitted_by AND a.status = 'approved'
LEFT JOIN 
    comments c ON u.user_id = c.user_id AND c.is_deleted = FALSE
LEFT JOIN 
    votes v ON u.user_id = v.user_id
GROUP BY 
    u.user_id, u.username, u.reputation;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_article_vote_counts()
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

CREATE TRIGGER update_article_vote_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_article_vote_counts();

-- Function to update user reputation
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE users SET reputation = reputation + 10 
            FROM articles 
            WHERE users.user_id = articles.submitted_by AND articles.article_id = NEW.article_id;
        ELSIF NEW.vote_type = 'downvote' THEN
            UPDATE users SET reputation = reputation - 2 
            FROM articles 
            WHERE users.user_id = articles.submitted_by AND articles.article_id = NEW.article_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
            UPDATE users SET reputation = reputation - 12 
            FROM articles 
            WHERE users.user_id = articles.submitted_by AND articles.article_id = NEW.article_id;
        ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
            UPDATE users SET reputation = reputation + 12 
            FROM articles 
            WHERE users.user_id = articles.submitted_by AND articles.article_id = NEW.article_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE users SET reputation = reputation - 10 
            FROM articles 
            WHERE users.user_id = articles.submitted_by AND articles.article_id = OLD.article_id;
        ELSIF OLD.vote_type = 'downvote' THEN
            UPDATE users SET reputation = reputation + 2 
            FROM articles 
            WHERE users.user_id = articles.submitted_by AND articles.article_id = OLD.article_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_reputation_trigger
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

-- Initial data for categories
INSERT INTO categories (name, description) VALUES
('Politics', 'Political news and analysis'),
('Technology', 'Technology news and innovations'),
('Environment', 'Environmental news and climate change'),
('Health', 'Health and wellness news'),
('Economy', 'Economic news and analysis'),
('Social Justice', 'Social justice and equality news'),
('Education', 'Education news and policy'),
('International', 'International news and global affairs');

-- Initial data for badges
INSERT INTO badges (name, description, icon_url) VALUES
('New Member', 'Joined the community', '/badges/new-member.png'),
('First Article', 'Submitted first article', '/badges/first-article.png'),
('Popular Contributor', 'Article reached 100 upvotes', '/badges/popular.png'),
('Prolific Writer', 'Submitted 10 articles', '/badges/prolific.png'),
('Engaged Citizen', 'Left 50 comments', '/badges/engaged.png'),
('Trendsetter', 'Article featured on the front page', '/badges/trendsetter.png'); 