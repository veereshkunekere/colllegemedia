import api from "../util/api";
import { useNavigate } from "react-router-dom";

function VerifyEmail() {
    const navigate=useNavigate();
    const Verify=async (e)=>{
         const email=e.target.email.value;
         const password=e.target.password.value;
         const data={
            email:email,
            password:password
         }
         try {
            const response=await api.post("/verify-email",data);

            if(response.status===200){
                console.log("ok");
            }
            else{
                alert(`${response.data.message}`);
            }
         } catch (error) {
            console.log("error in verify password component",error)
         }
    }
    return ( 
        <>
        <form onSubmit={Verify}>
            <div>
            <label>Email</label>
            <input type="email" placeholder="enter email" name="email"/>
            </div>
            <div>
            <label>Password</label>
            <input type="password" name="password"/>
            </div>
        <button type="submit">Verify</button>
        </form>
        </>
     );
}

export default VerifyEmail;