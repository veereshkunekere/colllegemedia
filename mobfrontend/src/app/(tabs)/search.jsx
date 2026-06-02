import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSearchStore } from '../../store/searchStore';

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
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 12, backgroundColor: '#fff' },
	searchBar: { flexDirection: 'row', alignItems: 'center' },
	input: { flex: 1, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, backgroundColor: '#fafafa' },
	button: { marginLeft: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#2196F3', borderRadius: 8 },
	buttonText: { color: '#fff', fontWeight: '600' },
	loading: { marginTop: 12 },
	list: { paddingTop: 12 },
	item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
	avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
	avatarLetter: { fontWeight: '700', color: '#666' },
	username: { fontSize: 16 },
});


