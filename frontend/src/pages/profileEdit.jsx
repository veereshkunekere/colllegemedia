/*  ProfileEdit.jsx  */
import React, { useState, useEffect } from "react";
import axios from "axios";

function ProfileEdit() {
  const [avatar, setAvatar] = useState(null);          // current picture URL
  const [previewUrl, setPreviewUrl] = useState(null); // live preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ------------------------------------------------- */
  /*  Load current profile (username, bio, link, pic)  */
  /* ------------------------------------------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3000/api/user/profile",
          { withCredentials: true }
        );

        if (data?.data) {
          const user = data.data;
          setAvatar(user.profilePicture || null);
          setPreviewUrl(user.profilePicture || null);

          // pre-fill form
          const usernameEl = document.getElementById("username");
          const bioEl = document.getElementById("bio");
          const linksEl = document.getElementById("links");

          if (usernameEl) usernameEl.value = user.username || "";
          if (bioEl) bioEl.value = user.bio || "";
          if (linksEl) linksEl.value = (user.links && user.links[0]) || "";
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    fetchProfile();
  }, []);

  /* ------------------------------------------------- */
  /*  Live preview when a new image is selected        */
  /* ------------------------------------------------- */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  /* ------------------------------------------------- */
  /*  Submit handler                                    */
  /* ------------------------------------------------- */
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const username = form.username.value.trim();
    const bio = form.bio.value.trim();
    const link = form.links.value.trim();
    const image = form.image.files?.[0];

    if (!username) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", bio);
    formData.append("link", link);
    if (image) formData.append("image", image);

    try {
      const response = await axios.put(
        "http://localhost:3000/api/user/profile/edit",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const updated = response.data.user;
        setAvatar(updated.profilePicture || null);
        setPreviewUrl(updated.profilePicture || null);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------- */
  /*  Fallback letter for avatar when no picture      */
  /* ------------------------------------------------- */
  const usernameInput = document.getElementById("username");
  const initialLetter = usernameInput?.value?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-400">
            Edit Profile
          </h1>

          {/* Success / Error */}
          {success && (
            <div className="mb-4 p-3 bg-green-900 border border-green-700 text-green-300 rounded-lg text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-300 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">
            {/* Avatar preview + upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-gray-700 overflow-hidden bg-gray-800">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center text-4xl font-bold text-gray-300">
                      {initialLetter}
                    </div>
                  )}
                </div>

                <label
                  htmlFor="image"
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>

              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <p className="mt-2 text-sm text-gray-400">
                Click the camera to change photo
              </p>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
                placeholder="Enter your username"
              />
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Link */}
            <div>
              <label
                htmlFor="links"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Link (GitHub, LinkedIn, etc.)
              </label>
              <input
                type="url"
                id="links"
                name="links"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
                placeholder="https://example.com"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-full font-semibold text-white transition-all ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/50"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileEdit;