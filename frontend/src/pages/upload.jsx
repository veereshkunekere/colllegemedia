import React from 'react';
import axios from 'axios';
function Upload() {
    const submit=async (e)=>{
        e.preventDefault();
        const username= e.target.username.value;
        const file=e.target.pdf.files[0];
        const title = e.target.title.value;
        const description = e.target.description.value; 
        const category = e.target.category.value;
        const department = e.target.department.value;
        const batch = e.target.batch.value;
        const tags = e.target.tags.value.split(',').map(tag => tag.trim()); // Split tags by comma and trim whitespace
        const fileType = e.target.fileType.value;
        const formData = new FormData();
        formData.append('username', username);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('department', department);
        formData.append('batch', batch);
        formData.append('tags', JSON.stringify(tags)); // Convert tags array to JSON string
        formData.append('fileType', fileType);
        // Append the file to the form data
        if(file) {
            formData.append('file', file);
        }   
        try {
           const response=await axios.post("http://localhost:3000/upload-file",formData,{
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true // Include cookies in the request
           })
            console.log("Response", response);
            console.log("Data", response.data?.pdfUrl);
            if(response.status === 200) {
                alert('File uploaded successfully');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }   

    }
    return (  
        <form className="profile-form" encType='multipart/form-data' onSubmit={submit}>
            <h2>Notes upload</h2>

            <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" required />
            </div>
            
            <div className="form-group">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" name="title" required />
            </div>

            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="4" required></textarea>
            </div>

            <div className="form-group">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" required>
                    <option value="notes">Notes</option>
                    <option value="questionPaper">Question Paper</option>
                    <option value="labManual">Lab Manual</option>
                    <option value="assignment">Assignment</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="department">Department</label>
                <select id="department" name="department" required>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                    <option value="IT">IT</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="batch">Batch</label>
                <input type="text" id="batch" name="batch" required />
            </div>

            <div className="form-group">
                <label htmlFor="tags">Tags (comma separated)</label>
                <input type="text" id="tags" name="tags" placeholder="e.g. exam, midterm, notes" /> 
            </div>

            <div className="form-group">
                <label htmlFor="fileType">File Type</label>
                <select id="fileType" name="fileType" required>
                    <option value="pdf">PDF</option>
                    <option value="image">Image</option>
                    <option value="doc">Document</option>
                    <option value="ppt">Presentation</option>
                    <option value="other">Other</option>
                </select>
            </div>



            <div>
                <label name="pdf">File</label>
                <input type="file" id="image" name="pdf" accept=".pdf" />  
            </div>
           <button type="submit">Update Profile</button>
          </form> 
    );
}

export default Upload;