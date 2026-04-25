const mongoose = require('mongoose');

const argumentSchema = new mongoose.Schema({
  debate:  { type: mongoose.Schema.Types.ObjectId, ref: 'Debate', required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  side:    { type: String, enum: ['A', 'B'], required: true },

  // Structured argument: claim + explanation + optional sources
  claim:   { type: String, required: true, maxlength: 150 },
  content: { type: String, required: true, maxlength: 2000 },
  sources: { type: [String], default: [] },

  isDeleted:     { type: Boolean, default: false },
  isHighlighted: { type: Boolean, default: false },

  // Fact-check system (replaces up/downvotes for quality signal)
  factChecks: [{
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verdict:   { type: String, enum: ['correct', 'false'] },
    checkedAt: { type: Date, default: Date.now },
  }],
  factScore: { type: Number, default: 0 },

  reports: [{
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason:     { type: String, enum: ['spam', 'hate', 'misinformation', 'off-topic', 'other'] },
    note:       { type: String, maxlength: 300 },
    reportedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Recalculate factScore and update debate strength on save
argumentSchema.pre('save', function (next) {
  const correct = this.factChecks.filter(f => f.verdict === 'correct').length;
  const falseV  = this.factChecks.filter(f => f.verdict === 'false').length;
  this.factScore = correct - falseV;
  next();
});

// Argument quality tier helper
argumentSchema.virtual('qualityTier').get(function () {
  const len = this.content?.length || 0;
  const hasSources = this.sources?.length > 0;
  const netFact = this.factScore;

  let pts = 0;
  if (len >= 50 && len <= 500) pts += 30;
  else if (len > 500) pts += 20;
  else pts += 10;
  if (hasSources) pts += 30;
  pts += Math.min(40, netFact * 10);

  if (pts >= 60) return 'strong';
  if (pts >= 35) return 'moderate';
  return 'weak';
});

argumentSchema.set('toJSON', { virtuals: true });
argumentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Argument', argumentSchema);
