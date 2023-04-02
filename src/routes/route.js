const express = require("express")
const router = express.Router()
const { createUser, userLogin ,resetpassword,followUser,unfollowUser,getUser,deleteuser} = require("../controllers/userController")
const {tweets,like} = require("../controllers/tweetController")


const {authentication, authorisation }= require("../middleware/auth")

router.get("/test-me", (req, res) => {
    res.send("first api")
})

router.post("/register", createUser)

router.post("/login", userLogin)

router.post("/resetpassword", resetpassword)

router.get("/getUser/:userId",getUser)

router.delete("/deleteUser/:userId",deleteuser)

router.put("/follow/:userId",followUser)

router.put("/unfollow/:userId",unfollowUser)

router.post("/tweets", tweets)

router.post("/like/:userId", like)

  
module.exports = router