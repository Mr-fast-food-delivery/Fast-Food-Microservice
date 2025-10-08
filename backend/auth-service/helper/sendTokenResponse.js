const RefreshToken = require("../models/refreshToken");
const { generateTokenWithPermissions } = require("../utils/jwtUtils");
const { getPermissionsForRole } = require("../utils/permissions");

// Helper function to send token response with refresh token
const sendTokenResponse = async (user, statusCode, req, res) => {
  // Generate access token with permissions
  const accessToken = generateTokenWithPermissions(user);

  // Create access token cookie options
  const accessTokenOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Generate refresh token
  const refreshTokenOptions = {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    expiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const refreshTokenObj = await RefreshToken.generateToken(
    user._id,
    refreshTokenOptions
  );

  // Create refresh token cookie options
  const refreshTokenCookieOptions = {
    expires: refreshTokenObj.expiresAt,
    httpOnly: true,
    path: "/api/auth/refresh", // Only sent to the refresh endpoint
  };

  // Add secure flag in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenCookieOptions.secure = true;
  }

  // Get all permissions for this user
  const rolePermissions = getPermissionsForRole(user.userType);
  const allPermissions = [
    ...new Set([...rolePermissions, ...(user.customPermissions || [])]),
  ];

  res
    .status(statusCode)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshTokenObj.token, refreshTokenCookieOptions)
    .json({
      success: true,
      accessToken,
      refreshToken: refreshTokenObj.token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        permissions: allPermissions,
      },
    });
};

module.exports = { sendTokenResponse };
