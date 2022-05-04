const { app, ipcRenderer, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
var cryptojs = require("crypto-js");
const crypto = require('crypto');
var fsUtils = require("nodejs-fs-utils");
const { send } = require('process');
var GROUP;
var size;

window.onload = function() {
    init();
}

// ipcRenderer.send("GETCONFIG");
// ipcRenderer.send("SENDPAIRS");
// ipcRenderer.send("GROUP");
// ipcRenderer.send('GETUSERNAME');
// ipcRenderer.on('GROUPT', (event, arg) => {
//     GROUP = arg;
// });


async function filesize(){

}


async function init(){
    fsUtils.fsize(await ipcRenderer.invoke('GETDOWNLOADS'), function (errs, size) {
        var size = size / 1000000000;
        console.log("Download folder size: " + size);
        return size
    });


    var FilesList = await ipcRenderer.invoke("GETFILES")
    console.log("Files List: "+FilesList);
    console.log("Folder Size: "+ size);
    var firebaseConfig = await ipcRenderer.invoke('GETCONFIG');
    var GROUP = await ipcRenderer.invoke('GETGROUP');
    var PAIRS = await ipcRenderer.invoke('GETPAIRS');
    var USERNAME = await ipcRenderer.invoke('GETUSERNAME');
    var NICKNAME = await ipcRenderer.invoke('GETNICKNAME');
    var GROUP_ID = await ipcRenderer.invoke('GETGROUPID');
    var filler = document.getElementById("filler");
    var filler2 = document.getElementById("filler2");
    var location = await ipcRenderer.invoke('GETPEERLOCATION');
    var Backupzip = await ipcRenderer.invoke('GETBACKUPZIP');
    console.log("Location: " + location);
    var content = `
    <div class="p-3 mb-2 bg-secondary  text-white">
        <div class="row">
            <div class="col-sm">
                <h3 id = "username"> </h3>
            </div>
            <div class="col-sm">
            </div>
            
        </div>
    </div>`;
    var content2 = `
        <div class="p-3 mb-2 bg-secondary  text-white">
                        <div class="row">
                          <div class="col-sm">
                            <h6 id="username">Select to backup  </h6>
                          </div>
                          <div class="col-sm">
                          </div>
                          <div class="col-sm">
                            <button id="backupNow" type="button" class="btn btn-success">Backup Now</button>
                        </div>
                      </div>
                      </div>
                      
                        <div class="p-3 mb-2 bg-secondary  text-white">
                        <div class="row">
                          <div class="col-sm">
                            <h6 id="username">Select to recieve files</h6>
                          </div>
                          <div class="col-sm">
                          </div>
                          <div class="col-sm">
                            <button id="recieveNow" type="button" class="btn btn-success">Recieve Now</button>
                          </div>
                        </div>
                        </div>
                        `;

    console.log("Is it too big ? :" + size);
    document.getElementById("userWelcome").innerHTML = "Welcome back " + USERNAME + "!";
    console.log("GROUP: "+GROUP)
    console.log("PAIRS: "+ PAIRS) 
    console.log("Pair Lenght: "+PAIRS.length)
    console.log("NICKNAME: "+NICKNAME[0])
    if (PAIRS.length >= 1 && GROUP === false) {
        filler.innerHTML += content;
        filler2.innerHTML += content2;

        document.getElementById("username").innerHTML = NICKNAME[0];
    }
    else if (PAIRS.length = 0) {
        filler.innerHTML = "You have no group yet, please create one";
    }
    // var button = document.getElementById("Single pairer");
    // var button2 = document.getElementById("Single Paree");
    var button3 = document.getElementById("backupNow");
    var button5 = document.getElementById("recieveNow");
    button3.onclick = function () {
        //Send files
        createConnection(firebaseConfig, GROUP, PAIRS, USERNAME, NICKNAME, GROUP_ID, FilesList, location, Backupzip);

    }
    button5.onclick = function () {
        //Recieve files
        recieveConnection(firebaseConfig, GROUP, PAIRS, USERNAME, NICKNAME, GROUP_ID, FilesList, location, Backupzip);

    }
}
const recieveConnection = async (firebaseConfig, GROUP , PAIRS, USERNAME, NICKNAME,GROUP_ID,FilesList,peerLocation,zipLocation) =>{
    var button3 = document.getElementById("backupNow");
    var button5 = document.getElementById("recieveNow");
    
    
    
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const servers = {
        iceServers: [
            {
                urls: ['stun:stun2.l.google.com:19302', 'stun:stun3.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };
    const peerConnection = new RTCPeerConnection(servers);
    const firestore = firebase.firestore();


    const groupRef = firestore.collection("GroupID").doc(GROUP_ID);
    const PAIR = groupRef.collection("PAIRS").doc(PAIRS[0][1]);
    const offerCandidates = PAIR.collection("offerCandidates");
    const answerCandidates = PAIR.collection("answerCandidates");

    peerConnection.onicecandidate = (event) => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());
    };
    const callData = (await PAIR.get()).data();

    const offerDescription = callData.offer;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);

    const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
    };

    await PAIR.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                let data = change.doc.data();
                peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });

    peerConnection.addEventListener('connectionstatechange', event => {
        console.log("Listening for connection")
        if (peerConnection.connectionState === 'connected') {
            console.log("[STATUS]:" + peerConnection.connectionState)
        }
    });


    peerConnection.ondatachannel = (event) => {
        const sendChannel = event.channel;
        var downloadLocation = peerLocation;
        sendChannel.binaryType = 'arraybuffer';
        const recievedbuffer = [];
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
            try {
                var FILE_NAME = "backup.zip"
                if (data !== END_OF_FILE) {

                    recievedbuffer.push(data);
                }
                else {
                    //Finished recieving file
                    const arrayBuffer = recievedbuffer.reduce((acc, curr) => {
                        const tmp = new Uint8Array(acc.byteLength + curr.byteLength);
                        tmp.set(new Uint8Array(acc), 0);
                        tmp.set(new Uint8Array(curr), acc.byteLength);
                        return tmp.buffer;
                    }, new ArrayBuffer(0));
                    const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    //send file name to main.js

                    a.href = url;
                    console.log("File name is : " + FILE_NAME)
                    a.download = FILE_NAME;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    const hash = cryptojs.MD5(blob);
                    console.log("Hash: " + hash);
                }
            } catch (err) {
                console.log(err)
            }
            // console.log(event.data)
        };
        sendChannel.onclose = () => {
            console.log("Channel closed");
        };
        peerConnection.channel = sendChannel;
    };
}
const createConnection = async (firebaseConfig, GROUP, PAIRS, USERNAME, NICKNAME, GROUP_ID, FilesList, peerlocation,zipLocation) =>{
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const servers = {
        iceServers: [
            {
                urls: ['stun:stun2.l.google.com:19302', 'stun:stun3.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };
    const firestore = firebase.firestore();
    const peerConnection = new RTCPeerConnection(servers);
    const sendChannel = peerConnection.createDataChannel("Channel");

    console.log("Channel created");

    const groupRef = firestore.collection("GroupID").doc(GROUP_ID);
    const PAIR = groupRef.collection("PAIRS").doc(PAIRS[0][1]);
    const offerCandidates = PAIR.collection("offerCandidates");
    const answerCandidates = PAIR.collection("answerCandidates");
    console.log(GROUP_ID)

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);
    
    peerConnection.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
    };
    

    const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
    };

    await PAIR.set({ offer });

    PAIR.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                let data = change.doc.data();
                peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });


    PAIR.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            peerConnection.setRemoteDescription(answerDescription);
        }
    });
    answerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConnection.addIceCandidate(candidate);
            }
        })
    })
    peerConnection.addEventListener('connectionstatechange', event => {
        console.log("Listening for connection")
        if (peerConnection.connectionState === 'connected') {
            console.log("[STATUS]:" + sendChannel.readyState)
        }
    });
    
    sendChannel.onopen = () => {
        const filename = zipLocation;
        //read file from zipLocation
        const file = fs.readFileSync(filename);
        //convert file to blob
        const blob = new Blob([file], { type: 'application/octet-stream' });
        console.log("Sending files")
        var readyState = sendChannel.readyState;
        sendChannel.send("Name" + "backup.zip");
        console.log("Name" + "backup.zip")
        const MAXIMUM_FILE_SIZE = 64000;
        const END_of_FILE = "EOF";
        const fileReader = new FileReader(blob);
        fileReader.readAsArrayBuffer(blob);
        fileReader.onload = async () => {
            const arrayBuffer = fileReader.result;
            const byteArray = new Uint8Array(arrayBuffer);
            const chunkSize = MAXIMUM_FILE_SIZE;
            const chunks = Math.ceil(byteArray.length / chunkSize);
            for (let i = 0; i < chunks; i++) {
                //wait if buffer is full
                // console.clear()
                console.log(Math.round((i / chunks) * 100) + "%");

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
            //take a hash of file
            // const hash = cryptojs.MD5(arrayBuffer);
            // console.log("Hash: " + hash);
            sendChannel.send(END_of_FILE);
        }
    }
    if (readyState == "closed") {
        console.log("Channel closed")
    }
    if (readyState == "connecting") {
        console.log("Channel connecting")
    }
    if (readyState == "closing") {
        console.log("Channel closing")
    }
}


   























































const addFriend = document.getElementById("addFriend");
const backupButton = document.getElementById("BackupSettings");
const help = document.getElementById("help");
addFriend.onclick = function () {
    ipcRenderer.send('ADDFRIENDWINDOW');
}
senderButton.onclick = function () {
    ipcRenderer.send('SENDERWINDOW');
}

recieverButton.onclick = function () {
    ipcRenderer.send('RECIEVERWINDOW');
}
backupButton.onclick = function () {
    ipcRenderer.send('BACKUPWINDOW');
}
help.onclick = function () {
    ipcRenderer.send('HELPWINDOW');
}
