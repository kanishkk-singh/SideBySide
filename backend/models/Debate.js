const mongoose = require('mongoose');

const debateSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, minlength: 10, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  topic:       { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  creator:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags:        { type: [String], default: [] },
  status:      { type: String, enum: ['open', 'closed', 'archived'], default: 'open' },

  // Always exactly 2 sides: Side A and Side B
  sideA: {
    label:       { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: '', maxlength: 300 },
    voteCount:   { type: Number, default: 0 },
  },
  sideB: {
    label:       { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: '', maxlength: 300 },
    voteCount:   { type: Number, default: 0 },
  },

  // Anti-bias: user must pick a side before seeing vote distribution
  hideVotesUntilSided: { type: Boolean, default: true },

  closesAfterDays: { type: Number, default: 7 },
  closesAt:        { type: Date },

  // { user, side: 'A'|'B' }
  votes: [{
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    side:    { type: String, enum: ['A', 'B'], required: true },
    votedAt: { type: Date, default: Date.now },
  }],

  totalVotes:     { type: Number, default: 0 },
  totalArguments: { type: Number, default: 0 },
  views:          { type: Number, default: 0 },
  isPinned:       { type: Boolean, default: false },

  // Computed argument strength scores (recalculated on arg events)
  strengthScoreA: { type: Number, default: 0 },
  strengthScoreB: { type: Number, default: 0 },
}, { timestamps: true });

debateSchema.pre('save', function (next) {
  if ((this.isNew || this.isModified('closesAfterDays')) && this.closesAfterDays > 0) {
    const d = new Date();
    d.setDate(d.getDate() + this.closesAfterDays);
    this.closesAt = d;
  }
  next();
});

// Recalculate strength scores from arguments
debateSchema.methods.recalculateStrength = async function () {
  const Argument = mongoose.model('Argument');

  const calcScore = async (side) => {
    const args = await Argument.find({ debate: this._id, side, isDeleted: false });
    if (!args.length) return 0;

    let total = 0;
    for (const arg of args) {
      let pts = 0;
      // Logic clarity: based on content length (reasonable argument = 50-500 chars sweet spot)
      const len = arg.content.length;
      if (len >= 50 && len <= 500) pts += 30;
      else if (len > 500) pts += 20;
      else pts += 10;
      // Evidence: sources cited
      if (arg.sources && arg.sources.length > 0) pts += 30;
      // Engagement: fact checks + replies
      const correct = arg.factChecks.filter(f => f.verdict === 'correct').length;
      const falseV  = arg.factChecks.filter(f => f.verdict === 'false').length;
      pts += Math.min(40, correct * 10 - falseV * 8);
      total += Math.max(0, pts);
    }
    return Math.min(100, Math.round(total / args.length));
  };

  this.strengthScoreA = await calcScore('A');
  this.strengthScoreB = await calcScore('B');
  await this.save();
};

module.exports = mongoose.model('Debate', debateSchema);
