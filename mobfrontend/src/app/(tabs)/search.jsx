import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSearchStore } from '../../store/searchStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Search() {
	const router = useRouter();
	const [query, setQuery] = useState('');
	const { searchUsers, searchResults, isSearching } = useSearchStore();

	const onChange = (text) => {
		setQuery(text);
	};

	const onSearchPress = () => {
		if (query.trim().length >= 2) searchUsers(query.trim());
	};

	const renderItem = ({ item }) => (
			<TouchableOpacity
				style={styles.item}
				onPress={() =>
					router.push({
						pathname: '/profile/[profileId]',
						params: { profileId: item._id },
					})
				}
			>
				{item.profilePicture ? (
					<Image source={{ uri: item.profilePicture }} style={styles.avatar} />
				) : (
				<View style={styles.avatarPlaceholder}>
					<Text style={styles.avatarLetter}>{item.username?.[0]?.toUpperCase() ?? '?'}</Text>
				</View>
			)}
			<Text style={styles.username}>{item.username}</Text>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView>
		<View style={styles.container}>
			<View style={styles.searchBar}>
				<TextInput
					value={query}
					onChangeText={onChange}
					placeholder="Search users"
					style={styles.input}
					returnKeyType="search"
					onSubmitEditing={onSearchPress}
				/>
				<TouchableOpacity style={styles.button} onPress={onSearchPress}>
					<Text style={styles.buttonText}>Search</Text>
				</TouchableOpacity>
			</View>

			{isSearching && <ActivityIndicator style={styles.loading} />}

			<FlatList
				data={searchResults}
				keyExtractor={(item) => item._id}
				renderItem={renderItem}
				contentContainerStyle={styles.list}
				keyboardShouldPersistTaps="handled"
			/>
		</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },

  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },

  input: {
    flex: 1,
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ECECF2',
  },

  button: {
    marginLeft: 10,
    height: 52,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#5aa9ee',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  loading: {
    marginTop: 16,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
  },

  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#DFF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  avatarLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#147D65',
  },

  username: {
    fontSize: 17,
    fontWeight: '600',
    color: '#202124',
  },
});


