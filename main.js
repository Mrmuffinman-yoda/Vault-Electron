const {app, BrowserWindow, Menu , ipcMain, ipcRenderer, remote} = require('electron')
const fs = require('fs');
const path = require('path');
var cryptojs = require("crypto-js");
const crypto = require('crypto');
const ClientId = "970034993361473546";
const DiscordRPC = require("discord-rpc");
const RPC = new DiscordRPC.Client({ transport: 'ipc' });
DiscordRPC.register(ClientId);

//#region DiscordRPC
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
          "label": 'Github',
          "url": 'https://github.com/Mrmuffinman-yoda/Vault-Electron'
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

//#endregion


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
//#region firebase
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
//#endregion
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
      icon: "./src/vaultLogo.ico",
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  var userFolder = app.getPath('userData') + "/" + "users";
  //when render process sends a message to main process return the user data location
  ipcMain.on('userDataLocation', (event, arg) => {
    userFolder = arg;
    ipcMain.emit('userDataLocation', userFolder);
  });

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
    var userData;
    var USER_FOLDER = app.getPath('userData') + "/" + "users";
    var GROUP_ID = "";
    var USER_NAME = "";
    var ALLOCATED_SIZE = "";
    var GROUP = false;
    var leader = false;
    var USERS = {};
    var USER_ID = "";
  }
}
ipcMain.on("finish", (event, arg) => {
  var userDataFile = USER_FOLDER + "/" + "USER" + ".json";
  console.log("Finished");
  // write username , groupID , allocated size and group to file
  if(LEADER ===true){
    var userData = {
      USER_NAME: USER_NAME,
      GROUP_ID: GROUP_ID,
      ALLOCATED_SIZE: ALLOCATED_SIZE,
      GROUP: GROUP,
      LEADER: LEADER,
      firsttime: true,
      USER_ID: USER_ID,
      USERS: {
        USERS:[],
        PAIRS: [],
        LEADER: USER_ID
      }
    }
  }
  else{
    var userData = {
      USER_NAME: USER_NAME,
      GROUP_ID: GROUP_ID,
      ALLOCATED_SIZE: ALLOCATED_SIZE,
      GROUP: GROUP,
      LEADER: LEADER,
      firsttime: true,
      USER_ID: USER_ID,
      USERS: {
        USERS: [],
        PAIRS: [],
        LEADER: ""
      }
  }
}
  
  //  if folder exists,dont make a new one
  if (fs.existsSync(USER_FOLDER)) {
    console.log("folder exists");
    console.log(USER_FOLDER)
  }
  else {
    fs.mkdir(USER_FOLDER, { recursive: true }, (err) => {
      if (err) {
        console.log(err);
      }
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
      fs.writeFileSync(userDataFile, JSON.stringify(userData));
      var secondaryWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
          autoHideMenuBar: true,
          webSecurity: false,
          icon: "./src/vaultLogo.ico",
          preload: path.join(__dirname, 'preload.js'),
        }
      })
      window.close();
      secondaryWindow.loadFile('./src/pages/homepage.html')
    });
  }
});
//#region readUserdata
readUserfiles = function () {
  var userDataFile = USER_FOLDER + "/" + "USER" + ".json";
  console.log(userDataFile);
  console.log("User data file: " + userDataFile);
  if (fs.existsSync(userDataFile)) {
    userData = fs.readFileSync(userDataFile);
    console.log("User data: " + userData);
    userData = JSON.parse(userData);
    GROUP_ID = userData.GROUP_ID;
    USER_NAME = userData.USER_NAME;
    ALLOCATED_SIZE = userData.ALLOCATED_SIZE;
    GROUP = userData.GROUP;
    LEADER = userData.LEADER;
    USERS = userData.USERS;
    USER_ID = userData.USER_ID;
    FIRSTTIME = userData.firsttime;
    PAIRS = userData.USERS.PAIRS;
    console.log("USERS: " + USERS);
    console.log("PAIRS[0]: " + USERS.PAIRS);
    console.log("User data: " + userData);
    console.log("userID: " + USER_ID);
    console.log("Group ID: " + GROUP_ID);
    console.log("Username: " + USER_NAME);
    console.log("Allocated Size: " + ALLOCATED_SIZE);
    console.log("Group: " + GROUP);
  }
  else {
    console.log("User data file does not exist");
  }
}
//#endregion
//Users constants which will get filled when file is read

//#region empty variables
var USER_FOLDER = app.getPath('userData') + "/" + "users";
var USER_DOWNLOAD = USER_FOLDER + "/" + "download";
console.log(USER_FOLDER);
var GROUP_ID;
var USER_NAME;
var ALLOCATED_SIZE;
var GROUP;
var LEADER;
var firsttime;
var USERS = {
  USERS: [],
  USERNAMES: [],
  PAIRS:[],
  PAIRID: [],
  LEADER: false
};
var USER_ID = "";

//#endregion

// read users files
readUserfiles();

//#region send Usersdata
ipcMain.on("username", (event, arg) => {
  USER_NAME = arg;
  console.log("Username: " + USER_NAME);
});

