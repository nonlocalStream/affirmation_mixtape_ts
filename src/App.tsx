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
    } else if (window.location.pathname.includes("edit")) {
      return <EditProjectPage />; 
    } else {
      return <>
      <h1>Encourage Your BB!!!</h1>
      <h3><a href="/projects/nino_to_cq/edit">Nino's message to CQ</a></h3>
      <h3><a href="/projects/cq_to_nino/edit">CQ's message to Nino</a></h3>
      <h3><a href="/projects/projectToken/edit">Test</a></h3>
      </>
    }
  } else {
    // window.location.replace("/authenticate");
    return <AuthenticationPage/>
  }
}

export default App;
