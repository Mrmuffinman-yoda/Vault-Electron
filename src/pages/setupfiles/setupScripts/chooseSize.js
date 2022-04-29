const ipcRenderer = require('electron').ipcRenderer;

const chooseSize = document.getElementById('chooseSize');

chooseSize.onclick = function(){
    const size = document.getElementById('size').value;
    console.log(size);
    ipcRenderer.send('allocatedSide', size);
}
