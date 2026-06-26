import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

import { useAuthStore } from "../../store/authStore";

export default function Profile() {
  const logout = useAuthStore(
    (state) => state.logout
  );

  const {user} = useAuthStore();
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cover}>
        <Image
          source={{
            uri: "https://picsum.photos/800/400",
          }}
          style={styles.coverImage}
        />

        <Image
          source={{
            uri: "https://i.pravatar.cc/300",
          }}
          style={styles.avatar}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>
         {user.username}
        </Text>

        <Text style={styles.bio}>
          Share thoughts, photos and connect
          with your college community.
        </Text>

        <View style={styles.statsContainer}>
          <View>
            <Text style={styles.statNumber}>
              178
            </Text>
            <Text style={styles.statLabel}>
              Posts
            </Text>
          </View>

          <View>
            <Text style={styles.statNumber}>
              2.8K
            </Text>
            <Text style={styles.statLabel}>
              Followers
            </Text>
          </View>

          <View>
            <Text style={styles.statNumber}>
              892
            </Text>
            <Text style={styles.statLabel}>
              Following
            </Text>
          </View>
        </View>

        <Pressable
          onPress={logout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

  cover: {
    height: 260,
  },

  coverImage: {
    width: "100%",
    height: 190,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,

    borderWidth: 4,
    borderColor: "#FFF",

    position: "absolute",
    bottom: 0,
    alignSelf: "center",
  },

  content: {
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 20,
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },

  bio: {
    textAlign: "center",
    color: "#777",
    marginTop: 10,
    lineHeight: 22,
  },

  statsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",

    backgroundColor: "#FFF",

    borderRadius: 24,
    paddingVertical: 22,

    marginTop: 28,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 3,
  },

  statNumber: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  statLabel: {
    textAlign: "center",
    color: "#777",
    marginTop: 5,
  },

  logoutButton: {
    marginTop: 40,

    width: "100%",
    backgroundColor: "#7B61FF",

    paddingVertical: 16,
    borderRadius: 18,

    alignItems: "center",
  },

  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});