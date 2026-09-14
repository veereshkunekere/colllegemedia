import React from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
} from "react-native";

import { useNotificationStore } from "../../../store/notificationStore";

const NotificationBell = ({
    onPress,
    children,
}) => {
    const unreadCount = useNotificationStore(
        (state) => state.unreadCount
    );

    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
            hitSlop={10}
        >
            {/* Bell icon supplied by parent */}
            {children}

            {/* Unread badge */}
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </Text>
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },

    badge: {
        position: "absolute",
        top: -2,
        right: -2,

        minWidth: 18,
        height: 18,

        paddingHorizontal: 4,

        borderRadius: 9,

        backgroundColor: "#E53935",

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 2,
        borderColor: "#FFFFFF",
    },

    badgeText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "700",
        textAlign: "center",
    },
});

export default NotificationBell;