ipcMain.on("writeInfo", (event, arg,arg2,arg3,arg4,arg5,arg6) => {
  GROUP_ID = arg;
  USER_ID = arg2;
  USERS.USERS.push(arg4);
  ALLOCATED_SIZE = arg3;
  PAIRID = arg5
  var tempArray = [arg2,arg5,arg6]
  USERS.PAIRS.push(tempArray)  
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

ipcMain.on("code", (event, arg,arg2) => {
  GROUP_ID = arg;
  USER_ID = arg2;
  LEADER = true;
  console.log("leader: " + LEADER);
  console.log("Group ID: " + GROUP_ID);
  console.log("User ID: " + USER_ID);
});
// Send user name
ipcMain.on('GETUSERNAME', (event, arg) => {
  //send variable USER_NAME
  console.log("Sending username: " + USER_NAME);
  event.sender.send('RECIEVE', USER_NAME);
});
ipcMain.on("GETGROUPID", (event, arg) => {
  event.sender.send("GROUPID", GROUP_ID);
});
ipcMain.on("GETUSERID", (event, arg) => {
  event.sender.send("USERID", USER_ID);
});
ipcMain.on("GETPAIRID", (event, arg) => {
  event.sender.send("PAIRID", PAIR_ID);
});
ipcMain.on("GETUSERS", (event, arg) => {
  event.sender.send("USERS", USERS);
});

ipcMain.on("SENDPAIRS", (event, arg) => {
  console.log("Sending Pairs: " + USERS.PAIRS);
  event.sender.send("PAIRS", USERS.PAIRS);
});

ipcMain.on("GROUP", (event, arg) => {
  event.sender.send("GROUPT", GROUP);
});




//#endregion
//make new window to add friends
//#region windows for each page on homepage
ipcMain.on("ADDFRIENDWINDOW", (event, arg) => {
  var addWindow = new BrowserWindow({
    width: 500,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      autoHideMenuBar: true,
      webSecurity: false,
      icon:'./src/logo.ico',
    }
  });
  addWindow.loadFile('./src/pages/addFriend.html');
  addWindow.on('closed', function () {
    addWindow = null
  })
});
ipcMain.on("SENDERWINDOW", (event, arg) => {
  var addWindow = new BrowserWindow({
    width: 500,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      autoHideMenuBar: true,
      webSecurity: false,
      icon: './src/logo.ico',
    }
  });
  addWindow.loadFile('./src/pages/sender.html');
  addWindow.on('closed', function () {
    addWindow = null
  })
});
ipcMain.on("RECIEVERWINDOW", (event, arg) => {
  var addWindow = new BrowserWindow({
    width: 500,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      autoHideMenuBar: true,
      webSecurity: false,
      icon: './src/logo.ico',
    }
  });
  addWindow.loadFile('./src/pages/reciever.html');
  addWindow.on('closed', function () {
    addWindow = null
  })
});
//#endregion
// send groupID to addFriend.html

//Recieving data
ipcMain.on("SETPAIRID", (event, arg,arg2,arg3) => {
  console.log(USER_ID)
  var pairArray = [USER_ID, arg, arg3];
  USERS.PAIRS.push(pairArray);
  USERS.USERS.push(arg2);
  console.log("PAIRS: " + USERS.PAIRS);
  var userDataFile = USER_FOLDER + "/" + "USER" + ".json";
  if (fs.existsSync(userDataFile)) {
    var userData = fs.readFileSync(userDataFile);
    var userData = JSON.parse(userData);
    //append newPair to Users.pair
    userData.USERS.PAIRS.push(pairArray);
    userData.USERS.USERS.push(arg2);
    //write to file
    fs.writeFileSync(userDataFile, JSON.stringify(userData));
    mainWindow.reload();
  }
  else {
    console.log("User data file does not exist");
  }
});
ipcMain.on("SETUSERS", (event, arg) => {
  // Push here as an array
  // put pairArray in USERS.PAIRS
  USERS.USERS.push(arg);
  var userDataFile = USER_FOLDER + "/" + "USER" + ".json";
  if (fs.existsSync(userDataFile)) {
    var userData = fs.readFileSync(userDataFile);
    var userData = JSON.parse(userData);
    //append newPair to Users.pair
    userData.USERS.USERS.push(pairArray);
    //write to file
    fs.writeFileSync(userDataFile, JSON.stringify(userData));
  }
  else {
    console.log("User data file does not exist");
  }
});

//#region end of setup






ipcMain.handle("GETCONFIG", (event, arg) => {
  return firebaseConfig;
});
ipcMain.handle("GETFIRSTTIME", (event, arg) => {
  return FIRSTTIME;
});

ipcMain.handle("GETGROUP", (event, arg) => {
  console.log(GROUP)
  return GROUP;
  });
ipcMain.handle("GETGROUPID", (event, arg) => {
  return GROUP_ID;
});
ipcMain.handle("PAIRAMOUNT", (event, arg) => {
  return PAIRS.length;
});
ipcMain.handle("GETNickName", (event, arg) => {
  console.log("USERS: "+USERS.USERS);
  return USERS.USERS;
});
ipcMain.handle("GETPAIRS", (event, arg) => {
  return USERS.PAIRS;
});
ipcMain.handle("GETUSERNAME", (event, arg) => {
  return USER_NAME;
  });
ipcMain.handle("GETNICKNAME", (event, arg) => {
  return USERS.USERS;
});


























//////////////////////////////////////////////////////////////

