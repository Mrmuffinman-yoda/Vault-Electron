 //import firebase from './bower_components/firebase/firebase.js';
// import './bower_components/firebase/firebase-firestore.js';
//import firebase from 'E:/Final Year Project work/Electron build/vault_electron/bower_components/firebase/firebase.js'
//import 'E:/Final Year Project work/Electron build/vault_electron/bower_components/firebase/firebase-firestore.js';
//import firebase from './firebase/app';
//import './firebase/firestore';
//firebase API key
var cryptojs = require("crypto-js");
const { app }= require('electron');
const { ipcRenderer } = require('electron');
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
  if(FILE_NAME == undefined){
    var FILE_NAME = "";
  }
  sendChannel.binaryType = 'arraybuffer';
  sendChannel.onopen = () => {
  };
  const receivedbuffer = [];
  sendChannel.onmessage = (event) => {
    const END_OF_FILE = 'EOF';
    // // download file from arraybuffer
    // const a = document.createElement('a');
    // const url = window.URL.createObjectURL(event);
    // a.href = url;
    // a.download = 'file.txt';
    // a.click();
    // window.URL.revokeObjectURL(url);

    // // download file from blob
    const data = event.data;
    try{
      // if(data = "NAME"){
      //   for(var i = 0; i < 2; i++){
      //     FILE_NAME = data
      //   }
      // }
      if (typeof data !== "object"&&data!==END_OF_FILE) {
        if (data.substring(0, 4) === "NAME") {
          // remove first 4 letters from data
          FILE_NAME = data.substring(4, data.length)
        } 
      }
      if(data !== END_OF_FILE){
        
        receivedbuffer.push(data);
      }
      else{
        //Finished recieving file
        const arrayBuffer = receivedbuffer.reduce((acc, curr) => {
          const tmp = new Uint8Array(acc.byteLength + curr.byteLength);
          tmp.set(new Uint8Array(acc), 0);
          tmp.set(new Uint8Array(curr), acc.byteLength);
          return tmp.buffer;
        }, new ArrayBuffer(0));
        const blob = new Blob([arrayBuffer], {type: 'application/octet-stream'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        //send file name to main.js
        var fileValues = [FILE_NAME, url,blob,a]
        //send fileValues to main.js
        ipcRenderer.send('fileValues', fileValues);

        // a.href = url;
        // console.log("File name is : " + FILE_NAME)
        // a.download = FILE_NAME;
        // a.click();
        // window.URL.revokeObjectURL(url);
        // const hash = cryptojs.MD5(blob);
        // console.log("Hash: " + hash);
      }
    }catch(err){
      console.log(err)
    }
    // console.log(event.data)
  };
  sendChannel.onclose = () => {
    console.log("Channel closed");
  };
  peerConnection.channel = sendChannel;
}
function slicer(data) {
  const slicedData = data.slice(4);
  return slicedData;
}

var groupID = "adefdf4wsefsf32"
var pairID = "124eeaf4wsgs4gwe2";
// 3. Answer the call with the unique ID
answerButton.onclick = async () => {
  console.log("Answer Call")
  const callId = textBox.value;
  const groupRef = firestore.collection("groups").doc(groupID);
  const pairRef = firestore.collection("pairs").doc(pairID);
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
});
//recieve file from sender
// peerConnection.ondatachannel = (event) => {
//   const sendChannel = event.channel;
//   sendChannel.binaryType = "arraybuffer";

//   sendChannel.onmessage= (event) => {
//     const data = event.data;
//     try{
//       const blob = new Blob([data]);
//       downloadFile(blob, sendChannel.label);
//       sendChannel.close();
//     }
//     catch(error){
//       console.log(error + "Error in sending file");
//     }
//   }
// }
//#endregion

