import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    // ...
    storageBucket: process.env.STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export default app;
