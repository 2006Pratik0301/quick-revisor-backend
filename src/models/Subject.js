const pool = require('../config/database');

class Subject {
  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM subjects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await pool.query(
      'SELECT * FROM subjects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }

  static async create(userId, year, name, relatedQuestion) {
    const result = await pool.query(
      'INSERT INTO subjects (user_id, year, name, related_question) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, year, name, relatedQuestion]
    );
    return result.rows[0];
  }

  static async update(id, userId, year, name, relatedQuestion) {
    const result = await pool.query(
      'UPDATE subjects SET year = $1, name = $2, related_question = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [year, name, relatedQuestion, id, userId]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM subjects WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  }
}

module.exports = Subject;

