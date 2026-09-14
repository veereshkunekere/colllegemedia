import React, {
    useEffect,
    useRef,
} from "react";

import {
    View,
    Text,
    Image,
    Pressable,
    StyleSheet,
    Animated,
} from "react-native";

const NotificationToast = ({
    notification,
    onPress,
    onHide,
    duration = 3500,
}) => {
    const translateY =
        useRef(
            new Animated.Value(-120)
        ).current;

    const opacity =
        useRef(
            new Animated.Value(0)
        ).current;

    useEffect(() => {
        if (!notification) {
            return;
        }

        /*
         * Slide in
         */
        Animated.parallel([
            Animated.timing(
                translateY,
                {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }
            ),

            Animated.timing(
                opacity,
                {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }
            ),
        ]).start();

        /*
         * Automatically hide
         */
        const timer = setTimeout(() => {
            hideToast();
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [notification]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(
                translateY,
                {
                    toValue: -120,
                    duration: 200,
                    useNativeDriver: true,
                }
            ),

            Animated.timing(
                opacity,
                {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }
            ),
        ]).start(() => {
            onHide?.();
        });
    };

    if (!notification) {
        return null;
    }

    const actorName =
        notification.actor?.username ||
        "Someone";

    const profilePicture =
        notification.actor?.profilePicture;

    const getMessage = () => {
        switch (notification.type) {
            case "MESSAGE": {
                const count =
                    notification.metadata
                        ?.messageCount || 1;

                return count > 1
                    ? `sent you ${count} messages`
                    : "sent you a message";
            }

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

            case "POST":
                return "created a new post";

            case "ADMIN":
                return "sent you an announcement";

            default:
                return "sent you a notification";
        }
    };

    return (
        <Animated.View
            style={[
                styles.wrapper,
                {
                    opacity,
                    transform: [
                        {
                            translateY,
                        },
                    ],
                },
            ]}
        >
            <Pressable
                onPress={() => {
                    onPress?.(notification);
                    hideToast();
                }}
                style={styles.container}
            >
                {/* Avatar */}
                {profilePicture ? (
                    <Image
                        source={{
                            uri: profilePicture,
                        }}
                        style={styles.avatar}
                    />
                ) : (
                    <View
                        style={styles.avatarPlaceholder}
                    >
                        <Text
                            style={styles.avatarText}
                        >
                            {actorName
                                .charAt(0)
                                .toUpperCase()}
                        </Text>
                    </View>
                )}

                {/* Text */}
                <View style={styles.content}>
                    <Text
                        style={styles.title}
                        numberOfLines={1}
                    >
                        {actorName}
                    </Text>

                    <Text
                        style={styles.message}
                        numberOfLines={2}
                    >
                        {getMessage()}
                    </Text>
                </View>

                {/* Close */}
                <Pressable
                    onPress={hideToast}
                    hitSlop={10}
                    style={styles.closeButton}
                >
                    <Text style={styles.close}>
                        ×
                    </Text>
                </Pressable>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 55,
        left: 12,
        right: 12,
        zIndex: 9999,
        elevation: 9999,
    },

    container: {
        minHeight: 68,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 14,
        paddingVertical: 10,

        borderRadius: 14,

        backgroundColor: "#FFFFFF",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.18,
        shadowRadius: 8,

        elevation: 8,
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 11,
    },

    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,

        marginRight: 11,

        backgroundColor: "#DDD",

        alignItems: "center",
        justifyContent: "center",
    },

    avatarText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#555",
    },

    content: {
        flex: 1,
    },

    title: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111",
    },

    message: {
        marginTop: 2,
        fontSize: 13,
        color: "#555",
    },

    closeButton: {
        marginLeft: 8,
    },

    close: {
        fontSize: 22,
        color: "#888",
        lineHeight: 22,
    },
});

export default NotificationToast;