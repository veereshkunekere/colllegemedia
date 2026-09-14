import React from "react";
import {
    View,
    Text,
    Image,
    Pressable,
    StyleSheet,
} from "react-native";

const NotificationItem = ({
    notification,
    onPress,
}) => {

    const getMessage = () => {
        switch (notification.type) {
            case "LIKE":
                return "liked your post";

            case "COMMENT":
                return "commented on your post";

            case "REPLY":
                return "replied to your comment";

            case "FOLLOW":
                return "started following you";

            case "MENTION":
                return "mentioned you";

            case "MESSAGE":
                return "sent you a message";

            case "POST":
                return "created a new post";

            case "ADMIN":
                return "sent you an announcement";

            default:
                return "sent you a notification";
        }
    };

    const actorName =
        notification.actor?.username || "Someone";

    const profilePicture =
        notification.actor?.profilePicture;

    return (
        <Pressable
            onPress={() => onPress?.(notification)}
            style={[
                styles.container,
                !notification.isRead &&
                    styles.unreadContainer,
            ]}
        >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                {profilePicture ? (
                    <Image
                        source={{
                            uri: profilePicture,
                        }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {actorName
                                .charAt(0)
                                .toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>

            {/* Notification content */}
            <View style={styles.content}>
                <Text style={styles.message}>
                    <Text style={styles.actorName}>
                        {actorName}
                    </Text>{" "}
                    {getMessage()}
                </Text>

                <Text style={styles.time}>
                    {new Date(
                        notification.createdAt
                    ).toLocaleString()}
                </Text>
            </View>

            {/* Unread indicator */}
            {!notification.isRead && (
                <View style={styles.unreadDot} />
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 13,
        backgroundColor: "#FFFFFF",
    },

    unreadContainer: {
        backgroundColor: "#F5F9FF",
    },

    avatarContainer: {
        marginRight: 12,
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
    },

    avatarPlaceholder: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#D9D9D9",
        alignItems: "center",
        justifyContent: "center",
    },

    avatarText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#555",
    },

    content: {
        flex: 1,
        paddingRight: 8,
    },

    message: {
        fontSize: 14,
        lineHeight: 20,
        color: "#333",
    },

    actorName: {
        fontWeight: "700",
        color: "#111",
    },

    time: {
        marginTop: 4,
        fontSize: 12,
        color: "#888",
    },

    unreadDot: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: "#1877F2",
    },
});

export default NotificationItem;