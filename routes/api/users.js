const express = require("express");
const router = express.Router();
const gravatar = require("gravatar"); //can use gravatar
const bcrypt = require("bcryptjs"); //protect password
const jwt = require("jsonwebtoken");
const config = require("config")
const { check, validationResult } = require("express-validator");

const User = require("../../models/User"); //bring shcema in

// @route   POST api/users
// @desc    Register user
// @access  Public

router.post(
  "/",
  [
    check("name", "Name is required") //server side checking
      .not()
      .isEmpty(), //check it's not empty
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req); //if has error save it 
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body; //pull out stuffs

    try {
      //See if user exists
      let user = await User.findOne({ email }); //search by email: email

      if (user) {
        return res
          .status(400) //bad request
          .json({ errors: [{ msg: "User already exists" }] });
      }
      //Get users gravatar base on their email
      const avatar = gravatar.url(email, {
        s: "200", //default size
        r: "pg", //rating, no adult content
        d: "mm" //something for default instead of 404
      });

      user = new User({
        //create a instance
        name,
        email,
        avatar,
        password
      });

      //Encrypt password by bcrypt
      const salt = await bcrypt.genSalt(10); //do the hashing, 10 is enough for security

      user.password = await bcrypt.hash(password, salt); //encrypt

      await user.save(); //save to the database

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
