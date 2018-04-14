
class TwitterAuth {

  constructor ({firebase, onAuth, onError }) {
    this.firebase = firebase;
    this.callbacks = {
      onAuth,
      onError
    }
    this.addListeners();
  }

  signIn() {
    const provider = new this.firebase.auth.TwitterAuthProvider();
    this.firebase.auth().signInWithRedirect(provider);
  }

  addListeners() {
    this.firebase.auth().getRedirectResult().catch(this.callbacks.onError);
    this.firebase.auth().onAuthStateChanged( user => {
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
