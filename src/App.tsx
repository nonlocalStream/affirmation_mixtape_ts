import "bootstrap/dist/css/bootstrap.min.css";
import {auth} from './firebaseConfig.js'
import {onAuthStateChanged } from "firebase/auth";


import EditProjectPage from "./components/EditProjectPage";
import ViewProject from "./components/ViewProject";
import AuthenticationPage from "./components/AuthenticationPage";
import { useState } from "react";
import './App.css'


function App() {
  const [myUser, setMyUser] = useState<any>(null);


onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    setMyUser(user);
    // const uid = user.uid;
    // ...
  } 
});
  // const user = auth.currentUser;
  // console.log(myUser);
  // TODO: use react router
  if (myUser !== null) {
    if (window.location.pathname.includes("view")) {
      return <ViewProject/>;
    } else if (window.location.pathname.includes("edit")) {
      return <EditProjectPage />; 
    } else {
      return <>
      <h1>Encourage Your BB!!!</h1>
      <h3><a href="projects/nino_to_cq/edit">Nino's message to CQ</a></h3>
      <h3><a href="projects/cq_to_nino/edit">CQ's message to Nino</a></h3>
      <h3><a href="projects/projectToken/edit">Test</a></h3>
      <div className="gallery">
  <img alt="ninocqphotos" src="https://lh3.googleusercontent.com/FY7FDB5yWZ9sYC50RFMPqfLvZWHRCoDcG9KV0VYH6NrLJIxpoJku8IxZQjrjW3frR0nQyuLHfIBYIrLZAZAsIy0YijrQCPS2Io-n9fRha8yjpp7Lls5-g5TnOPGNzJY0Z3JYGSehR0E=w1920-h1080" />
  <img alt="ninocqphotos" src="https://lh3.googleusercontent.com/Z7Fq5U6CqpQ-YX1oDosmmA-_HkOPssXfASf_1syCg7j2-0CNc0aCJjrAoDrY3JjnOlxiQ_szQeGchJm8ORtxrSVgdwZlirjYgiM-jdwKFvq-d87CCWzMF2ccKk_0iwVwpPgJUGqkoL0=w1920-h1080" />
  <img alt="ninocqphotos" src="https://lh3.googleusercontent.com/Ov7rGfRfIW2K3NwdRU4UIazk1a914t16teQnRKbvrh8RzC3t76BxLeCi4FI4kMO7gFYqHNTp9PB0a81QF1Vc9u-Yu0v0eZO3y7ak6y6ulk3l7rD9lNhJFDl7fVT5lJiJ2F94SI6Mo3c=w1920-h1080" />
  <img alt="ninocqphotos" src="https://lh3.googleusercontent.com/DCaCRgA8-nitcrSEvvrke3Vf2549oqXm9jbH8TwIupxILHKSlqbZSCem08zk2v5c-E7LYedc8H2mIilaQSBlSqK1jaEtwGJSSvHMF-cbb2VnrKPzLFCl7V34DIY1mbINwqvyLoT9jtM=w1920-h1080" />
  <img alt="ninocqphotos" src="https://lh3.googleusercontent.com/AX2CmK-lvVdcRp0QOcmD68BWMnFD20qXLhcIN6-77Q7hlhq4rWjHotmMBkrtayqG0HErAEMpoUMXy-PLWnOD1MxIaBlo3dteAdKOLnVy-mmQMoEw-zA-mxGTp5JyK7mTrzvhAQfYThw=w1920-h1080" />
  <img alt="ninocqphotos" src="https://lh3.googleusercontent.com/e4tOiEANkg6N2fcpestzpyBUPeUv0lUPpLLMptmJh1ktcEQ0hKug8O77q-3TKOZWyaRR_dR151ApzqHn-DMn4u-pjFleGGVIa8O3PeTVRIUh4D1ni70-MT4csGqPyszK3KuVxA3zARQ=w1920-h1080" />
  <img alt="ninocqphotos" src="https://lh3.googleusercontent.com/FJlsv3OI4WK7pLSZEVC0mHyCXiuAwdK5oGWsa9I_5VYri9tWI8WyZcxy4wX9QUq7HQWEWGPtL5ITPAHsZh9oDA5WOj2Uapfaol04YXCcBc87b0qBw23GN774krzJTFsgzHCCvibHGcI=w1920-h1080" />
  <img alt="ninocqphotos" src="https://lh3.googleusercontent.com/brHJVH77LuPXDPwz3yYu7ZDcSPawWRBCoIERDrK2INCI0pB8UQxTOxvsKnMCm-v1ctCoxiKeqrrVP_CfAg2ryjCHBtb8ThxmeWPKfOVdfaeqidoVeOjH3qsGbSWZ_NTwVt2hqRBkZwA=w1920-h1080" />
  <img alt="ninocqphotos" src="https://lh3.googleusercontent.com/dw9IyKtxBH2HMpxImxLvTWZmGxzZvjcvAoDSq-avOowGYtSgiSzowyOsUgssxCTWscqmoUqntv7Hw8CyINspJqZ65m8amZ88SVTQO45aQLT_UFfZUhpaRbeFOCO9u3z4cWm9jQvassU=w1920-h1080" />
  <img alt="ninocqphotos" className="full-row" src="https://lh3.googleusercontent.com/gWPE0vx_jyOvSHZwq4W-5w3PYK8o9SnJeBqowN5C8aGY3hA5FtJ9xUpwx4wnlZp_S84VpJ-6hX-uyLWhDcKIQ9qs2lIIA-Fl0KAYzgwGKK8xkwAeb-Kahx4FWwlWFB-dcFzaZmAt8Yk=w1920-h1080" />
</div>
      </>
    }
  } else {
    // window.location.replace("/authenticate");
    return <AuthenticationPage/>
  }
}

export default App;
