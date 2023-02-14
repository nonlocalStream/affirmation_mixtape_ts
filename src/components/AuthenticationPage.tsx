
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import {auth} from '../firebaseConfig.js'

var ui = new firebaseui.auth.AuthUI(auth);
        var uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(authResult:any, redirectUrl:any) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
          },
        //   uiShown: function() {
        //     // The widget is rendered.
        //     // Hide the loader.
        //     document.getElementById('loader').style.display = 'none';
        //   }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: '/',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    
        ],
      };
    ui.start('#firebaseui-auth-container', uiConfig);
export default function AuthenticationPage() {

    
    
return <>
<div id="firebaseui-auth-container"></div>
</>

}