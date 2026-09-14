const Notification = require("../models/notification.model");

const notificationController = {};

/*
 * GET /api/notifications
 *
 * Get notifications belonging to the logged-in user.
 */
notificationController.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user,
            isRead: false,
        })
            .populate(
                "actor",
                "username profilePicture"
            )
            .sort({
                createdAt: -1,
            })
            .limit(50);

        return res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.error(
            "Error fetching notifications:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

notificationController.markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const notification = await Notification.findOne({ _id: notificationId, recipient: req.user });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        notification.isRead = true;
        await notification.save();

        console.log(
            `Notification ${notificationId} marked as read for user ${req.user}`,notification
        );

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });
    } catch (error) {
        console.error(
            "Error marking notification as read:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
        });
    }
};

notificationController.markAllAsRead = async (req, res) => {
    try {

        await Notification.updateMany(
            { recipient: req.user, isRead: false },
            { $set: { isRead: true } }
        );  

        return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
       });

    } catch (error) {
        console.error(
            "Error marking all notifications as read:",
            error
        );
        return res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
        });
    }
    
}

module.exports = notificationController;