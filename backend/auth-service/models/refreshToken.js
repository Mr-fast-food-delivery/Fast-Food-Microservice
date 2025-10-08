const mongoose = require("mongoose");
const crypto = require("crypto");

const RefreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userAgent: {
    type: String,
    required: false,
  },
  ip: {
    type: String,
    required: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster queries
RefreshTokenSchema.index({ user: 1 });
RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ expiresAt: 1 });

// Generate a new refresh token
RefreshTokenSchema.statics.generateToken = async function (
  userId,
  options = {}
) {
  const expiresIn = options.expiresIn || 30 * 24 * 60 * 60 * 1000; // 30 days by default
  const token = crypto.randomBytes(40).toString("hex");

  const refreshToken = await this.create({
    token,
    user: userId,
    userAgent: options.userAgent,
    ip: options.ip,
    expiresAt: new Date(Date.now() + expiresIn),
  });

  return refreshToken;
};

// Find a valid token
okenSchema.statics.findValidToken = async function (token) {
  return this.findOne({
    token,
    expiresAt: { $gt: Date.now() },
    isRevoked: false,
  }).populate("user");
};

// Revoke a token
RefreshTokenSchema.statics.revokeToken = async function (token) {
  return this.findOneAndUpdate({ token }, { isRevoked: true }, { new: true });
};

// Revoke all tokens for a user
RefreshTokenSchema.statics.revokeAllUserTokens = async function (userId) {
  return this.updateMany(
    { user: userId, isRevoked: false },
    { isRevoked: true }
  );
};

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
