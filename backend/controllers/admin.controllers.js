const adminCtrl = {};
const Tweet = require("../models/tweet.models");
const User = require("../models/user.models");

adminCtrl.deleteTweet = async (req, res) => {
    const tweetId = req.params.id;

    try {
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }

        // FIX: Was 'auth.id' (undefined reference) — corrected to 'req.user'
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // FIX: Moved the role + ownership check after both tweet and user are confirmed to exist
        if (user.role !== 'hod' && user.role !== 'principal') {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        if (user.role === 'hod') {
            if (tweet.reports.length < 20) {
                return res.status(400).json({ message: 'Cannot remove tweet without at least 20 reports' });
            }
        }

        await Tweet.findByIdAndDelete(tweetId);
        return res.status(200).json({ message: "Tweet deleted by admin" });

    } catch (err) {
        console.error("Admin delete tweet error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = adminCtrl;