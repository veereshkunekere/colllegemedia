const jwt = require('jsonwebtoken');
const User = require('../models/user.models');

module.exports = async function (req, res, next) {
  const cookieToken = req.cookies.token;
  const bearerToken =
  req.headers.authorization?.split(
    " "
  )[1];
  const token = cookieToken || bearerToken;
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: 'Unauthorized' })
  };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reject tokens issued before the user's last password change — this is
    // what logs out any other sessions once a password reset completes.
    const user = await User.findById(decoded.id).select("passwordChangedAt");
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (user.passwordChangedAt) {
      const tokenIssuedAt = decoded.iat * 1000; // jwt iat is in seconds
      if (tokenIssuedAt < user.passwordChangedAt.getTime()) {
        return res.status(401).json({ message: 'Session expired, please log in again' });
      }
    }

    req.user = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};