// Tweet.jsx
import axios from "axios";
import { useState, useRef } from "react";

export default function Tweet() {
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [previews, setPreviews] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]); // Track actual files
    const fileInputRef = useRef(null);

    // Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    // Remove image by index
    const removeImage = (index) => {
        setPreviews(prev => prev.filter((_, i) => i !== index));
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Submit tweet
    const submitTweet = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const content = form.content.value;

        const formData = new FormData();
        formData.append("content", content);
        formData.append("isAnonymus", String(isAnonymous));

        // Append all selected files
        selectedFiles.forEach(file => {
            formData.append("images", file);
        });

        try {
            const { data } = await axios.post(
                "http://localhost:3000/api/tweet",
                formData,
                { withCredentials: true }
            );
            console.log("Tweet posted:", data);
            form.reset();
            setPreviews([]);
            setSelectedFiles([]);
        } catch (err) {
            console.error("Error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <form onSubmit={submitTweet} className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">

                {/* Anonymous Toggle */}
                <div className="mb-5">
                    <button
                        type="button"
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                            isAnonymous
                                ? "bg-gray-800 text-gray-300 border border-gray-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        {isAnonymous ? "Anonymous" : "Public"}
                    </button>
                </div>

                {/* Textarea */}
                <div className="mb-4">
                    <textarea
                        name="content"
                        placeholder="What's happening?"
                        rows="4"
                        maxLength={280}
                        className="w-full bg-gray-800 text-white placeholder-gray-500 p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    ></textarea>
                </div>

                {/* Upload Button */}
                <div className="mb-5">
                    <input
                        ref={fileInputRef}
                        type="file"
                        name="images"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-gray-600 transition"
                    >
                        <svg className="w-10 h-10 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5.5 5.5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <p className="text-sm text-gray-400">
                            Click to upload up to 4 images
                        </p>
                    </button>

                    {/* Previews */}
                    {previews.length > 0 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600">
                            {previews.map((src, index) => (
                                <div
                                    key={index}
                                    className="relative flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border border-gray-700"
                                >
                                    <img
                                        src={src}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status */}
                <p className="text-sm text-gray-400 mb-4 text-center">
                    Your tweet will be posted as{" "}
                    <span className="font-semibold text-blue-400">
                        {isAnonymous ? "anonymous" : "public"}
                    </span>
                </p>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={selectedFiles.length > 4}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition"
                >
                    Tweet
                </button>
            </form>
        </div>
    );
}