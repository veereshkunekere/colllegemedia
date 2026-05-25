import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function
ChatBubble({
  message,
  isMine,
}) {

  return (
    <View
      style={[
        styles.container,

        isMine
          ? styles.mine
          : styles.other,
      ]}
    >

      <Text
        style={styles.text}
      >
        {
          message.cipherText ||
          "Encrypted message"
        }
      </Text>
      {isMine && (
        <Text
        style={styles.status}
        >
         {
           message.status || "sent"
         }
        </Text>
       )}


    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      maxWidth: "80%",

      marginVertical: 4,

      padding: 12,

      borderRadius: 18,
    },

    status: {
  color: "#ddd",

  fontSize: 11,

  marginTop: 4,

  alignSelf: "flex-end",
},
    mine: {
      alignSelf: "flex-end",

      backgroundColor:
        "#7c3aed",
    },

    other: {
      alignSelf: "flex-start",

      backgroundColor:
        "#1f1f1f",
    },

    text: {
      color: "#fff",

      fontSize: 15,

      lineHeight: 22,
    },
});