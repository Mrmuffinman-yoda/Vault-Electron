const ipcRenderer = require('electron').ipcRenderer;
const crypto = require('crypto');

const pairText = document.getElementById('pairID');
const groupText = document.getElementById('groupID');
const button = document.getElementById('genPairID');
const nickname = document.getElementById('nickname');
const nickUserID = document.getElementById('nickUserID');
window.onload = async() => {

}

button.onclick = async() => {
    var GROUPID =await ipcRenderer.invoke('GETGROUPID');
    var pairAmount =await ipcRenderer.invoke('PAIRAMOUNT');
    var GROUP = await ipcRenderer.invoke("GETGROUP")
    groupText.innerHTML = "GroupID : " + GROUPID;
    if (pairAmount >= 1 && GROUP === false) {
        pairText.innerHTML = "[WARNING]: you cannot add more users to this";
    }
    else {
        var id = crypto.randomBytes(10).toString('hex');
        pairText.innerHTML = "PairID : " + id;
        button.classList.add("disabled");
        ipcRenderer.send('SETPAIRID', id , nickname.value,nickUserID.value);
    }
}
