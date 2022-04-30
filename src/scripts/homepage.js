//javascript file for selecting usernames
const { app,ipcRenderer } = require('electron');
//If username file exists then ignore this and continue with program


const firebaseConfig = {
    apiKey: "AIzaSyC4kz53hWrJs78IdyPcTbloN2izYXN8QvI",
    authDomain: "vaultv3-3474c.firebaseapp.com",
    projectId: "vaultv3-3474c",
    storageBucket: "vaultv3-3474c.appspot.com",
    messagingSenderId: "566355166597",
    appId: "1:566355166597:web:42d875bc97651e84cbb0ec"
};
var GROUP_ID = "052afCQj00rDQQj0MJ9b";
var USER_NAME = "";
var ALLOCATED_SIZE = "";
var GROUP = false;
var leader = false;
var users = {
    "users": [],
    "connections": [],
    "leader": []
};
window.onload = async() =>{
    //ask main process to read username
    ipcRenderer.send('GETUSERNAME');
    ipcRenderer.on('RECIEVE', (event, arg) => {
        var username = arg;
        document.getElementById("userWelcome").innerHTML = "Welcome back " + username + "!";
        console.log(username);
    });
    ipcRenderer.send("GETCONFIG");
    ipcRenderer.on('CONFIG', (event, arg) => {
        var firebaseConfig = arg;
        console.log(firebaseConfig);
    });
    ipcRenderer.send("GETGROUPID");
    ipcRenderer.on('GROUPID', (event, arg) => {
       GROUP_ID = arg;
       console.log(GROUP_ID);
    });
    ipcRenderer.send("GETCONNECTIONID");
    ipcRenderer.on('GETCONNECTIONID', (event, arg) => {
         var connectionID = arg;
        console.log("connectionID");
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
    const groupRef = firestore.collection("groups").doc(GROUP_ID);
    const pairRef = groupRef.collection("pairs").doc("connectionID");
    const offerCandidates = pairRef.collection("offerCandidates");
    const answerCandidates = pairRef.collection("answerCandidates");


    //Setting global state for webRTC

    const sendConnection = new RTCPeerConnection(servers);
    const recieveConnection = new RTCPeerConnection(servers);
    const sendChannel = sendConnection.createDataChannel("sendChannel");
    // callInput.value = pairRef.id;

    //get candidates for caller , save to database
    sendConnection.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());

    };
    const offerDescription = await sendConnection.createOffer();
    await sendConnection.setLocalDescription(offerDescription);

    const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
    };
    await pairRef.set({ offer });

    // Listen for remote answer
    pairRef.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!sendConnection.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            sendConnection.setRemoteDescription(answerDescription);
        }
    });
    }