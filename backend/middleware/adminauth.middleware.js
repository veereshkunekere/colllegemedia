const User = require("../models/user.models");

module.exports = async (req, res, next) => {
    try {
        const user = await User.findById(req.user);

        if (!user || user.role !== "hod" && user.role !== "principal") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};