const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.cookies.token;
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
