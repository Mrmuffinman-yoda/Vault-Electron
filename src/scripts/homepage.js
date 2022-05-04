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
            <div class="col-sm">
                <button id = "Single pairer" type="button" class="btn btn-success">Create</button>
                <button id = "Single Paree" type="button" class="btn btn-danger"> Await </button>
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
                            <h6 id="username">Select to recover files</h6>
                          </div>
                          <div class="col-sm">
                          </div>
                          <div class="col-sm">
                            <button id="recoverNow" type="button" class="btn btn-success">Recover Now</button>
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
    var button = document.getElementById("Single pairer");
    var button2 = document.getElementById("Single Paree");
    var button3 = document.getElementById("backupNow");
    var button4 = document.getElementById("recoverNow");
    var button5 = document.getElementById("recieveNow");
    button3.disabled = true;
    button4.disabled = true;
    button5.disabled = true;
    button.onclick = function () {
        createConnection(firebaseConfig, GROUP, PAIRS, USERNAME, NICKNAME, GROUP_ID, FilesList, location, Backupzip);
        button.disabled = true;
        button2.disabled = true;
    }
    button2.onclick = function () {
        recieveConnection(firebaseConfig, GROUP, PAIRS, USERNAME, NICKNAME, GROUP_ID, FilesList, location, Backupzip);
        button.disabled = true;
        button2.disabled = true;
    }
}
const recieveConnection = async (firebaseConfig, GROUP , PAIRS, USERNAME, NICKNAME,GROUP_ID,FilesList,peerLocation,zipLocation) =>{
    var button3 = document.getElementById("backupNow");
    var button4 = document.getElementById("recoverNow");
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
        console.log("TEST");
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
        button3.disabled = false;
        button4.disabled = false;
        button5.disabled = false;
        const recieveChannel = event.channel;
        recieveChannel.send("ARE WE CONNECTED?");
        recieveChannel.onmessage = (event) => {
            console.log(event.data);
        }
    }



const send = () => {
    sendChannel.send("SENDING");
    const filename = zipLocation

    const MAXIMUM_FILE_SIZE = 64000;
    const END_OF_FILE = 'EOF';

    const fileReader = new FileReader(filename);
    fileReader.readAsArrayBuffer(filename);
    fileReader.onload = function (event) {
        const arrayBuffer = fileReader.result;
        const byteArray = new Uint8Array(arrayBuffer);
        const chunkSize = MAXIMUM_FILE_SIZE;
        const chunks = Math.ceil(byteArray.length / chunkSize);
        for (let i = 0; i < chunks; i++) {
            while (sendChannel.bufferedAmount > MAXIMUM_FILE_SIZE) {
                new Promise(resolve => setTimeout(resolve, 100));
            }
            const start = i * chunkSize;
            const end = start + chunkSize;
            const chunk = byteArray.slice(start, end);
            const chunkBuffer = new Uint8Array(chunk);
            const chunkArrayBuffer = chunkBuffer.buffer;
            sendChannel.send(chunkArrayBuffer);
        }
        sendChannel.send(END_OF_FILE);
    }
}



}
const createConnection = async (firebaseConfig, GROUP, PAIRS, USERNAME, NICKNAME, GROUP_ID, FilesList, peerlocation,zipLocation) =>{
    var button3 = document.getElementById("backupNow");
    var button4 = document.getElementById("recoverNow");
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

    answerCandidates.onSnapshot((snapshot) => {
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
        button3.disabled = false;
        button4.disabled = false;
        button5.disabled = false;
        console.log("Listening for connection")
        if (peerConnection.connectionState === 'connected') {
            console.log("[STATUS]:" + sendChannel.readyState)
        }
    });

    button3.onclick = function () {
        send();
    }
    
    sendChannel.onmessage = (event) => {
        
        console.log(location);
        // if message equals sending , get ready to recieve blob
        if (event.data === "SENDING") {
            const END_OF_FILE = 'EOF';
            const data = event.data;
            try{
                if(data === END_OF_FILE){
                    recievedbuffer.push(data);
                }
                else{
                    const arrayBuffer = receivedbuffer.reduce((acc, curr) => {
                        const tmp = new Uint8Array(acc.byteLength + curr.byteLength);
                        tmp.set(new Uint8Array(acc), 0);
                        tmp.set(new Uint8Array(curr), acc.byteLength);
                        return tmp.buffer;
                    }, new ArrayBuffer(0));
                    const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    console.log("File name is : " + FILE_NAME)
                    a.download = FILE_NAME;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    const hash = cryptojs.MD5(blob);
                    console.log("Hash: " + hash);
                }
            }catch(e){
                console.log(e);
            }
        }
        //send file name to main.js
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
