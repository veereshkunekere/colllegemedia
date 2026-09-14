import {
  io,
} from "socket.io-client";
import API from "../api";
// import { useAuthStore } from "../store/authStore";

console.log("API baseURL:", API.defaults.baseURL);
const SOCKET_URL = API.defaults.baseURL.replace("/api","");
console.log("Socket URL:", SOCKET_URL);
let socket = null;
let socketToken=null;

export const connectSocket = ({token}) => {

    if ( socket && socketToken === token) {
      return socket;
    }

    if(socket){
      socket.disconnect();
      socket=null;
      socketToken=null;
    }

    socket = io(
      SOCKET_URL,

      {
        auth: {
          token,
        },

        transports: [
          "websocket",
        ],
      }
    );

    // socket.userId = useAuthStore.getState().user._id;
    socketToken = token;

    return socket;
  };

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      socketToken = null;
      socket = null;
    }
  };