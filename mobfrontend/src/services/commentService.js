import API from "./api";

export const fetchComments =
  async (tweetId) => {
    try {
      const response =
        await API.get(
          `/tweet/comments/${tweetId}`
        );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error
      );
    }
  };

export const addComment =
  async (
    tweetId,
    content
  ) => {
    try {
      const response =
        await API.post(
          "/tweet/comment",
          {
            tweetId,
            content,
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

export const deleteComment = async (tweetId, commentId) => {
  try {
    const response = await API.delete(`/tweet/comment/${tweetId}/${commentId}`);
    console.log("Delete comment response:", response.data);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data ||
      error
    );
  }
};