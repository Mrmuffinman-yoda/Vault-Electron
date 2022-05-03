const ipcRenderer = require('electron').ipcRenderer;
const crypto = require('crypto');

var pairText = document.getElementById('pairID');
var groupText = document.getElementById('groupID');
var button = document.getElementById('genPairID');
var nickname = document.getElementById('nickname');
var nickUserID = document.getElementById('nickUserID');
var idText = document.getElementById('idText');
window.onload = async() => {

}

button.onclick = async() => {
    var USER_ID = await ipcRenderer.invoke('GETUSERID');
    var GROUPID =await ipcRenderer.invoke('GETGROUPID');
    var pairAmount =await ipcRenderer.invoke('PAIRAMOUNT');
    var GROUP = await ipcRenderer.invoke("GETGROUP")
    idText.innerHTML = "UserID : " + USER_ID;
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
