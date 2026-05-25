import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

export default function ConversationCard({
  conversation,
  currentUserId,
  onPress,
}) {

  const otherUser =
    conversation.participants
      .find(
        (u) =>
          u._id !==
          currentUserId
      );

  const unreadCount =
    conversation
      ?.unreadCounts?.[
        currentUserId
      ] || 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >

      <Image
        source={{
          uri:
            otherUser
              ?.profilePicture ||
            "https://via.placeholder.com/150",
        }}
        style={styles.avatar}
      />

      <View
        style={styles.content}
      >

        <Text
          style={styles.username}
        >
          {
            otherUser?.username
          }
        </Text>

        <Text
          numberOfLines={1}
          style={styles.message}
        >
          {
            conversation
              .lastMessage ||
            "Start chatting"
          }
        </Text>

      </View>

      {unreadCount > 0 && (
        <View
          style={styles.badge}
        >
          <Text
            style={
              styles.badgeText
            }
          >
            {unreadCount}
          </Text>
        </View>
      )}

    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({

    card: {
      flexDirection: "row",
      alignItems: "center",

      padding: 14,

      borderBottomWidth: 1,

      borderBottomColor:
        "#1f1f1f",

      backgroundColor:
        "#050505",
    },

    avatar: {
      width: 58,
      height: 58,

      borderRadius: 29,

      backgroundColor:
        "#222",
    },

    content: {
      flex: 1,

      marginLeft: 14,
    },

    username: {
      color: "#fff",

      fontSize: 16,

      fontWeight: "700",
    },

    message: {
      color: "#888",

      marginTop: 4,
    },

    badge: {
      minWidth: 24,

      height: 24,

      borderRadius: 12,

      backgroundColor:
        "#7c3aed",

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingHorizontal: 8,
    },

    badgeText: {
      color: "#fff",

      fontWeight: "700",
    },
});