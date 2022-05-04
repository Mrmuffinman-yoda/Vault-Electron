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
                // if(data = "NAME"){
                //   for(var i = 0; i < 2; i++){
                //     FILE_NAME = data
                //   }
                // }
                if (typeof data !== "object" && data !== END_OF_FILE) {
                    if (data.substring(0, 4) === "NAME") {
                        // remove first 4 letters from data
                        FILE_NAME = data.substring(4, data.length)
                    }
                }
                if (data !== END_OF_FILE) {

                    recievedbuffer.push(data);
                }
                else {
                    //Finished recieving file
                    const arrayBuffer = receivedbuffer.reduce((acc, curr) => {
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
    
    sendChannel.onopen = () => {
        const filename = zipLocation;
        var readyState = sendCHannel.readyState;
        sendChannel.send("Name" + filename);
        
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
