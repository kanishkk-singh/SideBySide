const router = require('express').Router();
const {
  getArguments, postArgument, factCheckArgument, reportArgument, deleteArgument,
} = require('../controllers/argumentController');
const { protect } = require('../middleware/auth');

router.get('/',    getArguments);
router.post('/',   protect, postArgument);
router.post('/:id/factcheck', protect, factCheckArgument);
router.post('/:id/report',    protect, reportArgument);
router.delete('/:id',         protect, deleteArgument);

module.exports = router;
