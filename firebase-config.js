const firebaseConfig = {
  apiKey: "AIzaSyDVuJ6k4IqDaFIZ6LtiNf956V9z3P6VTJ0",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "cafeadda2-330af.firebaseapp.com",
  storageBucket: "cafeadda2-330af.firebasestorage.app",
  messagingSenderId: "291257211795",
  appId: "1:291257211795:web:c9a1979ac2d60740d5e666"
};

// Initialize Firebase (COMPAT STYLE)
firebase.initializeApp(firebaseConfig);

// Create global auth & db variables
var auth = firebase.auth();
var db = firebase.firestore();
