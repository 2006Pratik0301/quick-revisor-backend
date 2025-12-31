const Question = require('../models/Question');

const getQuestionsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const questions = await Question.findBySubjectId(subjectId, req.userId);
    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id, req.userId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { topic, question_text, answer_text } = req.body;

    if (!question_text || !answer_text) {
      return res.status(400).json({ error: 'Question text and answer text are required' });
    }

    const question = await Question.create(subjectId, topic, question_text, answer_text);
    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, question_text, answer_text } = req.body;

    if (!question_text || !answer_text) {
      return res.status(400).json({ error: 'Question text and answer text are required' });
    }

    const question = await Question.update(id, req.userId, topic, question_text, answer_text);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.delete(id, req.userId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getQuestionsBySubject,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};

