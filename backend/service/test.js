const User = require("../models/user.models");
const PushNotificationService =
  require("./pushNotificationService");

const testPush = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    console.log("user", user);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await PushNotificationService.sendToUser({
      user,

      title: "CollegeMedia",

      body: "FCM push notification is working!",

      data: {
        type: "test",
      },
    });

    res.json({
      success: true,
      message: "Push notification sent",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Push failed",
    });
  }
};

module.exports = {
  testPush,
};