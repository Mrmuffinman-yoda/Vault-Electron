 //import firebase from './bower_components/firebase/firebase.js';
// import './bower_components/firebase/firebase-firestore.js';
//import firebase from 'E:/Final Year Project work/Electron build/vault_electron/bower_components/firebase/firebase.js'
//import 'E:/Final Year Project work/Electron build/vault_electron/bower_components/firebase/firebase-firestore.js';
//import firebase from './firebase/app';
//import './firebase/firestore';
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
const peerConnection = new RTCPeerConnection(servers);

// HTML elements
const answerButton = document.getElementById('sendButton');
const textBox = document.getElementById('formFile')
const checker = document.getElementById('checkbutton')


// // 1. Setting up data channels
// console.log("Creating data channel")
// const dataChannel = peerConnection.createDataChannel("sendChannel");

// // 2. Setting up the data channel when opened
// sendChannel.onopen = function(event) {
//   var readyState = sendChannel.readyState;
//   if (readyState == "open") {
//     sendChannel.send("Hello");
//   }
// };


//setting up data channel new

peerConnection.ondatachannel = (event) => {
  const sendChannel = event.channel;
  sendChannel.onopen = () => {
    sendChannel.send("Hello");
  };
  sendChannel.onmessage = (event) => {
    console.log(event.data);
  };
  sendChannel.onclose = () => {
    console.log("Channel closed");
  };
  peerConnection.channel = sendChannel;
}

// 3. Answer the call with the unique ID
answerButton.onclick = async () => {
  console.log("Answer Call")
  const callId = textBox.value;
  const callDoc = firestore.collection('calls').doc(callId);
  const answerCandidates = callDoc.collection('answerCandidates');
  const offerCandidates = callDoc.collection('offerCandidates');

  peerConnection.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };

  const callData = (await callDoc.get()).data();

  const offerDescription = callData.offer;
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await callDoc.update({ answer });

  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        let data = change.doc.data();
        peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
};
// Listen for connectionstatechange on the local RTCPeerConnection
peerConnection.addEventListener('connectionstatechange', event => {
  console.log("Listening for connection")
  if (peerConnection.connectionState === 'connected') {
      console.log("[STATUS]:" + peerConnection.connectionState)
  }
// });
// checker.onclick = async() =>{
//   peerConnection.channel.send("Hello , are we connected?")
// }
});