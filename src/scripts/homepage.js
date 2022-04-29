//javascript file for selecting usernames
const { app,ipcRenderer } = require('electron');
//If username file exists then ignore this and continue with program
window.onload = function(){
    //ask main process to read username
    ipcRenderer.send('GETUSERNAME');
    
    }

ipcRenderer.on('RECIEVE', (event, arg) => {
    username = arg;
    document.getElementById("userWelcome").innerHTML = "Welcome back " + username + "!";
    console.log(username);
});

