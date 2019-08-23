const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); //protect password\
const auth = require("../../middleware/auth")
const jwt = require("jsonwebtoken");
const config = require("config")
const { check, validationResult } = require("express-validator");


const User = require("../../models/User")

// @route   GET api/auth
// @desc    Test route
// @access  Public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');//get back the data without password
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}); 
//After added auth and then it makes this route protected


// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password","Password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req); //if has error save it 
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; //pull out stuffs

    try {
      //See if user exists
      let user = await User.findOne({ email }); //search by email: email

      if (!user) {
        return res
          .status(400) //bad request
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
     
      const isMatch = await bcrypt.compare(password, user.password)

      if(!isMatch) {
        return res
          .status(400) 
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //Return jsonwebtoken 
      const payload = { //get the payload included user id
        user: {
          id: user.id // mongoose use id instead of _id
        }
      }

      jwt.sign(payload, config.get('jwtSecret'),
        {expiresIn: 360000 }, 
        (err, token) => { //if no error, send hashed token back to the client
          if(err) throw err;
          res.json({ token });
        }
      );

    } catch (err) { //handle error
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
