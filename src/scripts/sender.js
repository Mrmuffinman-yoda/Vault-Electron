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

// Initiate firebase app
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
//initiate firestore variable to access firebase object
const firestore = firebase.firestore();

//Initiating stun servers
const servers = {
    iceServers: [
      {
        urls: ['stun:stun2.l.google.com:19302','stun:stun3.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };
//Setting global state for webRTC
const rc = new RTCPeerConnection(servers);
  
//Grabbing HTML elements for use in javascript file

console.log("HTML elements loaded")
const callButton = document.getElementById("callButton");
const sendButton = document.getElementById("sendButton"); 
const callInput = document.getElementById("callInput");
const file = document.getElementById("formFile");

console.log("Creating data channel");
const sendChannel = rc.createDataChannel("sendChannel");

checker.onclick = async() =>{
  sendChannel.send("Hello , are we connected?")
}

//Creating offer
callButton.onclick = async() =>{
    //reference Firestore collections for signaling
    const callDoc = firestore.collection("calls").doc();
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    callInput.value = callDoc.id;

    //get candidates for caller , save to database
    rc.onicecandidate = (event) =>{
        event.candidate && offerCandidates.add(event.candidate.toJSON());

    };
    console.log("Creating offers");
    const offerDescription = await rc.createOffer();
    await rc.setLocalDescription(offerDescription);

    const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
    };
    await callDoc.set({ offer });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
    console.log("Remote answer")
    const data = snapshot.data();
    if (!rc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      rc.setRemoteDescription(answerDescription);
    }
  });

    //When remote call answered , add candidates to peer connection
    answerCandidates.onSnapshot((snapshot)=>{
        console.log("Candidate added to peer connections")
        snapshot.docChanges().forEach((change)=> {
            if(change.type === "added"){
                const candidate = new RTCIceCandidate(change.doc.data());
                rc.addIceCandidate(candidate);
            }
        })
    })

// Listen for connectionstatechange on the local RTCPeerConnection
rc.addEventListener('connectionstatechange', event => {
    console.log("Listening for connection")
    if (rc.connectionState === 'connected') {
        console.log("Peers Connected")
        console.log("Status:" + sendChannel.readyState)
        sendChannel.send("Hello , are we connected?")
    }
  });

}