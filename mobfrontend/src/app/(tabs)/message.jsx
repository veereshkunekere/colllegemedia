import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
    KeyboardAvoidingView,
  Platform,
} from 'react-native';

const messages = [
  {
    id: '1',
    text: 'Hey 👋',
    sender: 'other',
  },
  {
    id: '2',
    text: 'Simple UI looks clean',
    sender: 'me',
  },
  {
    id: '3',
    text: 'No extra packages needed 😄',
    sender: 'other',
  },
   {
    id: '4',
    text: 'Hey 👋',
    sender: 'other',
  },
  {
    id: '5',
    text: 'Simple UI looks clean',
    sender: 'me',
  },
  {
    id: '6',
    text: 'No extra packages needed 😄',
    sender: 'other',
  },
   {
    id: '7',
    text: 'Hey 👋',
    sender: 'other',
  },
  {
    id: '8',
    text: 'Simple UI looks clean',
    sender: 'me',
  },
  {
    id: '9',
    text: 'No extra packages needed 😄',
    sender: 'other',
  },
   {
    id: '10',
    text: 'Hey 👋',
    sender: 'other',
  },
  {
    id: '11',
    text: 'Simple UI looks clean',
    sender: 'me',
  },
  {
    id: '12',
    text: 'No extra packages needed 😄',
    sender: 'other',
  },
];

export default function MessageScreen() {
  const renderItem = ({ item }) => {
    const isMe = item.sender === 'me';

    return (
      <View
        style={[
          styles.messageContainer,
          {
            alignSelf: isMe ? 'flex-end' : 'flex-start',
            backgroundColor: isMe ? '#4F46E5' : '#fff',
          },
        ]}>
        <Text
          style={{
            color: isMe ? '#fff' : '#111',
            fontSize: 15,
          }}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>

        <View>
          <Text style={styles.name}>Alex</Text>
          <Text style={styles.status}>online</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: 15,
        }}
      />

      {/* Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Type message..."
          placeholderTextColor="#777"
          style={styles.input}
        />

        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },

  status: {
    color: '#666',
    marginTop: 2,
  },

  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 15,
    color: '#111',
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4F46E5',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendText: {
    color: '#fff',
    fontSize: 18,
  },
});