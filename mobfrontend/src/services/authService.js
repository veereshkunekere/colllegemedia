import API from "./api";

export const loginUser = async (email, password) => {
    try {
        const response = await API.post("/auth/login", { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Step 1 of signup: sends user details (publicKey is null here).
// Returns { message, user } — the saved unverified user is needed by the
// frontend so it can key identity-key generation to user._id (not email).
export const registerUser = async (userData) => {
    try {
        const response = await API.post("/auth/verify-email", userData);
        return response.data;
    } catch (error) {
        console.log("Error in authService registerUser:", error);
        throw error.response?.data || error;
    }
};

// Step 2 of signup: publicKey is always required here.
// The frontend generates it on the OTP screen, keyed to user._id.
export const verifyOtpRequest = async (email, otp, publicKey) => {
    try {
        const response = await API.post("/auth/verify-otp", {
            email,
            otp,
            publicKey, // never null at this point
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const verifyToken = async () => {
    try {
        const response = await API.get("/auth/verify-token");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const logoutUser = async () => {
    try {
        const response = await API.post("/auth/logout");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updatePublicKey = async (publicKey) => {
    const res = await API.put("/user/public-key", { publicKey });
    return res.data;
};