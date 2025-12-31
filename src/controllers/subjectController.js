const Subject = require('../models/Subject');

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findByUserId(req.userId);
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    
    // Check if it's a connection error
    const isConnectionError = 
      error.message?.toLowerCase().includes('connection terminated') ||
      error.message?.toLowerCase().includes('timeout') ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET';
    
    if (isConnectionError) {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check your connection settings or use the connection pooler.'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id, req.userId);

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createSubject = async (req, res) => {
  try {
    const { year, name, related_question } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Subject name is required' });
    }

    const subject = await Subject.create(req.userId, year, name, related_question);
    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    
    // Check if it's a connection error
    const isConnectionError = 
      error.message?.toLowerCase().includes('connection terminated') ||
      error.message?.toLowerCase().includes('timeout') ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET';
    
    if (isConnectionError) {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check your connection settings or use the connection pooler.',
        details: 'See server logs for connection troubleshooting steps'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, name, related_question } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Subject name is required' });
    }

    const subject = await Subject.update(id, req.userId, year, name, related_question);

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.delete(id, req.userId);

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};

