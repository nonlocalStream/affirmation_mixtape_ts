import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {auth} from './firebaseConfig.js'
import {onAuthStateChanged } from "firebase/auth";


import EditProjectPage from "./components/EditProjectPage";
import ViewProject from "./components/ViewProject";
import AuthenticationPage from "./components/AuthenticationPage";
import { useState } from "react";


function App() {
  const [myUser, setMyUser] = useState<any>(null);

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    setMyUser(user);
    // const uid = user.uid;
    // ...
  } else {
    // User is signed out
    // ...
  }
});
  // const user = auth.currentUser;
  console.log(myUser);
  // TODO: use react router
  if (myUser !== null) {
    if (window.location.pathname.includes("view")) {
      return <ViewProject/>;
    }
    return <EditProjectPage />;   
  } else {
    // window.location.replace("/authenticate");
    return <AuthenticationPage/>
  }
}

export default App;
