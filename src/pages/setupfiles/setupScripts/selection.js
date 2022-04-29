const { app, ipcRenderer } = require('electron');
const pairButton = document.getElementById('duoSelect');
const groupButton = document.getElementById('groupSelect');

pairButton.onclick = function(){
    console.log("false")
    ipcRenderer.send('group', false);
}
groupButton.onclick = function(){
    console.log("true")
    ipcRenderer.send('group', true);
}
