const router = require('express').Router();
const { getDebates, getDebate, createDebate, castVote } = require('../controllers/debateController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/',    optionalAuth, getDebates);
router.get('/:id', optionalAuth, getDebate);
router.post('/',   protect, createDebate);
router.post('/:id/vote', protect, castVote);

module.exports = router;
