import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { deleteTweet } from "../../services/postService";
import { useState, useCallback, useRef } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuthStore } from "../../store/authStore";
import {
  getProfile,
  getPostsByUser,
  getUploadsByUser,
} from "../../services/profileService";
const { width } = Dimensions.get("window");
const GRID_GAP = 2;
const GRID_COLUMNS = 3;
const CELL_SIZE = (width - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

const FILE_ICONS = {
  pdf: "file-pdf-box",
  doc: "file-word-box",
  ppt: "file-powerpoint-box",
  image: "file-image",
  other: "file-outline",
};

export default function Profile() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [tab, setTab] = useState("posts"); // "posts" | "uploads"
  const [posts, setPosts] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Tracks which tabs have already been fetched for the current user,
  // so switching tabs back and forth doesn't refire network requests.
  const fetchedTabs = useRef({ posts: false, uploads: false });
  const hasLoadedProfile = useRef(false);


  const loadTabData = useCallback(async (userId, which, { force = false } = {}) => {
    if (!userId) return;
    if (!force && fetchedTabs.current[which]) return;

    try {
      setTabLoading(true);
      if (which === "posts") {
        const data = await getPostsByUser(userId);
        setPosts(data || []);
      } else {
        const data = await getUploadsByUser(userId);
        setUploads(data || []);
      }
      fetchedTabs.current[which] = true;
    } catch (error) {
      console.log(`error loading ${which}`, error);
    } finally {
      setTabLoading(false);
    }
  }, []);

  // Runs once per screen focus. Only fetches the profile the FIRST time
  // (or forces a fresh fetch after returning from Edit Profile), and only
  // loads the currently active tab's data if it hasn't been loaded yet.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        // Always refresh profile basics on focus (cheap, and picks up edits),
        // but never touch posts/uploads state here.
        try {
          setLoading(!hasLoadedProfile.current);
          const data = await getProfile();
          if (!active) return;
          setProfile(data);
          hasLoadedProfile.current = true;

          // Load whichever tab is currently selected, only if not cached yet.
          loadTabData(data?._id, tab);
        } catch (error) {
          console.log("error loading profile", error);
        } finally {
          if (active) setLoading(false);
        }
      })();

      return () => {
        active = false;
      };
      // Intentionally NOT depending on `tab` — switching tabs should not
      // re-trigger a profile refetch. Tab data loading is handled in switchTab.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const switchTab = (next) => {
    if (next === tab) return;
    setTab(next);
    if (profile?._id) loadTabData(profile._id, next);
  };

  const handleDeletePost = (postId) => {
  Alert.alert(
    "Delete Post",
    "This can't be undone. Delete this post?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const prevPosts = posts;
          setPosts((curr) => curr.filter((p) => p._id !== postId)); // optimistic
          try {
            await deleteTweet(postId);
          } catch (error) {
            console.log("error deleting post", error);
            setPosts(prevPosts); // roll back on failure
            Alert.alert("Error", "Couldn't delete the post. Try again.");
          }
        },
      },
    ]
  );
};

  const initial = profile?.username?.charAt(0)?.toUpperCase() || "?";

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      {tab === "posts" ? (
        <FlatList
          key="posts-list"
          data={posts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: "#EFEFEF" }} />
          )}
          ListHeaderComponent={
            <ProfileHeader
              profile={profile}
              loading={loading}
              initial={initial}
              onEditPress={() => router.push("/profile/edit")}
              onLogoutPress={logout}
              tab={tab}
              onTabChange={switchTab}
              postsCount={posts.length}
            />
          }
          ListEmptyComponent={
            tabLoading ? (
              <View style={{ paddingVertical: 60, alignItems: "center" }}>
                <ActivityIndicator color="#7c3aed" />
              </View>
            ) : (
              <EmptyState tab={tab} />
            )
          }
          renderItem={({ item }) => <PostRow item={item} onDelete={() => handleDeletePost(item._id)}/>}
        />
      ) : (
        <FlatList
          key="uploads-grid"
          data={uploads}
          keyExtractor={(item) => item._id}
          numColumns={GRID_COLUMNS}
          columnWrapperStyle={{ gap: GRID_GAP }}
          contentContainerStyle={{ gap: GRID_GAP, paddingBottom: 24 }}
          ListHeaderComponent={
            <ProfileHeader
              profile={profile}
              loading={loading}
              initial={initial}
              onEditPress={() => router.push("/profile/edit")}
              onLogoutPress={logout}
              tab={tab}
              onTabChange={switchTab}
              postsCount={posts.length}
            />
          }
          ListEmptyComponent={
            tabLoading ? (
              <View style={{ paddingVertical: 60, alignItems: "center" }}>
                <ActivityIndicator color="#7c3aed" />
              </View>
            ) : (
              <EmptyState tab={tab} />
            )
          }
          renderItem={({ item }) => <UploadCell item={item} />}
        />
      )}
    </View>
  );
}

