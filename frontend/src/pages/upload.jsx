import React, { useState, useRef } from 'react';
import api from '../util/api';

function Upload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const submit = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const file = selectedFile;
        const title = e.target.title.value;
        const description = e.target.description.value;
        const category = e.target.category.value;
        const department = e.target.department.value;
        const batch = e.target.batch.value;
        const tags = e.target.tags.value.split(',').map(tag => tag.trim());
        const fileType = e.target.fileType.value;

        const formData = new FormData();
        formData.append('username', username);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('department', department);
        formData.append('batch', batch);
        formData.append('tags', JSON.stringify(tags));
        formData.append('fileType', fileType);
        if (file) {
            formData.append('file', file);
        }

        try {
            const response = await api.post(
                "/upload/upload-file",
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            console.log("Response", response);
            if (response.status === 200) {
                alert('File uploaded successfully');
                setSelectedFile(null);
                e.target.reset();
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file || null);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <form
                onSubmit={submit}
                className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl"
            >
                <h2 className="text-2xl font-bold text-white mb-8 text-center">Upload Notes</h2>

                {/* Username */}
                <div className="mb-6">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Enter your username"
                    />
                </div>

                {/* Title */}
                <div className="mb-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Enter file title"
                    />
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Describe the content..."
                    ></textarea>
                </div>

                {/* Category */}
                <div className="mb-6">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                    </label>
                    <select
                        id="category"
                        name="category"
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="notes">Notes</option>
                        <option value="questionPaper">Question Paper</option>
                        <option value="labManual">Lab Manual</option>
                        <option value="assignment">Assignment</option>
                        <option value="syllabus">Syllabus</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Department */}
                <div className="mb-6">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-2">
                        Department
                    </label>
                    <select
                        id="department"
                        name="department"
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="IT">IT</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Batch */}
                <div className="mb-6">
                    <label htmlFor="batch" className="block text-sm font-medium text-gray-300 mb-2">
                        Batch
                    </label>
                    <input
                        type="text"
                        id="batch"
                        name="batch"
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="e.g. 2021-2025"
                    />
                </div>

                {/* Tags */}
                <div className="mb-6">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="e.g. exam, midterm, notes"
                    />
                </div>

                {/* File Type */}
                <div className="mb-6">
                    <label htmlFor="fileType" className="block text-sm font-medium text-gray-300 mb-2">
                        File Type
                    </label>
                    <select
                        id="fileType"
                        name="fileType"
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="pdf">PDF</option>
                        <option value="image">Image</option>
                        <option value="doc">Document</option>
                        <option value="ppt">Presentation</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* File Upload - Clickable Area */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Upload File
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        name="pdf"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <div
                        onClick={triggerFileSelect}
                        className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-gray-600 transition bg-gray-800"
                    >
                        {selectedFile ? (
                            <div className="flex flex-col items-center">
                                <svg className="w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-green-400 font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="mt-3 text-xs text-red-400 hover:text-red-300 underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <>
                                <svg className="w-12 h-12 mx-auto text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5.5 5.5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                <p className="text-sm text-gray-400">Click to select file</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, Images, Docs, PPT</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition duration-200 transform hover:scale-105 disabled:transform-none"
                    disabled={!selectedFile}
                >
                    Upload File
                </button>
            </form>
        </div>
    );
}

export default Upload;