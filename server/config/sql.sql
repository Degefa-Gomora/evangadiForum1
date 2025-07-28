-- Create users table
CREATE TABLE IF NOT EXISTS users (
  userid INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(20) NOT NULL UNIQUE,
  firstname VARCHAR(20) NOT NULL,
  lastname VARCHAR(20) NOT NULL,
  email VARCHAR(40) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(2048) DEFAULT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255) UNIQUE,
  token_expires_at DATETIME,
  reset_password_token VARCHAR(255) UNIQUE,
  reset_password_expires DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create answers table (depends on users)
CREATE TABLE IF NOT EXISTS answers (
  answerid INT AUTO_INCREMENT PRIMARY KEY,
  userid INT NOT NULL,
  questionid VARCHAR(100) NOT NULL,
  answer TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  rating_count INT DEFAULT 0,
  upvote_count INT DEFAULT 0,
  downvote_count INT DEFAULT 0,
  FOREIGN KEY(userid) REFERENCES users(userid) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create questions table (depends on users, optionally answers for solution_answer_id)
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  questionid VARCHAR(100) NOT NULL UNIQUE,
  userid INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  tag VARCHAR(20),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  solution_answer_id INT NULL,
  FOREIGN KEY(userid) REFERENCES users(userid) ON DELETE CASCADE,
  FOREIGN KEY(solution_answer_id) REFERENCES answers(answerid) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create answer_ratings table (depends on answers, users)
CREATE TABLE IF NOT EXISTS answer_ratings (
  ratingid INT AUTO_INCREMENT PRIMARY KEY,
  answerid INT NOT NULL,
  userid INT NOT NULL,
  vote_type TINYINT NOT NULL, -- 1 for upvote, -1 for downvote
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (answerid, userid),
  FOREIGN KEY (answerid) REFERENCES answers(answerid) ON DELETE CASCADE,
  FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create chat_history table (depends on users)
CREATE TABLE IF NOT EXISTS chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  userid INT NULL,
  role ENUM('user', 'model') NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create chat_messages table (depends on users)
CREATE TABLE IF NOT EXISTS chat_messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  userid INT NULL,
  username VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(2048) DEFAULT NULL,
  message_text TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  room_id VARCHAR(255) NOT NULL,
  message_type ENUM('public', 'private') NOT NULL DEFAULT 'public',
  recipient_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  reactions JSON NULL,
  file_data LONGTEXT NULL,
  file_name VARCHAR(255) NULL,
  file_type VARCHAR(50) NULL,
  audio_data LONGTEXT NULL,
  audio_type VARCHAR(50) NULL,
  audio_duration INTEGER NULL,
  FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE SET NULL,
  FOREIGN KEY (recipient_id) REFERENCES users(userid) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
