const ipcRenderer = require('electron').ipcRenderer;
const crypto = require('crypto');

const submitGroup = document.getElementById('submitGroup');
var USER_ID = crypto.randomBytes(10).toString('hex');
var userIDText = document.getElementById('userID');
userIDText.innerHTML = "UserID : " + USER_ID;
submitGroup.onclick = function(){
    var sizeLimit = document.getElementById('sizeLimit').value;
    var groupid = document.getElementById('groupid').value;
    var nickname = document.getElementById('Nickname').value;
    var pairID = document.getElementById('pairID').value;
    var externalID = document.getElementById('externalID').value;
    console.log("GROUPID: " + groupid);
    console.log("SIZE LIMIT: " + sizeLimit);
    console.log("NICKNAME: " + nickname);
    console.log("PAIRID: " + pairID);
    console.log("USERID: " + externalID);
    console.log("SETTING PAIR: " + pairID + " " + nickname + " " + externalID);
    ipcRenderer.send('writeInfo', groupid, USER_ID, sizeLimit);
    ipcRenderer.send('SETPAIRID', pairID, nickname, externalID);
    console.log("SETTING GROUP: " + groupid + " " + sizeLimit);
    
}