import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();
    const Submit= async (e) => {
        e.preventDefault(); 
        const role = e.target.role.value;
        const username= e.target.name.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const batch = e.target.Batch.value;
        const department = e.target.Department.value;
        const course = e.target.Course.value;
        console.log("Role", role);
        const formData=new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('username', username);
        formData.append('batch', batch);
        formData.append('department', department);
        formData.append('course', course); 
        formData.append('role', role); 

        const info = {
    email, password, username, batch, department, course, role
};
        console.log("Form Data", formData);
        
        try {
            const response = await axios.post(`http://localhost:3000/register/${window.location.pathname.split('/')[2]}`,info,{
            withCredentials: true, // Include cookies in the request
        });
        const data = response.data;
        console.log("Response", data);
        if (response.status === 200) {
            alert("Registration successful!");
            navigate('/home')
        } else {
            alert("Registration failed: " + data.message);
        };
        } catch (error) {
            console.error("Error during registration:", error);
            alert("Registration failed. Please check your details and try again.");     
        }
        }

    const LoginPage=(e)=>{
        e.preventDefault(); // Prevent default anchor behavior
        navigate('/login'); // Navigate to login page
    }

    return ( 
         <form className="login-form" onSubmit={Submit}>
           <h2>Login</h2> 

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
               </div>

                <div className="form-group">
                <label htmlFor="name">Name:</label>     
                <input type="text" id="name" name="name" required />
               </div> 

                <div>
                    <label htmlFor="role">Role:</label>
                    <select id="role" name="role" required>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="hod">HOD</option>
                        <option value="principal">Principal</option>
                        <option value="alumni">Alumni</option>
                    </select>
                </div>
               <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
                </div>

                 <div className="form-group">
                <label htmlFor="Batch">Batch:</label>
                <input type="text" id="batch" name="Batch" required />
                </div>

                 <div className="form-group">
                <label htmlFor="Department">Department:</label>
                <select id="Department" name="Department" required>
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
                <label htmlFor="Course">Course:</label>
                <select id="Course" name="Course" required>
                    <option value="B.Tech">B.Tech</option>    
                    <option value="M.Tech">M.Tech</option>
                    <option value="PhD">PhD</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>    
                    <option value="Other">Other</option>  
                </select>   
                </div>

                <button type="submit">Signup</button>
                 <p>have an account? <a onClick={LoginPage}>Register</a></p> 
              </form>
     );
}

export default Signup;