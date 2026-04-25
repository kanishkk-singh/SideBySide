const Debate   = require('../models/Debate');
const Topic    = require('../models/Topic');
const Argument = require('../models/Argument');

// GET /api/debates?topic=&tag=&status=&sort=&page=&limit=&search=
const getDebates = async (req, res, next) => {
  try {
    const { topic, tag, status = 'open', sort = 'createdAt', page = 1, limit = 20, search } = req.query;
    const filter = { status };
    if (topic)  filter.topic = topic;
    if (tag)    filter.tags  = tag;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const sortMap = {
      createdAt: { createdAt: -1 },
      hot:       { views: -1 },
      votes:     { totalVotes: -1 },
    };

    const [debates, total] = await Promise.all([
      Debate.find(filter)
        .populate('creator', 'username avatar')
        .populate('topic', 'name slug icon color')
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Debate.countDocuments(filter),
    ]);

    res.json({ debates, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/debates/:id
const getDebate = async (req, res, next) => {
  try {
    const debate = await Debate.findById(req.params.id)
      .populate('creator', 'username avatar reputation')
      .populate('topic', 'name slug icon color');
    if (!debate) return res.status(404).json({ message: 'Debate not found' });

    await Debate.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    let d = debate.toObject({ virtuals: true });

    // Anti-bias: hide vote counts if user hasn't picked a side
    if (debate.hideVotesUntilSided) {
      const userVote = req.user
        ? debate.votes.find(v => v.user.toString() === req.user._id.toString())
        : null;
      if (!userVote) {
        d.sideA = { ...d.sideA, voteCount: null };
        d.sideB = { ...d.sideB, voteCount: null };
        d.totalVotes = null;
        d.votesHidden = true;
      }
    }

    // Attach user's vote if logged in
    if (req.user) {
      const uv = debate.votes.find(v => v.user.toString() === req.user._id.toString());
      d.userVote = uv ? uv.side : null;
    }

    res.json({ debate: d });
  } catch (err) { next(err); }
};

// POST /api/debates
const createDebate = async (req, res, next) => {
  try {
    const { title, description, topicId, sideA, sideB, tags, hideVotesUntilSided, closesAfterDays } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const debate = await Debate.create({
      title, description,
      topic:    topicId,
      creator:  req.user._id,
      sideA, sideB, tags,
      hideVotesUntilSided: hideVotesUntilSided ?? true,
      closesAfterDays:     closesAfterDays ?? 7,
    });

    await Topic.findByIdAndUpdate(topicId, { $inc: { debateCount: 1 } });

    const populated = await debate.populate([
      { path: 'creator', select: 'username avatar' },
      { path: 'topic',   select: 'name slug icon color' },
    ]);

    res.status(201).json({ debate: populated });
  } catch (err) { next(err); }
};

// POST /api/debates/:id/vote  — body: { side: 'A'|'B' }
const castVote = async (req, res, next) => {
  try {
    const { side } = req.body;
    if (!['A', 'B'].includes(side)) return res.status(400).json({ message: 'side must be A or B' });

    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ message: 'Debate not found' });
    if (debate.status !== 'open') return res.status(400).json({ message: 'Debate is closed' });

    const existing = debate.votes.find(v => v.user.toString() === req.user._id.toString());
    if (existing) {
      if (existing.side === side) return res.json({ message: 'Already voted for this side', debate });
      // Change vote
      debate[`side${existing.side}`].voteCount -= 1;
      existing.side = side;
    } else {
      debate.votes.push({ user: req.user._id, side });
      debate.totalVotes += 1;
    }
    debate[`side${side}`].voteCount += 1;
    await debate.save();

    res.json({
      message:     'Vote recorded',
      totalVotes:  debate.totalVotes,
      sideA:       debate.sideA,
      sideB:       debate.sideB,
      userVote:    side,
    });
  } catch (err) { next(err); }
};

module.exports = { getDebates, getDebate, createDebate, castVote };
