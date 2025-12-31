const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  getQuestionsBySubject,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

router.use(authenticate);

router.get('/subject/:subjectId', getQuestionsBySubject);
router.get('/:id', getQuestionById);
router.post('/subject/:subjectId', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;

