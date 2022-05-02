const ipcRenderer = require('electron').ipcRenderer;
const crypto = require('crypto');

const submitGroup = document.getElementById('submitGroup');
var USER_ID = crypto.randomBytes(10).toString('hex');
var userIDText = document.getElementById('userID');
userIDText.innerHTML = "UserID : " + USER_ID;
submitGroup.onclick = function(){
    var sizeLimit = document.getElementById('sizeLimit').value;
    var groupid = document.getElementById('groupid').value;
    console.log(groupid);
    ipcRenderer.send('groupID', groupid, USER_ID,sizeLimit);
}