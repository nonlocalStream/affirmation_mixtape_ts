import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// // Initialize Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyCMjyW7wIEtCAq10ProEIallK3n7xHTppQ",
//   databaseURL: "https://affirmation-mixtape.firebaseio.com",
//   authDomain: "affirmation-mixtape.firebaseapp.com",
//   projectId: "affirmation-mixtape",
//   storageBucket: "affirmation-mixtape.appspot.com",
//   messagingSenderId: "123001291746",
//   appId: "1:123001291746:web:736ec6de8241ef70be6fbb",
//   measurementId: "G-L2MX0WXKJ7",
// };

const firebaseConfig = {
  apiKey: "AIzaSyDyg3hO7YNaMC8f9Ee-QNsbh98XxxEyhoE",
  databaseURL: "https://affirmation-mixtape-v2.firebaseio.com",
  authDomain: "affirmation-mixtape-v2-df370.firebaseapp.com",
  projectId: "affirmation-mixtape-v2-df370",
  storageBucket: "affirmation-mixtape-v2-df370.appspot.com",
  messagingSenderId: "426729259935",
  appId: "1:426729259935:web:e193386a13700ed1a1b3aa",
  measurementId: "G-0S3D8SKQZT"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
// TODO: add debug token https://firebase.google.com/docs/app-check/web/debug-provider?authuser=0&hl=en
export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LdyExUkAAAAABzVNjVTnoOlxGYqy_vkm1pjNsr8'),

  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true
});

// Initialize Cloud Storage and get a reference to the service
// Used to upload media files (audio, video, images etc)
export const storage = getStorage(app);

// // Initialize Firestore and get a reference
// // Used as the db for user data & metadata for files
// export const firestore = firebase.firestore();

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);