import API from "./api";

export const loginUser =
  async (
    email,
    password
  ) => {
    try {
      const response =
        await API.post(
          "/auth/login",
          {
            email,
            password,
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

export const registerUser =
  async (
    userData,
    token
  ) => {
    try {
      const response =
        await API.post(
          `/auth/register/${token}`,
          userData
        );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error
      );
    }
  };

export const verifyToken =
  async () => {
    try {
      const response =
        await API.get(
          "/auth/verify-token"
        );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error
      );
    }
  };

export const logoutUser =
  async () => {
    try {
      const response =
        await API.post(
          "/auth/logout"
        );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        error
      );
    }
  };