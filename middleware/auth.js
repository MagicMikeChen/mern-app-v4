const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) { 
  // middleware handle things and need "next" to pass down
  // Get the token from header
  const token = req.header('x-auth-token');

  //check if no token
  if(!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user; //can use the protect route
    next();
  } catch(err) {
    res.status(401).json({ msg: 'Token is not valid' }) // if token is not valid
  }
}