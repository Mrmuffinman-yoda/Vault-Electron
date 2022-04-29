const ipcRenderer = require('electron').ipcRenderer;


const submitGroup = document.getElementById('submitGroup');

submitGroup.onclick = function(){
    var groupid = document.getElementById('groupid').value;
    console.log(groupid);
    ipcRenderer.send('groupID', groupid);
}