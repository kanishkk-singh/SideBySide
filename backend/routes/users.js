const router = require('express').Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:username', getProfile);
router.patch('/me',      protect, updateProfile);

module.exports = router;
