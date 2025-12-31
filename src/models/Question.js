const { queryWithRetry } = require('../config/database');

class Question {
  static async findBySubjectId(subjectId, userId) {
    const result = await queryWithRetry(
      `SELECT q.* FROM questions q
       INNER JOIN subjects s ON q.subject_id = s.id
       WHERE q.subject_id = $1 AND s.user_id = $2
       ORDER BY q.created_at DESC`,
      [subjectId, userId]
    );
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await queryWithRetry(
      `SELECT q.* FROM questions q
       INNER JOIN subjects s ON q.subject_id = s.id
       WHERE q.id = $1 AND s.user_id = $2`,
      [id, userId]
    );
    return result.rows[0];
  }

  static async create(subjectId, topic, questionText, answerText) {
    const result = await queryWithRetry(
      'INSERT INTO questions (subject_id, topic, question_text, answer_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [subjectId, topic, questionText, answerText]
    );
    return result.rows[0];
  }

  static async update(id, userId, topic, questionText, answerText) {
    // First verify the question belongs to the user
    const question = await this.findById(id, userId);
    if (!question) {
      return null;
    }

    const result = await queryWithRetry(
      'UPDATE questions SET topic = $1, question_text = $2, answer_text = $3 WHERE id = $4 RETURNING *',
      [topic, questionText, answerText, id]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    // First verify the question belongs to the user
    const question = await this.findById(id, userId);
    if (!question) {
      return null;
    }

    const result = await queryWithRetry(
      'DELETE FROM questions WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Question;

