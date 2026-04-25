const mongoose = require('mongoose');

// A "Topic" is a category like Technology, Politics, Science etc.
const topicSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true, maxlength: 60 },
  slug:        { type: String, unique: true, lowercase: true },
  description: { type: String, required: true, maxlength: 400 },
  icon:        { type: String, default: '◈' },
  color:       { type: String, default: '#1A5EFF' },
  debateCount: { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  creator:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

topicSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Topic', topicSchema);
