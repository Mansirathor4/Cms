const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: String, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'coordinator', 'divisionHead', 'assignee'],
    required: true
  },
  division: {
    type: String,
    enum: ['Electrical', 'Civil', 'Computer', 'Mechanical', 'Plumbing and Water', 'Electronics'],
    default: null
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Check if the model already exists before defining it
module.exports = mongoose.models.user || mongoose.model('User', userSchema);