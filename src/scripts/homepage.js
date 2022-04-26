//javascript file for selecting usernames
const { app,ipcRenderer } = require('electron');
//If username file exists then ignore this and continue with program
window.onload = function(){
    //ask main process to read username
    ipcRenderer.send('sendUsername');
    // console.log(username);
    }

ipcRenderer.on('readUsername', (event, arg) => {
    username = arg;
    console.log(username);
});

