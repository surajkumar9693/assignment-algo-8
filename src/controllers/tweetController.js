const tweetModel = require("../models/tweetModel");
const userModel = require("../models/userModel");
const check = require("../utils/validator");

const tweets = async (req, res) => {
  try {
    const { text, user } = req.body;

    if (!user) {
      return res.status(400).send({ status: false, msg: "user not present" });
    }
    if (!check.isValidObjectId(user)) {
      return res
        .status(400)
        .send({ status: false, message: "given user is not valid" });
    }

    let findUser = await userModel.findOne({ _id: user, isDeleted: false });
    if (!findUser) {
      return res
        .status(404)
        .send({ status: false, message: "user not found or already delete" });
    }

    const tweet = await tweetModel.create(req.body);
    return res
      .status(200)
      .send({ status: true, message: "User sucessfully tweet", data: tweet });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ status: false, Error: error.message })
  }
};

const like = async (req, res) => {
  try {
    const tweet = await tweetModel.findById(req.params.id);
    if (!tweet.likes.includes(req.body.userId)) {
      let liketweet = await tweetModel.updateOne({
        $push: { likes: req.body.userId },
      });
      return res
        .status(200)
        .send({
          status: true,
          message: "The tweet has been liked",
          data: liketweet,
        });
    } else {
      let liketweet = await tweetModel.updateOne({
        $pull: { likes: req.body.userId },
      });
      return res
        .status(200)
        .send({
          status: true,
          message: "The tweet has been disliked",
          data: liketweet,
        });
    }
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message })
  }
};

module.exports = { tweets,like };
