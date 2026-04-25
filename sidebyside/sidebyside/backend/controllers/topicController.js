const Topic = require('../models/Topic');

const getTopics = async (req, res, next) => {
  try {
    const topics = await Topic.find({ isActive: true }).sort({ debateCount: -1 });
    res.json({ topics });
  } catch (err) { next(err); }
};

const createTopic = async (req, res, next) => {
  try {
    const { name, description, icon, color } = req.body;
    const topic = await Topic.create({ name, description, icon, color, creator: req.user._id });
    res.status(201).json({ topic });
  } catch (err) { next(err); }
};

module.exports = { getTopics, createTopic };
