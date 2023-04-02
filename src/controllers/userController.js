const userModel = require("../models/userModel");
const check = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')

const createUser = async function (req, res) {
  try {
    let data = req.body;
    if (!check.isValidRequestBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter data to create user" });
    }
    let { fullname, username, email, password, phone } = data;

    if (!fullname) {
      return res
        .status(400)
        .send({ status: false, message: "fullname is mandatory" });
    }
    if (!check.isValidname(fullname)) {
      return res
        .status(400)
        .send({ status: false, message: "fullname should be in Alphabets" });
    }
    if (!username) {
      return res
        .status(400)
        .send({ status: false, message: "usernamename is mandatory" });
    }
    if (!check.isValidUserName(username)) {
      return res
        .status(400)
        .send({ status: false, message: "fullname should be valid" });
    }

    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "email is mandatory" });
    }
    if (!check.isVAlidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email should be valid" });
    }
    let checkEmail = await userModel.findOne({ email });
    if (checkEmail)
      return res
        .status(400)
        .send({ status: false, message: "This email is already registered" });

    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Password is mandatory" });
    }
    if (!check.isValidPassword(password)) {
      return res
        .status(400)
        .send({ status: false, message: "Password should be valid" });
    }
    const encryptedPassword = await bcrypt.hash(password, 10); //salt round is used to make password more secured and by adding a string of 32 or more characters and then hashing them

    if (!phone) {
      return res
        .status(400)
        .send({ status: false, message: "Phone is mandatory" });
    }
    if (!check.isValidPhone(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Phone should be valid" });
    }
    let checkPhone = await userModel.findOne({ phone });
    if (checkPhone)
      return res
        .status(400)
        .send({ status: false, message: "This Phone is already registered" });

    const userDetails = {
      fullname,
      username,
      email,
      phone,
      password: encryptedPassword,
    };
    const newUser = await userModel.create(userDetails);
    return res
      .status(201)
      .send({
        status: true,
        message: "User created successfully",
        data: newUser,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};
//==========================================================================================================================================

const userLogin = async function (req, res) {
  try {
    let data = req.body;
    const { username, phone, email, password } = data;

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .send({ status: false, message: "please provide some data" });
    }

    let user = await userModel.findOne({
      $or: [{ email }, { phone }, { username }],
    });
    if (!user)
      return res
        .status(400)
        .send({ status: false, message: "credentials is wrong" });

    let hashedPassword = await bcrypt.compare(password, user.password);
    if (!hashedPassword)
      return res
        .status(400)
        .send({ status: false, message: "password is incorrect" });

    let token = jwt.sign(
      {
        userId: user._id,
      },
      "algo-8",
      { expiresIn: "24hr" }
    );

    return res
      .status(201)
      .send({
        status: true,
        message: "token created successfully",
        data: token,
      });
  } catch (error) {
    res.status(500).send({ status: false, Error: error.message });
  }
};

//============================================== reset-password ==============================================================
const resetpassword = async function (req, res) {
  const { email } = req.body;
  let user = await userModel.findOne({ email });

  if (user) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your-email@gmail.com",
        pass: "your-password",
      },
    });
    const mailOptions = {
      from: "your-email@gmail.com",
      to: email,
      subject: "Password reset request",
      text: `Hi ${user.username},\n\nPlease click the following link to reset your password`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.send("Please check your email to reset your password.");
  } else {
    res.send("Invalid");
  }
};
//============================================== Get user ==============================================================

const getUser = async function (req, res) {
  try {
    let data = req.params.userId;
    if (!data) {
      return res.status(400).send({ status: false, msg: "userId not present" });
    }
    if (!mongoose.isValidObjectId(data)) {
      return res
        .status(400)
        .send({ status: false, message: " invalid userId length" });
    }
    let allUsers = await userModel.findById({ _id: data });
    if (!allUsers) {
      return res.status(404).send({ status: false, message: "user not found" });
    } else {
      return res
        .status(200)
        .send({
          status: true,
          message: "User profile details",
          data: allUsers,
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

//---------------------------Delete user-------------------------------------

const deleteuser = async function (req, res) {
  try {
    let UserId = req.params.userId;
    if (!UserId) {
      return res.status(400).send({ status: false, msg: "UserId not present" });
    }
    if (!check.isValidObjectId(UserId)) {
      return res
        .status(400)
        .send({ status: false, message: "given UserId is not valid" });
    }

    let findUser = await userModel.findOne({ _id: UserId, isDeleted: false });
    if (!findUser) {
      return res
        .status(404)
        .send({ status: false, message: "user not found or already delete" });
    }
    let deleteduser = await userModel.findOneAndUpdate(
      { _id: UserId },
      { $set: { isDeleted: true } },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: "User sucessfully deleted" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//---------------------------  follow user-------------------------------------

const followUser = async function (req, res) {
    if (req.body.userId !== req.params.id) {
        try {
          const user = await userModel.findById(req.params.id);
          const currentUser = await userModel.findById(req.body.userId);
          if (!user.followers.includes(req.body.userId)) {
            await user.updateOne({ $push: { followers: req.body.userId } });
            await currentUser.updateOne({ $push: { followings: req.params.id } });
            res.status(200).json("user has been followed");
          } else {
            res.status(403).json("you allready follow this user");
          }
        } catch (err) {
          res.status(500).json(err);
        }
      } else {
        res.status(403).json("you cant follow yourself");
      }
};

//---------------------------  unfollow  user-------------------------------------

const unfollowUser = async function (req, res) {
    if (req.body.userId !== req.params.id) {
        try {
          const user = await userModel.findById(req.params.id);
          const currentUser = await userModel.findById(req.body.userId);
          if (user.followers.includes(req.body.userId)) {
            await user.updateOne({ $pull: { followers: req.body.userId } });
            await currentUser.updateOne({ $pull: { followings: req.params.id } });
            res.status(200).json("user has been unfollowed");
          } else {
            res.status(403).json("you dont follow this user");
          }
        } catch (err) {
          res.status(500).json(err);
        }
      } else {
        res.status(403).json("you cant unfollow yourself");
      }
};

module.exports = {
  createUser,
  userLogin,
  resetpassword,
  getUser,
  deleteuser,
  followUser,
  unfollowUser,
};
