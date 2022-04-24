 //import firebase from './bower_components/firebase/firebase.js';
// import './bower_components/firebase/firebase-firestore.js';
//import firebase from 'E:/Final Year Project work/Electron build/vault_electron/bower_components/firebase/firebase.js'
//import 'E:/Final Year Project work/Electron build/vault_electron/bower_components/firebase/firebase-firestore.js';
//import firebase from './firebase/app';
//import './firebase/firestore';
console.log("Firebase configuration")
//firebase API key
const firebaseConfig = {
  apiKey: "AIzaSyC4kz53hWrJs78IdyPcTbloN2izYXN8QvI",
  authDomain: "vaultv3-3474c.firebaseapp.com",
  projectId: "vaultv3-3474c",
  storageBucket: "vaultv3-3474c.appspot.com",
  messagingSenderId: "566355166597",
  appId: "1:566355166597:web:42d875bc97651e84cbb0ec"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();
console.log("Stun servers loaded")
//Stun servers config for WebRTC
const servers = {
  iceServers: [
    {
      urls: ['stun:stun2.l.google.com:19302','stun:stun3.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State
const pc = new RTCPeerConnection(servers);

// HTML elements
console.log("HTML elements loaded")
const answerButton = document.getElementById('sendButton');
const textBox = document.getElementById('formFile')


// 1. Setting up data channels
console.log("Creating data channel")
const sendChannel = pc.createDataChannel("sendChannel");


// 2. Create an offer


// 3. Answer the call with the unique ID
answerButton.onclick = async () => {
  console.log("Answer Call")
  const callId = textBox.value;
  const callDoc = firestore.collection('calls').doc(callId);
  const answerCandidates = callDoc.collection('answerCandidates');
  const offerCandidates = callDoc.collection('offerCandidates');

  pc.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };

  const callData = (await callDoc.get()).data();

  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await callDoc.update({ answer });

  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change);
      if (change.type === 'added') {
        let data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
};
// Listen for connectionstatechange on the local RTCPeerConnection
pc.addEventListener('connectionstatechange', event => {
  console.log("Listening for connection")
  if (pc.connectionState === 'connected') {
      console.log("Peers Connected")
      console.log("Status:" + sendChannel.readyState)
      sendChannel.send("Hello , are we connected?")
  }
});