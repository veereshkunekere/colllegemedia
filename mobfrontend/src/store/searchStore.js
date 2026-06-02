import {create} from 'zustand';
import * as userService from '../services/searchService';

export const useSearchStore = create((set) => ({
	searchResults: [],
	isSearching: false,

	searchUsers: async (query) => {
		try {
			set({ isSearching: true });

			const users = await userService.searchUsers(query);

			set({ searchResults: users });
		} catch (error) {
			console.error('searchUsers error:', error);
		} finally {
			set({ isSearching: false });
		}
	},
}));


