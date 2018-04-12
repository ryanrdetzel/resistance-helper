/* global firebase:false */

class TwitterAuth {

  constructor ({ onAuth, onError }) {
    this.callbacks = {
      onAuth,
      onError
    }
    this.addListeners();
  }

  signIn() {
    const provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }

  addListeners() {
    firebase.auth().getRedirectResult().catch(this.callbacks.onError);
    firebase.auth().onAuthStateChanged( user => {
      let userState = null;
      if (user) {
        userState = {
          uid: user.uid,
          name: user.displayName
        };
      }
      this.callbacks.onAuth(userState);
    });
  }
}
export default TwitterAuth;
