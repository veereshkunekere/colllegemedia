import React,{useEffect} from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";


import NotificationList from "../../styling/components/notifications/NotificationList";
import { useNotificationStore } from "../../store/notificationStore";

const NotificationScreen = ({ navigation }) => {
    const router = useRouter();
    const notifications = useNotificationStore(
        (state) => state.notifications
    );

    const unreadCount = useNotificationStore(
        (state) => state.unreadCount
    );

    const fetchNotifications = useNotificationStore(
        (state) => state.fetchNotifications
    );

    const markAllAsRead = useNotificationStore(
        (state) => state.markAllAsRead
    );

    const markAsRead = useNotificationStore(
        (state) => state.markAsRead
    );

    const handleNotificationPress = async (notification) => {
        console.log(
            "[Notification] Pressed:",
            notification
        );

        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        if (notification.type === "MESSAGE") {
        if (!notification.entityId) {
            console.warn("MESSAGE notification has no conversationId");
            return;
        }

        router.push(`/chat/${notification.entityId}`);
        return;
    }
        // We will add navigation based on notification type later.
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>
                        Notifications
                    </Text>

                    {unreadCount > 0 && (
                        <Text style={styles.unreadText}>
                            {unreadCount} unread
                        </Text>
                    )}
                </View>

                {unreadCount > 0 && (
                    <Pressable
                        onPress={markAllAsRead}
                        hitSlop={10}
                    >
                        <Text style={styles.markAll}>
                            Mark all as read
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Notifications */}
            <NotificationList
                notifications={notifications}
                onNotificationPress={
                    handleNotificationPress
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    header: {
        minHeight: 70,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#DDD",
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111",
    },

    unreadText: {
        marginTop: 3,
        fontSize: 13,
        color: "#777",
    },

    markAll: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1877F2",
    },
});

export default NotificationScreen;