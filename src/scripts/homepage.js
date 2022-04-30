//javascript file for selecting usernames
const { app,ipcRenderer } = require('electron');
//If username file exists then ignore this and continue with program
var firebaseConfig = {
};
window.onload = function(){
    //ask main process to read username
    ipcRenderer.send('GETUSERNAME');
    ipcRenderer.send("GETCONFIG");
    const groupDoc = firestore.collection("groups").doc();
    const callDoc = groupDoc.collection("calls").doc();
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");
    }

ipcRenderer.on('RECIEVE', (event, arg) => {
    username = arg;
    document.getElementById("userWelcome").innerHTML = "Welcome back " + username + "!";
    console.log(username);
});
ipcRenderer.on('CONFIG', (event, arg) => {
    firebaseConfig = arg;
    console.log(firebaseConfig);
});
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();
const servers = {
    iceServers: [
        {
            urls: ['stun:stun2.l.google.com:19302', 'stun:stun3.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};
//Setting global state for webRTC
const sendConnection = new RTCPeerConnection(servers);
const recieveConnection = new RTCPeerConnection(servers);

const sendChannel = sendConnection.createDataChannel("sendChannel");

