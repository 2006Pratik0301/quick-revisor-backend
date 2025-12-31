const { queryWithRetry } = require("../config/database");
const bcrypt = require("bcrypt");

class User {
  static async findByUsername(username) {
    const result = await queryWithRetry("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await queryWithRetry(
      "SELECT id, username, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  static async create(username, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await queryWithRetry(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
      [username, passwordHash]
    );
    return result.rows[0];
  }

  static async verifyPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
  }
}

module.exports = User;
