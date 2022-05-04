const ipcRenderer = require('electron').ipcRenderer;
const finishButton = document.getElementById('finishButton');


finishButton.onclick = function(){
    //close current window
    ipcRenderer.send('finish');
    //close the current window
}