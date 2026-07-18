import API from "./api";
import * as Crypto from "expo-crypto";
export const getFeedPosts = async (cursor = null) => {
    try {
      const url = cursor
        ? `/tweet/tweetFeed?cursor=${cursor}`
        : "/tweet/tweetFeed";

      const response =
        await API.get(url);

      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error
      );
    }
  };

  export const toggleLikePost = async (postId) => {
    try {
      const response =
        await API.post(
          "/tweet/tweetlike",
          {
            id: postId,
          }
        );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error
      );
    }
  };

  export const deleteTweet = async (tweetId) => {
  try {
    const response = await API.delete(`/tweet/${tweetId}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      error
    );
  }
};

export const createNewPost =
  async (formData) => {
    try {
      const response =
        await API.post(
          "/tweet/create",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Idempotency-Key": Crypto.randomUUID()
            },
          }
        );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error
      );
    }
  };