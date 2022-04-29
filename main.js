const {app, BrowserWindow, Menu , ipcMain, ipcRenderer} = require('electron')
const fs = require('fs');
const path = require('path');
function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({ 
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      icon:'./src/logo.ico',
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  var userFolder = app.getPath('userData') + "/" + "users";
  //when render process sends a message to main process return the user data location
  ipcMain.on('userDataLocation', (event, arg) => {
    userFolder = arg;
    ipcMain.emit('userDataLocation', userFolder);
  });

  //Open dev tools on load
  //mainWindow.webContents.openDevTools()

  // and load the index.html of the app.
  // if folder exists then load homepage.html

  if(fs.existsSync(userFolder)) {
    mainWindow.loadFile('./src/pages/homepage.html')
    console.log("User folder exists")
    console.log("Opening homepage")
    
    // transmit username to homepage
  }
  else{
    mainWindow.loadFile('index.html')
    console.log("User folder does not exist")
    var USER_FOLDER = app.getPath('userData') + "/" + "users";
    var GROUP_ID = "";
    var USER_NAME = "";
    var ALLOCATED_SIDE = "";
    var GROUP = false;
  }
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
// var menu = Menu.buildFromTemplate([
//   {
//     label: 'File',
//     submenu: [
//       {
//         label: 'Change Window Size',
//         click: function() {
//           console.log("suprise");
//         }
//       }]
//   }
// ]);


//Users constants
var USER_FOLDER = app.getPath('userData') + "/" + "users";
var GROUP_ID = "052afCQj00rDQQj0MJ9b";
var USER_NAME = "";
var ALLOCATED_SIZE = "";
var GROUP = false;

ipcMain.on("username", (event, arg) => {
  USER_NAME = arg;
  console.log("Username: " + USER_NAME);
});

ipcMain.on("groupID", (event, arg) => {
  GROUP_ID = arg;
  console.log("Group ID: " + GROUP_ID);
});

ipcMain.on("allocatedSide", (event, arg) => {
  ALLOCATED_SIZE = arg;
  console.log("Allocated Size: " + ALLOCATED_SIZE);
});

ipcMain.on("group", (event, arg) => {
  GROUP = arg;
  console.log("Group: " + GROUP);
});


// Send user name
ipcMain.on('sendUsername', (event, arg) => {
  //read username and save to username variable
  var username = fs.readFileSync(app.getPath('userData') + "/" + "users" +"/" + "username.txt", 'utf8');
  console.log("Sending username to main process")
  event.sender.send('readUsername', username);
});

// Writing username to file
// Menu.setApplicationMenu(menu);
// ipcMain.on('username', (event, arg) => { 
//   var userFolder = app.getPath('userData') + "/" + "users";
//   console.log(arg);
//   console.log(app.getPath('userData'));
//   //if folder exists,dont make a new one
//   if(fs.existsSync(userFolder)){
//     console.log("folder exists");
//   } 
//   else{
//     fs.mkdir(app.getPath('userData') + "/" + "users", { recursive: true }, (err) => {      
//     if (err) {
//       console.log(err);} 
//     else {
//       console.log('Directory created successfully');
//     }
//     //write username into file
//     fs.writeFile(app.getPath('userData') + "/" + "users" +"/" + "/" + "username.txt", arg, function(err) {
//     if(err) {
//       return console.log(err);
//     }
//     console.log("The file was saved!");
//     });
//   });
// }});
// read username from file and save it to global variable
ipcMain.on('readUsername', (event, arg) => {
  var userFolder = app.getPath('userData') + "/" + "users";
  var username = fs.readFileSync(app.getPath('userData') + "/" + "users" +"/" + "username.txt", 'utf8');
  console.log(username);
  event.sender.send('username', username);
});


















































//////////////////////////////////////////////////////////////
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