function ProfileHeader({
  profile,
  loading,
  initial,
  onEditPress,
  onLogoutPress,
  tab,
  onTabChange,
  postsCount,
}) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {/* Header row: avatar + stats */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 86,
            height: 86,
            borderRadius: 43,
            backgroundColor: "#EFEFEF",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#E5E5E5",
          }}
        >
          {profile?.profilePicture ? (
            <Image
              source={{ uri: profile.profilePicture }}
              style={{ width: 86, height: 86 }}
            />
          ) : (
            <Text style={{ color: "#070707", fontSize: 28, fontWeight: "700" }}>
              {initial}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-around",
            marginLeft: 16,
          }}
        >
          <Stat label="Posts" value={String(postsCount)} />
          <Stat label="Followers" value="456" />
          <Stat label="Following" value="789" />
        </View>
      </View>

      {/* Username + bio */}
      <View style={{ marginTop: 14 }}>
        {loading ? (
          <ActivityIndicator color="#7c3aed" />
        ) : (
          <>
            <Text style={{ color: "#100f0f", fontWeight: "700", fontSize: 16 }}>
              {profile?.username || "username"}
            </Text>
            {profile?.bio ? (
              <Text style={{ color: "#3e3c3c", marginTop: 4 }}>
                {profile.bio}
              </Text>
            ) : null}
            {profile?.links?.[0] ? (
              <Text style={{ color: "#3897f0", marginTop: 4 }}>
                {profile.links[0]}
              </Text>
            ) : null}
          </>
        )}
      </View>

      {/* Action buttons row (Instagram-style) */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        <Pressable
          onPress={onEditPress}
          style={{
            flex: 1,
            backgroundColor: "#EFEFEF",
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#0a0a0a", fontWeight: "600" }}>
            Edit Profile
          </Text>
        </Pressable>

        <Pressable
          onPress={onLogoutPress}
          style={{
            flex: 1,
            backgroundColor: "#EFEFEF",
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#0a0a0a", fontWeight: "600" }}>Logout</Text>
        </Pressable>
      </View>

      {/* Tab bar */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          marginTop: 8,
        }}
      >
        <TabButton
          icon="reader-outline"
          activeIcon="reader"
          label="Posts"
          active={tab === "posts"}
          onPress={() => onTabChange("posts")}
        />
        <TabButton
          icon="document-text-outline"
          activeIcon="document-text"
          label="Uploads"
          active={tab === "uploads"}
          onPress={() => onTabChange("uploads")}
        />
      </View>
    </View>
  );
}

function TabButton({ icon, activeIcon, label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: active ? "#0a0a0a" : "transparent",
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <Ionicons
        name={active ? activeIcon : icon}
        size={18}
        color={active ? "#0a0a0a" : "#8e8e8e"}
      />
      <Text
        style={{
          color: active ? "#0a0a0a" : "#8e8e8e",
          fontWeight: active ? "700" : "500",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Posts render as a feed row (tweet-style), not a photo grid —
// these are text posts that may optionally carry images.
function PostRow({ item ,onDelete}) {
  const images = item.imageUrls || [];

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#fff",
        flex: 1,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Text style={{ color: "#0a0a0a", fontSize: 14, lineHeight: 20, flex: 1 }}>
          {item.content}
        </Text>
        <Pressable onPress={onDelete} hitSlop={10} style={{ marginLeft: 12, paddingTop: 2 }}>
          <Ionicons name="trash-outline" size={18} color="#c4c4c4" />
        </Pressable>
      </View>

      {images.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            marginTop: 10,
          }}
        >
          {images.slice(0, 3).map((url, idx) => (
            <Image
              key={idx}
              source={{ uri: url }}
              style={{
                flex: 1,
                height: 100,
                borderRadius: 10,
                backgroundColor: "#EFEFEF",
              }}
            />
          ))}
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          marginTop: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="heart-outline" size={16} color="#8e8e8e" />
          <Text style={{ color: "#8e8e8e", fontSize: 12 }}>
            {item.likes?.length || 0}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="chatbubble-outline" size={15} color="#8e8e8e" />
          <Text style={{ color: "#8e8e8e", fontSize: 12 }}>
            {item.comments?.length || 0}
          </Text>
        </View>
        <Text style={{ color: "#c4c4c4", fontSize: 12, marginLeft: "auto" }}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
        </Text>
      </View>
    </View>
  );
}

function UploadCell({ item }) {
  const iconName = FILE_ICONS[item.fileType] || FILE_ICONS.other;
  return (
    <View
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#EFEFEF",
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
      }}
    >
      <MaterialCommunityIcons name={iconName} size={32} color="#7c3aed" />
      <Text
        numberOfLines={2}
        style={{
          color: "#2c2c2c",
          fontSize: 11,
          textAlign: "center",
          marginTop: 6,
        }}
      >
        {item.title}
      </Text>
    </View>
  );
}

function EmptyState({ tab }) {
  const isPosts = tab === "posts";
  return (
    <View style={{ alignItems: "center", paddingVertical: 60, paddingHorizontal: 32 }}>
      <Ionicons
        name={isPosts ? "reader-outline" : "document-text-outline"}
        size={42}
        color="#c4c4c4"
      />
      <Text
        style={{
          color: "#0a0a0a",
          fontWeight: "700",
          fontSize: 16,
          marginTop: 12,
        }}
      >
        {isPosts ? "No Posts Yet" : "No Uploads Yet"}
      </Text>
      <Text
        style={{
          color: "#8e8e8e",
          fontSize: 13,
          marginTop: 4,
          textAlign: "center",
        }}
      >
        {isPosts
          ? "Posts you tweet will show up here."
          : "Notes, papers, and files you upload will show up here."}
      </Text>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: "#0a0a0a", fontWeight: "700", fontSize: 16 }}>
        {value}
      </Text>
      <Text style={{ color: "#8e8e8e", fontSize: 12 }}>{label}</Text>
    </View>
  );
}