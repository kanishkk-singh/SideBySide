const User   = require('../models/User');
const Debate = require('../models/Debate');
const Argument = require('../models/Argument');

// GET /api/users/:username
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [debates, args] = await Promise.all([
      Debate.find({ creator: user._id, status: 'open' }).populate('topic', 'name icon').limit(5).lean(),
      Argument.find({ author: user._id, isDeleted: false }).populate('debate', 'title').limit(5).lean(),
    ]);

    res.json({ user, recentDebates: debates, recentArguments: args });
  } catch (err) { next(err); }
};

// PATCH /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ user });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile };
