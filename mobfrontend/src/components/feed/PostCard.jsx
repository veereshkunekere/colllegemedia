import {React,useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import {formatTimeAgo} from "../../utils/formatTime";
import {usePostStore} from "../../store/postStore";
export default function PostCard({ post }) {
  const isAnonymous = post.isAnonymous;
  const [visible,setVisible,] = useState(false);
  const toggleLike =usePostStore(
    (state) =>
      state.toggleLike
  );

  return (
    <View
      style={[
        styles.card,
        {
          borderColor:isAnonymous? "#5b248f": "#1f1f1f"
        },
      ]}
    >
      {/* TOP */}
      <View style={styles.topRow}>
        <View style={styles.userSection}>
          <View
            style={[
              styles.avatar,
              isAnonymous && styles.anonymousAvatar,
            ]}
          >
            <Ionicons
              name={
                isAnonymous
                  ? "sparkles"
                  : "person"
              }
              size={18}
              color="#fff"
            />
          </View>

          <View>
            <Text style={styles.username}>
              {post.username}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.time}>
                {formatTimeAgo(post.createdAt)}
              </Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      isAnonymous
                        ? "#5b248f"
                        : "#0d7a5f",
                  },
                ]}
              >
              </View>
            </View>
          </View>
        </View>

        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color="#888"
        />
      </View>

      {/* CONTENT */}
      <Text style={styles.content}>
        {post.content}
      </Text>

      {post.imageUrls?.[0] && (
  <>
    <TouchableOpacity
      onPress={() =>
        setVisible(true)
      }
      activeOpacity={0.9}
    >
      <Image
        source={{
          uri:
            post.imageUrls[0],
        }}
        style={
          styles.postImage
        }
        resizeMode="contain"
      />
    </TouchableOpacity>

    <ImageViewing
      images={[
        {
          uri:
            post.imageUrls[0],
        },
      ]}

      imageIndex={0}

      visible={visible}

      onRequestClose={() =>
        setVisible(false)
      }
    />
  </>
)}
      {/* DIVIDER */}
      <View style={styles.divider} />

      {/* ACTIONS */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <View style={styles.actionBtn}>
            <TouchableOpacity
             style={styles.actionBtn}
             onPress={() =>
               toggleLike(post._id)
             }
        > 
             <Ionicons
               name={
                 post.likedByUser
                   ? "heart"
                   : "heart-outline"
               }
               size={22}
               color="#fff"
             />

             <Text
               style={styles.actionText}
             >
              {post.likesCount || 0}
  </Text>
</TouchableOpacity>
          </View>

          <View style={styles.actionBtn}>
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color="#fff"
            />

            <Text style={styles.actionText}>
              {post.commentsCount || 0}
            </Text>
          </View>
        </View>

        <Ionicons
          name="share-social-outline"
          size={22}
          color="#fff"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0b0b0b",
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    marginBottom: 22,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#232323",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  anonymousAvatar: {
    backgroundColor: "#33204a",
  },

  username: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  time: {
    color: "#8f8f8f",
    marginRight: 10,
    fontSize: 15,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  content: {
    color: "#fff",
    fontSize: 20,
    lineHeight: 34,
    marginTop: 24,
  },

  divider: {
    height: 1,
    backgroundColor: "#1f1f1f",
    marginVertical: 24,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 26,
  },

 postImage: {
  width: "100%",
  aspectRatio: 1,
  borderRadius: 20,
  marginTop: 20,
  backgroundColor: "#111",
},
  actionText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 18,
  },
});

