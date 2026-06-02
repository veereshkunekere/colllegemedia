import API from "../services/api";


export const searchUsers =
 async (query) => {

  const res =
    await API.get(
      "/user/search",
      {
        params: {
          q: query
        }
      }
    );

  return res.data.users;
};