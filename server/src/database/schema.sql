-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Calculation trees table
CREATE TABLE IF NOT EXISTS calculation_trees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  starting_number REAL NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Calculation nodes table
CREATE TABLE IF NOT EXISTS calculation_nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tree_id INTEGER NOT NULL,
  parent_node_id INTEGER,
  operation TEXT,
  right_argument REAL,
  result REAL NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tree_id) REFERENCES calculation_trees(id),
  FOREIGN KEY (parent_node_id) REFERENCES calculation_nodes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for foreign keys and frequently queried columns
CREATE INDEX IF NOT EXISTS idx_calculation_trees_user_id ON calculation_trees(user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_nodes_tree_id ON calculation_nodes(tree_id);
CREATE INDEX IF NOT EXISTS idx_calculation_nodes_parent_node_id ON calculation_nodes(parent_node_id);
CREATE INDEX IF NOT EXISTS idx_calculation_nodes_user_id ON calculation_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
