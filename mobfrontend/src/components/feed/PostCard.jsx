import {React,useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from "react-native";
// import ImageViewing from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import {formatTimeAgo} from "../../utils/formatTime";
import {usePostStore} from "../../store/postStore";
import { useCommentSheet } from "../../contexts/CommentSheetProvider";
export default function PostCard({ post }) {
  const isAnonymous = post.isAnonymous;
  const [visible,setVisible,] = useState(false);
  const {reportTweet} = usePostStore();
  const toggleLike =usePostStore(
    (state) =>
      state.toggleLike
  );

  const handleReportPost = (post) => {
  Alert.alert(
    "Report Post",
    "Are you sure you want to report this post?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Report",
        style: "destructive",
        onPress: () => {
          const res=reportTweet(post);
          if(res) {
          console.log("Reporting:", post._id);
          }
          // Call your existing report API here
        },
      },
    ]
  );
};

  const { openComments } = useCommentSheet();
 

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

        <TouchableOpacity
  style={styles.menuItem}
  onPress={() => handleReportPost(post)}
>
  <Ionicons
    name="flag-outline"
    size={20}
    color="#E53935"
  />

</TouchableOpacity>
      </View>

      {/* CONTENT */}
      <Text style={styles.content}>
        {post.content}
      </Text>

       {/*image section*/}
      {post.imageUrls?.[0] && (<>
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

    {/* <ImageViewing images={[
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
    /> */}
  </>
)}
      {/* DIVIDER */}
      <View style={styles.divider} />

      {/* ACTIONS */}
      <View style={styles.actions}>
        
        <View style={styles.leftActions}>
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
               color="#e44141"
             />

             <Text
               style={styles.actionText}
             >
              {post.likesCount || 0}
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.actionBtn}
  onPress={() => openComments(post)}
>
  <Ionicons
    name="chatbubble-outline"
    size={20}
    color="#5c5cde"
  />

  <Text style={styles.actionText}>
    {post.commentsCount || 0}
  </Text>
</TouchableOpacity>

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
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7B61FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  anonymousAvatar: {
    backgroundColor: "#7B61FF",
  },

  username: {
    color: "#111",
    fontSize: 15,
    fontWeight: "700",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  time: {
    color: "#999",
    fontSize: 12,
  },

  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },

  content: {
    color: "#333",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 14,
  },

  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    backgroundColor: "#F2F2F2",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F1F1",
    marginVertical: 16,
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
    marginRight: 20,
  },

  actionText: {
    color: "#666",
    marginLeft: 6,
    fontWeight: "600",
  },
  menuItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 14,
},
});

