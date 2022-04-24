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

const callButton = document.getElementById("callButton");
const sendButton = document.getElementById("sendButton"); 
const callInput = document.getElementById("callInput");
const file = document.getElementById("formFile");

// After ice candidates are exchanged , open data channel based on senders data channel
const sendChannel = rc.createDataChannel("sendChannel");
sendChannel.onopen = () => {
  var readyState = sendChannel.readyState;
  if (readyState == "open") {
    sendChannel.send("Hello");
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
    rc.onicecandidate = (event) =>{
        event.candidate && offerCandidates.add(event.candidate.toJSON());

    };
    const offerDescription = await rc.createOffer();
    await rc.setLocalDescription(offerDescription);

    const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
    };
    await callDoc.set({ offer });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!rc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      rc.setRemoteDescription(answerDescription);
    }
  });

    //When remote call answered , add candidates to peer connection
    answerCandidates.onSnapshot((snapshot)=>{
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
        console.log("[STATUS]:" + sendChannel.readyState)
    }
  });
sendChannel.onmessage = (event) => {
    console.log("Message received: " + event.data);
  }
}
//send file
sendButton.onclick = async() =>{
    console.log("Sending file")
    const file = document.getElementById("formFile").files[0];
    const fileReader = new FileReader();
    fileReader.onload = async() =>{
        const fileData = fileReader.result;
        const fileName = file.name;
        const fileType = file.type;
        const fileSize = file.size;
        const fileBlob = new Blob([fileData], {type: fileType});
        const fileRef = firestore.collection("files").doc();
        const fileId = fileRef.id;
        const fileDoc = firestore.collection("files").doc(fileId);
        await fileDoc.set({
            fileName,
            fileType,
            fileSize,
            fileBlob,
        });
        const fileUrl = await fileRef.get().then(doc => {
            if (!doc.exists) {
                console.log("No such document!");
            } else {
                console.log("Document data:", doc.data());
                return doc.data().fileBlob;
            }
        }).catch(err => {
            console.log("Error getting document", err);
        });
        console.log("File url:" + fileUrl)
        sendChannel.send(fileUrl);
    }
    fileReader.readAsArrayBuffer(file);
}