const { times } = require("lodash");

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
const peerConnection = new RTCPeerConnection(servers);
  
//Grabbing HTML elements for use in javascript file

const callButton = document.getElementById("callButton");
const sendButton = document.getElementById("sendButton"); 
const callInput = document.getElementById("callInput");
const file = document.getElementById("formFile");

// After ice candidates are exchanged , open data channel based on senders data channel
const sendChannel = peerConnection.createDataChannel("sendChannel");


sendChannel.onopen = () => {
  const filename = file.files[0].name;
  var readyState = sendChannel.readyState;
  sendChannel.send("NAME"+filename);
  if (readyState == "open") {
    // sendChannel.binaryType = "arraybuffer";
    // const filereader = new FileReader();
    // const arraybuffer = filereader.readAsArrayBuffer(file.files[0]);
    // filereader.onload = () => {
    //   sendChannel.send(arraybuffer);
    //   console.log("File sent" + file.files[0].name);
    //   console.log("[STATUS]:" + sendChannel.readyState)
    // }
    // console.log("[STATUS]:" + sendChannel.readyState)
    // // sendChannel.onopen = () => {
    // //   const arraybuffer = await file.arrayBuffer();
    // //   sendChannel.send(arraybuffer);

    const MAXIMUM_FILE_SIZE = 64000;
    const END_of_FILE = "EOF";

    const file = document.getElementById("formFile").files[0];
    const fileReader = new FileReader(file);
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = async () => {
      const arrayBuffer = fileReader.result;
      const byteArray = new Uint8Array(arrayBuffer);
      const chunkSize = MAXIMUM_FILE_SIZE;
      const chunks = Math.ceil(byteArray.length / chunkSize);
      for (let i = 0; i < chunks; i++) {
        //wait if buffer is full
        console.clear()
        console.log(Math.round((i/chunks)*100) + "%");
        while (sendChannel.bufferedAmount > MAXIMUM_FILE_SIZE) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        const start = i * chunkSize;
        const end = start + chunkSize;
        const chunk = byteArray.slice(start, end);
        const chunkBuffer = new Uint8Array(chunk);
        const chunkArrayBuffer = chunkBuffer.buffer;
        sendChannel.send(chunkArrayBuffer);
      }
      //create checksum of file
      const checksum = await sha256(arrayBuffer);
      print("Checksum: " + checksum);
      sendChannel.send(END_of_FILE);
    }
    
  }
  if(readyState == "closed"){
    console.log("Channel closed")
  }
  if(readyState == "connecting"){
    console.log("Channel connecting")
  }
  if(readyState == "closing"){
    console.log("Channel closing")
  }
}
//Creating offer
callButton.onclick = async() =>{
    //reference Firestore collections for signaling
    const callDoc = firestore.collection("calls").doc();
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    callInput.value = callDoc.id;

    //get candidates for caller , save to database
    peerConnection.onicecandidate = (event) =>{
        event.candidate && offerCandidates.add(event.candidate.toJSON());

    };
    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
    };
    await callDoc.set({ offer });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      peerConnection.setRemoteDescription(answerDescription);
    }
  });

    //When remote call answered , add candidates to peer connection
    answerCandidates.onSnapshot((snapshot)=>{
        snapshot.docChanges().forEach((change)=> {
            if(change.type === "added"){
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate);
            }
        })
    })

// Listen for connectionstatechange on the local RTCPeerConnection
peerConnection.addEventListener('connectionstatechange', event => {
  console.log("Listening for connection")
    if (peerConnection.connectionState === 'connected') {
        console.log("[STATUS]:" + sendChannel.readyState)
    }
  });
sendChannel.onmessage = (event) => {
    console.log("Message received: " + event.data);
  }
}



//send file
// sendButton.onclick = async() =>{
//     console.log("Sending file")
//     const file = document.getElementById("formFile").files[0];
//     const fileReader = new FileReader();
//     fileReader.onload = async() =>{
//         const fileData = fileReader.result;
//         const fileName = file.name;
//         const fileType = file.type;
//         const fileSize = file.size;
//         const fileBlob = new Blob([fileData], {type: fileType});
//         const fileRef = firestore.collection("files").doc();
//         const fileId = fileRef.id;
//         const fileDoc = firestore.collection("files").doc(fileId);
//         await fileDoc.set({
//             fileName,
//             fileType,
//             fileSize,
//             fileBlob,
//         });
//         const fileUrl = await fileRef.get().then(doc => {
//             if (!doc.exists) {
//                 console.log("No such document!");
//             } else {
//                 console.log("Document data:", doc.data());
//                 return doc.data().fileBlob;
//             }
//         }).catch(err => {
//             console.log("Error getting document", err);
//         });
//         console.log("File url:" + fileUrl)
//         sendChannel.send(fileUrl);
//     }
//     fileReader.readAsArrayBuffer(file);
// }