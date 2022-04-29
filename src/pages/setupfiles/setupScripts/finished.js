const ipcRenderer = require('electron').ipcRenderer;
const finishButton = document.getElementById('finishButton');

finishButton.onclick = function(){
    ipcRenderer.send('finish');
}