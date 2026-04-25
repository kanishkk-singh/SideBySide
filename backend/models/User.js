const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username:        { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:        { type: String, required: true, minlength: 6, select: false },
  bio:             { type: String, maxlength: 300, default: '' },
  avatar:          { type: String, default: '' },
  role:            { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  reputation:      { type: Number, default: 0 },
  debatesCreated:  { type: Number, default: 0 },
  argumentsPosted: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
