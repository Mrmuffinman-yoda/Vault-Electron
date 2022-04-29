const ipcRenderer = require('electron').ipcRenderer;
const pairButton = document.getElementById('duoSelect');
const groupButton = document.getElementById('groupSelect');

pairButton.onclick = function(){
    ipcRenderer.send('pair', false);
}
groupButton.onclick = function(){
    ipcRenderer.send('group', true);
}
