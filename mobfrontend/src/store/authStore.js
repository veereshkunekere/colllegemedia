import { create } from "zustand";

import {
  loginUser,
  logoutUser,
  registerUser,
  verifyToken,
  verifyEmail,
  signupUser,
  updatePublicKey
} from "../services/authService";

import {
  saveToken,
  getToken,
  removeToken,
} from "../utils/storage";

import {generateIdentityKeys,getIdentityKeys} from "../services/cryptoService"
import {deleteKeys} from "../services/sessionServive"

import {useChatStore} from "../store/chatStore"
export const useAuthStore =
  create((set,get) => ({
    user: null,

    token: null,

    loading: false,

    isCheckingAuth: true,

    login: async (
      email,
      password
    ) => {
      try {
        set({
          loading: true,
        });

        const data =
          await loginUser(
            email,
            password
          );

        await saveToken(
          data.token
        );

        console.log("token is",data.token);

        set({
          user: data.user,
          token: data.token,
        });

        let keys = await getIdentityKeys(data.user._id);
        if(!keys || !keys?.publicKey || !keys?.privateKey){
           keys = await generateIdentityKeys(data.user._id);
        }
       if(!data.user.publicKey || data.user.publicKey!==keys.publicKey){
          const res = await updatePublicKey(keys.publicKey);
        }else{
          console.log("keys are in sync")
        }

        useChatStore.getState().connectRealtime({token: data.token,userId:data.user._id});

        return {
          success: true,
        };
      }
       catch (error) {
        return {
          success: false,
          message:
            error.message ||
            "Login failed",
        };
      } 
      finally {
        set({
          loading: false,
        });
      }
    },

    logout: async () => {
      try {
        await logoutUser();

        await removeToken();

        set({
          user: null,
          token: null,
        });
      } catch (error) {
        console.log(
          "Logout Error:",
          error
        );
      }
    },

    verifyEmail: async (email,password)=>{
      try {
        set({loading:true});
        const data = await verifyEmail( email, password );
    
        return {
          success: true,
        };

      } catch (error) {
        return {
          success: false,
          message:
            error.message ||
            "Login failed",
        };
      }
      finally{
        set({
          loading: false,
        });
      }
    },

    checkAuth: async () => {
      try {
        const storedToken = await getToken();

        if (!storedToken) {
          console.log("token not found")
          set({
            isCheckingAuth:
              false,
          });

          return;
        }

        const data = await verifyToken();
        console.log(data);

        // await deleteKeys(data.user._id);
        // get().logout();
        // return;


        set({
          user: data.user,
          token:
            storedToken,
        });

        const userId = get().user._id;
        console.log(userId);

         let keys = await getIdentityKeys(data.user._id);
        if(!keys){
           keys = await generateIdentityKeys(data.user._id);
        }
        if(!data.user.publicKey || data.user.publicKey!==keys.publicKey){
          const res = await updatePublicKey(keys.publicKey);
        }else{
          console.log("keys are in sync")
        }


        useChatStore.getState().connectRealtime({token: storedToken,userId});
      } catch (error) {
        console.log(error);
        await removeToken();

        set({
          user: null,
          token: null,
        });
      } finally {
        set({
          isCheckingAuth:
            false,
        });
      }
    },

    signup: async (userData) =>{
        try {
        set({
          loading: true,
        });

        const data = await registerUser(userData);

        await saveToken( data.token);

        console.log("token is",data.token);

        set({
          user: data.user,
          token: data.token,
        });

        useChatStore.getState().connectRealtime({token: data.token});

        return {
          success: true,
        };
      }
       catch (error) {
        console.log("error in authStore signup",error);
        return {
          success: false,
          message:
            error.message ||
            "Login failed",
        };
      } 
      finally {
        set({
          loading: false,
        });
      }
    }
  }));