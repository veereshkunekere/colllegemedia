const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
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
    console.log("Token verified:", decoded);
    req.user = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};
