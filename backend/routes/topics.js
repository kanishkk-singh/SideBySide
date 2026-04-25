const router = require('express').Router();
const { getTopics, createTopic } = require('../controllers/topicController');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/',  getTopics);
router.post('/', protect, requireAdmin, createTopic);

module.exports = router;
