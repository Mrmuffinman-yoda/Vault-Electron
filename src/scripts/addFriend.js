const ipcRenderer = require('electron').ipcRenderer;
const crypto = require('crypto');

const pairText = document.getElementById('pairID');
const groupText = document.getElementById('groupID');
const button = document.getElementById('genPairID');

window.onload = async() => {
    ipcRenderer.send('GETGROUPID');
}
ipcRenderer.on('GROUPID', (event, arg) => {
    groupText.innerHTML = "GroupID : " + arg;
    console.log(arg);
});

button.onclick = function () {
    var id = crypto.randomBytes(10).toString('hex');
    pairText.innerHTML = "PairID : "+ id;
    button.classList.add("disabled");
    ipcRenderer.send('SETPAIRID', id);
}
