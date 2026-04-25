const Argument = require('../models/Argument');
const Debate   = require('../models/Debate');
const User     = require('../models/User');

const adjustRep = (userId, delta) =>
  User.findByIdAndUpdate(userId, { $inc: { reputation: delta } });

// GET /api/arguments?debateId=&side=&sort=
const getArguments = async (req, res, next) => {
  try {
    const { debateId, side, sort = 'factScore', page = 1, limit = 50 } = req.query;
    if (!debateId) return res.status(400).json({ message: 'debateId required' });

    const filter = { debate: debateId, isDeleted: false };
    if (side) filter.side = side;

    const sortMap = { factScore: { factScore: -1 }, new: { createdAt: -1 } };

    const args = await Argument.find(filter)
      .populate('author', 'username avatar reputation')
      .sort(sortMap[sort] || { factScore: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ arguments: args });
  } catch (err) { next(err); }
};

// POST /api/arguments
const postArgument = async (req, res, next) => {
  try {
    const { debateId, side, claim, content, sources } = req.body;

    if (!['A', 'B'].includes(side)) return res.status(400).json({ message: 'side must be A or B' });
    if (!claim?.trim())   return res.status(400).json({ message: 'claim is required' });
    if (!content?.trim()) return res.status(400).json({ message: 'content is required' });

    const debate = await Debate.findById(debateId);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    if (debate.status !== 'open') return res.status(400).json({ message: 'Debate is closed' });

    // Must have voted for that side
    const userVote = debate.votes.find(v => v.user.toString() === req.user._id.toString());
    if (!userVote) return res.status(403).json({ message: 'Choose a side before posting' });
    if (userVote.side !== side) return res.status(403).json({ message: 'You can only argue for your chosen side' });

    // One argument per user per debate
    const existing = await Argument.findOne({ debate: debateId, author: req.user._id, isDeleted: false });
    if (existing) return res.status(409).json({ message: 'You already have an argument in this debate' });

    const arg = await Argument.create({
      debate: debateId, author: req.user._id, side, claim, content, sources: sources || [],
    });

    await Debate.findByIdAndUpdate(debateId, { $inc: { totalArguments: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { argumentsPosted: 1 } });

    // Recalculate strength scores
    const fullDebate = await Debate.findById(debateId);
    await fullDebate.recalculateStrength();

    const populated = await arg.populate('author', 'username avatar reputation');
    res.status(201).json({ argument: populated });
  } catch (err) { next(err); }
};

// POST /api/arguments/:id/factcheck  — body: { verdict: 'correct'|'false' }
const factCheckArgument = async (req, res, next) => {
  try {
    const { verdict } = req.body;
    if (!['correct', 'false'].includes(verdict))
      return res.status(400).json({ message: 'verdict must be correct or false' });

    const arg = await Argument.findById(req.params.id);
    if (!arg || arg.isDeleted) return res.status(404).json({ message: 'Argument not found' });
    if (arg.author.toString() === req.user._id.toString())
      return res.status(403).json({ message: 'Cannot fact-check your own argument' });

    const existing = arg.factChecks.find(f => f.checkedBy.toString() === req.user._id.toString());

    if (existing) {
      if (existing.verdict === verdict) {
        // Toggle off
        arg.factChecks = arg.factChecks.filter(f => f.checkedBy.toString() !== req.user._id.toString());
        await arg.save();
        await adjustRep(arg.author, verdict === 'correct' ? -10 : 10);
      } else {
        // Flip
        const undo = existing.verdict === 'correct' ? -10 : 10;
        existing.verdict = verdict;
        existing.checkedAt = new Date();
        await arg.save();
        await adjustRep(arg.author, undo + (verdict === 'correct' ? 10 : -10));
      }
    } else {
      arg.factChecks.push({ checkedBy: req.user._id, verdict });
      await arg.save();
      await adjustRep(arg.author, verdict === 'correct' ? 10 : -10);
    }

    // Recalculate debate strength
    const debate = await Debate.findById(arg.debate);
    if (debate) await debate.recalculateStrength();

    res.json({ factScore: arg.factScore, factChecks: arg.factChecks, qualityTier: arg.qualityTier });
  } catch (err) { next(err); }
};

// POST /api/arguments/:id/report
const reportArgument = async (req, res, next) => {
  try {
    const { reason, note } = req.body;
    const arg = await Argument.findById(req.params.id);
    if (!arg) return res.status(404).json({ message: 'Argument not found' });

    const already = arg.reports.some(r => r.reportedBy.toString() === req.user._id.toString());
    if (already) return res.status(409).json({ message: 'Already reported' });

    arg.reports.push({ reportedBy: req.user._id, reason, note });
    await arg.save();
    res.json({ message: 'Reported. Moderators will review.' });
  } catch (err) { next(err); }
};

// DELETE /api/arguments/:id  (admin only)
const deleteArgument = async (req, res, next) => {
  try {
    const arg = await Argument.findById(req.params.id);
    if (!arg) return res.status(404).json({ message: 'Argument not found' });

    const isOwner = arg.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorised' });

    arg.isDeleted = true;
    await arg.save();

    const debate = await Debate.findById(arg.debate);
    if (debate) {
      await Debate.findByIdAndUpdate(arg.debate, { $inc: { totalArguments: -1 } });
      await debate.recalculateStrength();
    }

    res.json({ message: 'Argument deleted' });
  } catch (err) { next(err); }
};

module.exports = { getArguments, postArgument, factCheckArgument, reportArgument, deleteArgument };
