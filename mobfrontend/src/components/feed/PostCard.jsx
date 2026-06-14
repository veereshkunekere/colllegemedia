import {React,useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from "react-native";
// import ImageViewing from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import {formatTimeAgo} from "../../utils/formatTime";
import {usePostStore} from "../../store/postStore";
import { useCommentSheet } from "../../contexts/CommentSheetProvider";
export default function PostCard({ post }) {
  const isAnonymous = post.isAnonymous;
  const [visible,setVisible,] = useState(false);
  const toggleLike =usePostStore(
    (state) =>
      state.toggleLike
  );

  const { openComments } = useCommentSheet();
 

  return (
    <View
      style={[
        styles.card,
        {
          borderColor:isAnonymous? "#d0b7e7": "#dbd2d2"
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

    
  </>
)}
      {/* DIVIDER */}

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
               color="#f34848"
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
    color="#387ff1"
  />

  <Text style={styles.actionText}>
    {post.commentsCount || 0}
  </Text>
</TouchableOpacity>

     </View>
        <Ionicons
          name="share-social-outline"
          size={22}
          color="#0d0d0d"
        />
      </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#e4e4eabc",
    borderWidth: 1,
    borderRadius: 15,
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 15,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
  },

  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#232323",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  anonymousAvatar: {
    backgroundColor: "#33204a",
  },

  username: {
    color: "#2c2b2b",
    fontSize: 18,
    fontWeight: "500",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },

  time: {
    color: "#8f8f8f",
    marginRight: 10,
    fontSize: 13,
  },

  content: {
    color: "#0d0d0d",
    fontSize: 18,
    lineHeight: 28,
    marginTop: 24,
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
    color: "#0d0d0d",
    margin: 4,
    marginLeft: 8,

    fontSize: 18,
  },
});

