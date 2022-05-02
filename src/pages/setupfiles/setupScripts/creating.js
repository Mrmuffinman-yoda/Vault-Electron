const crypto = require('crypto');
const ipcRenderer = require('electron').ipcRenderer;
var id = crypto.randomBytes(10).toString('hex');
var userID = crypto.randomBytes(10).toString('hex');
console.log(id);
document.getElementById("codeOutput").innerHTML = id;
ipcRenderer.send('code', id, userID);