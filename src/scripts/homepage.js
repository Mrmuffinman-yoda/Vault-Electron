const { app, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
var cryptojs = require("crypto-js");
const crypto = require('crypto');

var filler = document.getElementById("filler");
window.onload = function() {
    ipcRenderer.send('GETUSERNAME');
    ipcRenderer.on('RECIEVE', (event, arg) => {
        USERNAME = arg;
        document.getElementById("userWelcome").innerHTML = "Welcome back " + USERNAME + "!";
        console.log(USERNAME);
    });
    checkGroups();
    ipcRenderer.send("GETCONFIG");
    ipcRenderer.send("SENDPAIRS");
    ipcRenderer.on('PAIRS', (event, arg) => {
        PAIRS = arg;
        console.log(PAIRS.length)
        var connected = [];
        for (var i = 0; i < PAIRS.length; i++) {
            connected[i] = false;
        }
        if(PAIRS.length > 0){
            checkGroups(arg,connected);
        }
        else{
            filler.innerHTML = "You need to add friends first!"
        }
        // connections(arg,connected);
    });
    

}



async function checkGroups (PAIRS,CONNECTED){
    var GROUP = await ipcRenderer.invoke('GETGROUP');
    console.log(GROUP)
    if(GROUP ===true){
        groupStarter(PAIRS,CONNECTED);
    }
    else if (GROUP === false){
        pairStarter(PAIRS,CONNECTED)
    }
    else{
        console.log("ERROR")
    }
}






async function groupStarter() {
    var firebaseConfig = await ipcRenderer.invoke('GETCONFIG');
    console.log(firebaseConfig)
    var PAIRS = arg;
    console.log(PAIRS)
    var firsttime = await ipcRenderer.invoke('GETFIRSTTIME');
    console.log(firsttime)
    console.log(connected)

    //#region firebase configuration
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    //initiate firestore variable to access firebase object
    const firestore = firebase.firestore();

    //Initiating stun servers
    const servers = {
        iceServers: [
            {
                urls: ['stun:stun2.l.google.com:19302', 'stun:stun3.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };
    //#endregion
    var connectionArray = [];
    var connections = [];
    var pairArray = [];
    var offerArray = [];
    var offers = [];
    var offerCandidates = [];
    var answerCandidates = [];
    for (var i = 0; i < PAIRS.length; i++) {
        connectionArray[i] = new RTCPeerConnection(servers);
        connections[i] = connectionArray[i].createDataChannel("channel" + i);
    }
    const groupRef = firestore.collection("GroupID").doc(GROUP_ID);
    for (var i = 0; i < PAIRS.length; i++) {
        console.log(PAIRS[i][1])
        pairArray[i] = groupRef.collection("PAIRS").doc(PAIRS[i][1]);
        offerCandidates[i] = pairArray[i].collection("offerCandidates");
        answerCandidates[i] = pairArray[i].collection("answerCandidates");
    }
    console.log("GROUPID : " + GROUP_ID)
    for (var i = 0; i < PAIRS.length; i++) {
        connectionArray[i].onicecandidate = (event) => {
            event.candidate && offerCandidates[i].add(event.candidate.toJSON());
        };
        offerArray[i] = await connectionArray[i].createOffer();
        await connectionArray[i].setLocalDescription(offerArray[i]);
        offers[i] = {
            sdp: offerArray[i].sdp,
            type: offerArray[i].type,
        };
        var offer = offers[i]
        await pairArray[i].set({ offer });
    }

    for (var i = 0; i < PAIRS; i++) {
        pairArray[i].onSnapshot((snapshot) => {
            const data = snapshot.data();
            if (!connectionArray[i].currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                connectionArray[i].setRemoteDescription(answerDescription);
            }
        });
    }
    for (var i = 0; i < PAIRS; i++) {
        connectionArray[i].addEventListener('connectionstatechange', event => {
            console.log("Listening for connection")
            if (connectionArray[i].connectionState === 'connected') {
                console.log("[STATUS]:" + sendChannel.readyState)
            }
        });
    }


    if (firsttime == true) {

    }









}

async function pairStarter(){
    var content = `
    <div class="container">
        <div class="row">
            <div class="col-sm">
                <p id = "username"> </p>
            </div>
            <div class="col-sm">
            </div>
            <div class="col-sm">
                <button type="button" class="btn btn-success">Pair</button>
                <button type="button" class="btn btn-danger">Pairing</button>
            </div>
        </div>
    </div>`;
    filler.innerHTML = content
}
ipcRenderer.send("GETGROUPID");
ipcRenderer.on('GROUPID', (event, arg) => {
    GROUP_ID = arg;
});
async function connections  (arg,connected){
   
}



const addFriend = document.getElementById("addFriend");

addFriend.onclick = function () {
    //tell main to make new window
    ipcRenderer.send('ADDFRIENDWINDOW');
}
senderButton.onclick = function () {
    //tell main to make new window
    ipcRenderer.send('SENDERWINDOW');
}

recieverButton.onclick = function () {
    //tell main to make new window
    ipcRenderer.send('RECIEVERWINDOW');
}


