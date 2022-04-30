const {app, BrowserWindow, Menu , ipcMain, ipcRenderer} = require('electron')
const fs = require('fs');
const path = require('path');
var cryptojs = require("crypto-js");
const ClientId = "970034993361473546";
const DiscordRPC = require("discord-rpc");
const RPC = new DiscordRPC.Client({ transport: 'ipc' });
DiscordRPC.register(ClientId);

function setActivity() {
  if (!RPC) return;
  RPC.setActivity({
    details: "Vault",
    state: "Ready for backups",
    startTimestamp: new Date(),
    largeImageKey: "vaultlogo",
    largeImageText: "Vault",
    smallImageKey: "vaultsmall",
    smallImageText: "Vault",
    instance: false,
    buttons:[
        {
          label: "Github",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          // url: "https://github.com/Mrmuffinman-yoda/Vault-Electron"
        }
      ]
  });
}
RPC.on("ready", () => {
  console.log("ready");
  setActivity();
  setInterval(() => {
    setActivity();
  }, 60000);
});

RPC.login({ clientId: ClientId });
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
//firebase API key can be changed by editing the file if required
var firebaseConfig = {
  apiKey: "AIzaSyC4kz53hWrJs78IdyPcTbloN2izYXN8QvI",
  authDomain: "vaultv3-3474c.firebaseapp.com",
  projectId: "vaultv3-3474c",
  storageBucket: "vaultv3-3474c.appspot.com",
  messagingSenderId: "566355166597",
  appId: "1:566355166597:web:42d875bc97651e84cbb0ec"
};
// get location of the firebase config file
configLocation = app.getPath('userData') + "/" + "config.json";
// check if the firebase config file exists , if so read it and override the firebase config
if (fs.existsSync(configLocation)) {
  firebaseConfig = JSON.parse(fs.readFileSync(configLocation));
}
// if firebase config file does not exist then create it with the default config
// this is used incase my firebase is not working and the user wants to use their own firebase config
else {
  fs.writeFileSync(app.getPath('userData') + "/" + "users" + "/" + "config" + ".json", JSON.stringify(firebaseConfig));
}  

// create the main window for the application
function createWindow () {
  // Create the browser window.
  var mainWindow = new BrowserWindow({ 
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      autoHideMenuBar: true,
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
    var leader = false;
    var userList = [];

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

readUserfiles = function () {
  var userDataFile = USER_FOLDER + "/" + "USER" + ".json";
  console.log(userDataFile);
  console.log("User data file: " + userDataFile);
  if (fs.existsSync(userDataFile)) {
    console.log("User data file exists");
    var userData = fs.readFileSync(userDataFile);
    console.log("User data: " + userData);
    var userData = JSON.parse(userData);
    GROUP_ID = userData.groupID;
    USER_NAME = userData.username;
    ALLOCATED_SIZE = userData.allocatedSize;
    GROUP = userData.group;
    console.log("Group ID: " + GROUP_ID);
    console.log("Username: " + USER_NAME);
    console.log("Allocated Size: " + ALLOCATED_SIZE);
    console.log("Group: " + GROUP);
  }
  else {
    console.log("User data file does not exist");
  }
}

//Users constants
var USER_FOLDER = app.getPath('userData') + "/" + "users";
var USER_DOWNLOAD = USER_FOLDER + "/" + "download";
console.log(USER_FOLDER);
var GROUP_ID = "052afCQj00rDQQj0MJ9b";
var USER_NAME = "";
var ALLOCATED_SIZE = "";
var GROUP = false;
var LEADER = false;
var USERS = {
  "USERS": [],
  "CONNECTIONS": [],
  "LEADER": []
};

readUserfiles();


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
ipcMain.on("GETCONFIG", (event, arg) => {
  event.sender.send("CONFIG", firebaseConfig);
});

ipcMain.on("GETGROUPID", (event, arg) => {
  event.sender.send("GROUPID", GROUP_ID);
});
ipcMain.on("GETCONNECTIONID", (event, arg) => {
  event.sender.send("CONNECTIONID", "cfe2r2fasdf4");
});
ipcMain.on("code", (event, arg) => {
  GROUP_ID = arg;
  LEADER = true;
  console.log("leader: " + LEADER);
  console.log("Group ID: " + GROUP_ID);
});

// finish of setup
ipcMain.on("finish", (event, arg) => {
  console.log("Finished");
  // write username , groupID , allocated size and group to file
  var userData = {
    "username": USER_NAME,
    "groupID": GROUP_ID,
    "allocatedSize": ALLOCATED_SIZE,
    "group": GROUP,
    "leader" : LEADER,
    "users" : {
      "users": [],
      "connections": [],
      "leader": []
    }
  }
  //  if folder exists,dont make a new one
  if (fs.existsSync(USER_FOLDER)){
    console.log("folder exists");
    console.log(USER_FOLDER)
  } 
  else{
    fs.mkdir(USER_FOLDER, { recursive: true }, (err) => {      
    if (err) {
      console.log(err);} 
    else {
      console.log('Directory created successfully');
      console.log(USER_DOWNLOAD)
      fs.mkdir(USER_DOWNLOAD, { recursive: true }, (err) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log('Directory created successfully');
        }
      });
    }
  });
  var userDataFile = USER_FOLDER + "/" + "USER" + ".json";
  fs.writeFileSync(userDataFile, JSON.stringify(userData));
  mainWindow.loadFile('./src/pages/homepage.html')
  }
});
// Send user name
ipcMain.on('GETUSERNAME', (event, arg) => {
  //send variable USER_NAME
  console.log("Sending username"+ USER_NAME);
  event.sender.send('RECIEVE', USER_NAME);
});

// Writing username to file
// Menu.setApplicationMenu(menu);
// ipcMain.on('username', (event, arg) => { 
//  
//   console.log(arg);
//   console.log(app.getPath('userData'));
//  
// }});
// read username from file and save it to global variable
// ipcMain.on('readUsername', (event, arg) => {
//   var userFolder = app.getPath('userData') + "/" + "users";
//   var username = fs.readFileSync(app.getPath('userData') + "/" + "users" +"/" + "username.txt", 'utf8');
//   console.log(username);
//   event.sender.send('username', username);
// });


















































//////////////////////////////////////////////////////////////

