//javascript file for selecting usernames
const { app,ipcRenderer } = require('electron');
var submitUsername = document.getElementById("submitUsername");// button to submit username
//If username file exists then ignore this and continue with program
window.onload = function(){
    //blank for now
    console.warn("onload")
}
submitUsername.onclick = function(){
    //get username input
    var username = document.getElementById("username").value;
    const NOTIFICATION_TITLE= "Username has been set";
    const NOTIFICATION_MESSAGE = "Username is set to " + username;
    //check if username is empty
    if(username == ""){
        alert("Username cannot be empty");
        return;
    }
    ipcRenderer.send('username', username);
    new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_MESSAGE, silent: false });
}   
