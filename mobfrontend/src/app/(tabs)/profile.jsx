import {
  TouchableOpacity,
  Text,
  Pressable,
  View,
} from "react-native";

import {
  useAuthStore,
} from "../../store/authStore";
import CommentsBottomSheet from "../../components/feed/commentBottomSheet";

export default function Profile() {
  const logout =
    useAuthStore(
      (state) =>
        state.logout
    );

  return (
   <Pressable 
    onPress={logout}
        style={{
          backgroundColor: 'blue',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 8,
          marginTop:"20%",
          width:"50%",
        }}
   >
    <Text>Logout</Text>
    <CommentsBottomSheet></CommentsBottomSheet>
   </Pressable>
  );
}