//javascript file for selecting usernames
const { app,ipcRenderer } = require('electron');
//If username file exists then ignore this and continue with program
//#region create variables which will be filled in 
var GROUP_ID;
var USER_NAME;
var ALLOCATED_SIZE;
var GROUP;
var leader;
var firsttime;
var USER_ID;
var USERS = {
    "USERS": [],
    "USERNAMES": [],
    "PAIRS": [],
    "PAIRID": [],
    "LEADER": false
};
const firebaseConfig = {
    apiKey: "AIzaSyC4kz53hWrJs78IdyPcTbloN2izYXN8QvI",
    authDomain: "vaultv3-3474c.firebaseapp.com",
    projectId: "vaultv3-3474c",
    storageBucket: "vaultv3-3474c.appspot.com",
    messagingSenderId: "566355166597",
    appId: "1:566355166597:web:42d875bc97651e84cbb0ec"
};
//#endregion
window.onload = async() =>{
    //#region get user information
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
    ipcRenderer.send("GETUSERID")
    ipcRenderer.on('GETUSERID', (event, arg) => {
        USER_ID = arg;
        console.log(USER_ID);
    });
    //#endregion

}

const addFriend = document.getElementById("addFriend");

addFriend.onclick = function(){
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



