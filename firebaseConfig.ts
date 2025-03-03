import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAwZ2S7yNbCOvZwlTV8NF_JF4x98fGk8nA",
    authDomain: "ocula-d2b35.firebaseapp.com",
    projectId: "ocula-d2b35",
    storageBucket: "ocula-d2b35.firebasestorage.app",
    messagingSenderId: "19080295751",
    appId: "1:19080295751:web:1ead6a88ccb287d0504862",
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
