const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

//@route POST /api/subscribe
//@desc Handle newsletter subscription
//@Access public

router.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  console.log(req.body)
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if the email is already subscribe
    let subscriber = await Subscriber.findOne({ email });
    if (subscriber) {
      return res.status(400).json({ message: "Email us already subscribe" });
    }
    console.log("hiiii")
    //Create a new subscriber
    subscriber = new Subscriber({ email });
    await subscriber.save();

    res.status(201).json({message: "Successfully subscribe to the newsletter"})
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server Error"})
  }
});

module.exports = router;
