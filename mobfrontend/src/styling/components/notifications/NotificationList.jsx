import React from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
} from "react-native";

import NotificationItem from "./NotificationItem";

const NotificationList = ({
    notifications = [],
    onNotificationPress,
}) => {
    if (notifications.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                    No notifications
                </Text>

                <Text style={styles.emptyText}>
                    You're all caught up.
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <NotificationItem
                    notification={item}
                    onPress={onNotificationPress}
                />
            )}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#222",
        marginBottom: 6,
    },

    emptyText: {
        fontSize: 14,
        color: "#777",
        textAlign: "center",
    },
});

export default NotificationList;