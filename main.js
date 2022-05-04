const {app, BrowserWindow, Menu , ipcMain, ipcRenderer} = require('electron')
const fs = require('fs');
const path = require('path');
var cryptojs = require("crypto-js");
const crypto = require('crypto');
const ClientId = "970034993361473546";
const DiscordRPC = require("discord-rpc");
var fsUtils = require("nodejs-fs-utils");
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
    var GROUP_ID;
    var USER_NAME;
    var ALLOCATED_SIZE;
    var GROUP = false;
    var LEADER = false;
    var firstttime;
    var PAIRS;
    var USERS = {
      USERS: [],
      PAIRS: [],
      LEADER:"",
    };
    var USER_ID = "";
  }
}
ipcMain.on("finish", (event, arg) => {
  var userDataFile = USER_FOLDER + "/" + "USER" + ".json";
  console.log("Finished");
  // write username , groupID , allocated size and group to file
  if(LEADER ===true){
    console.log("Leader");
    var userData = {
      USER_NAME: USER_NAME,
      GROUP_ID: GROUP_ID,
      ALLOCATED_SIZE: ALLOCATED_SIZE,
      GROUP: GROUP,
      LEADER: LEADER,
      firsttime: true,
      USER_ID: USER_ID,
      USERS: {
        USERS: USERS.USERS,
        PAIRS: USERS.PAIRS,
        LEADER: USER_ID
      }
    }
  }
  else{
    console.log("Not Leader");
    var userData = {
      USER_NAME: USER_NAME,
      GROUP_ID: GROUP_ID,
      ALLOCATED_SIZE: ALLOCATED_SIZE,
      GROUP: GROUP,
      LEADER: LEADER,
      firsttime: true,
      USER_ID: USER_ID,
      USERS: {
        USERS: USERS.USERS,
        PAIRS: USERS.PAIRS,
        LEADER: LEADER_ID
      }
    }
  }

  
  //  if folder exists,dont make a new one
  if (fs.existsSync(USER_FOLDER)) {
    console.log("folder exists");
    console.log(USER_FOLDER)
  }
  else {
    var USER_DOWNLOAD = USER_FOLDER + "/" + "USERIDS" + "/" + USER_ID;
   
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
      var OwnFolder = app.getPath('userData') + "/" + "Files" + "/" + "USERIDS" + "/" + USER_ID;
      if(fs.existsSync(OwnFolder)){
        console.log("Own folder exists");
      }
      else{
        fs.mkdir(OwnFolder, { recursive: true }, (err) => {
          if (err) {
            console.log(err);
          }
          else {
            console.log('Directory created successfully');
          }
        });
      }
      var window = remote.BrowserWindow.getAllWindows()[0]
      window.close()
      secondaryWindow.loadFile('./src/pages/homepage.html')
    });
    
  }
});
//#region readUserdata
readUserfiles = function () {
  var Downloads = app.getPath("desktop") + "/Vault";
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
var Downloads = app.getPath("desktop") + "/Vault";
var USER_FOLDER = app.getPath('userData') + "/" + "users";
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

ipcMain.on("writeInfo", (event,arg,arg1,arg2) => {
  GROUP_ID = arg;
  USER_ID = arg1;
  ALLOCATED_SIZE = arg2;
  console.log("Group ID: " + GROUP_ID);
  console.log("User ID: " + USER_ID);
  console.log("Allocated Size: " + ALLOCATED_SIZE);
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


ipcMain.on("BACKUPWINDOW", (event, arg) => {
  var addWindow = new BrowserWindow({
    width: 700,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      autoHideMenuBar: true,
      webSecurity: false,
      icon: './src/logo.ico',
    }
  });
  addWindow.loadFile('./src/pages/backupSettings.html');
  addWindow.on('closed', function () {
    addWindow = null
  })
});

//#endregion
//make new window to add friends
//#region windows for each page on homepage
ipcMain.on("ADDFRIENDWINDOW", (event, arg) => {
  var addWindow = new BrowserWindow({
    width: 700,
    height: 700,
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
ipcMain.on("HELPWINDOW", (event, arg) => {
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
  addWindow.loadFile('./src/pages/help.html');
  addWindow.on('closed', function () {
    addWindow = null
  })
});
//#endregion
// send groupID to addFriend.html

//Recieving data
ipcMain.on("SETPAIRID", (event, arg,arg2,arg3) => {
  var Downloads = app.getPath("desktop") + "/Vault";
  if(!fs.existsSync(Downloads)){
    fs.mkdirSync(Downloads);
  }
  var files = app.getPath('userData') + "/" + "Files"
  if (!fs.existsSync(files)) {
    fs.mkdirSync(files);
  }
  var userIDSFolder = files + "/" + "USERIDS";
  if (!fs.existsSync(userIDSFolder)) {
    fs.mkdirSync(userIDSFolder);
  }
  var pairFolder = app.getPath('userData') + "/" + "Files" + "/" + "USERIDS" + "/"+ arg;
  //make folder for pairFolder
  if (!fs.existsSync(pairFolder)) {
    fs.mkdirSync(pairFolder);
  }
  console.log(USER_ID)
  LEADER_ID = arg3
  var pairArray = [USER_ID, arg, arg3];
  console.log("PAIRARRAY: "+pairArray);
  USERS.PAIRS.push(pairArray);
  USERS.USERS.push(arg2);
  console.log("PAIRS: " + USERS.PAIRS);
  console.log("USERS: " + USERS.USERS);
  var userDataFile = USER_FOLDER + "/" + "USER" + ".json";
  if (fs.existsSync(userDataFile)) {
    var userData = fs.readFileSync(userDataFile);
    var userData = JSON.parse(userData);
    //append newPair to Users.pair
    userData.USERS.PAIRS.push(pairArray);
    userData.USERS.USERS.push(arg2);
    //write to file
    fs.writeFileSync(userDataFile, JSON.stringify(userData));
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



//check if downloads folder has files in it and send location to homepage.js
ipcMain.on("CHECKDOWNLOADS", (event, arg) => {
  var Downloads = app.getPath("desktop") + "/Vault";
  if (fs.existsSync(Downloads)) {
    var files = fs.readdirSync(Downloads);
    event.sender.send("CHECKDOWNLOADS", files);
  }
  else {
    event.sender.send("CHECKDOWNLOADS", "No files");
  }
});

ipcMain.handle("GETFILES", async (event, arg) => {
  var Downloads = app.getPath("desktop") + "/Vault";
  if (fs.existsSync(Downloads)) {
    var files = fs.readdirSync(Downloads);
    return files;
  }
  else {
    return "No files";
  }
}
);
// encrypt files from downloads folder and save them in files of USER_ID
ipcMain.on("ENCRYPT", (event, arg) => {
  var Downloads = app.getPath("desktop") + "/Vault";
  if (fs.existsSync(Downloads)) {
    var files = fs.readdirSync(Downloads);
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var filePath = Downloads + "/" + file;
      var fileData = fs.readFileSync(filePath);
      var encryptedFile = encrypt(fileData, USER_ID);
      var encryptedFilePath = USER_FOLDER + "/" + "USERIDS" + "/" + USER_ID
      fs.writeFileSync(encryptedFilePath, encryptedFile);
      fs.unlinkSync(filePath);
    }
  }
  else {
    console.log("No files");
  }
}
);
// decrypt files from files of USER_ID and save them in a new folder in downloads
ipcMain.on("DECRYPT", (event, arg) => {
  var files = fs.readdirSync(USER_FOLDER + "/" + "USERIDS" + "/" + USER_ID);
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var filePath = USER_FOLDER + "/" + "USERIDS" + "/" + USER_ID + "/" + file;
    var fileData = fs.readFileSync(filePath);
    var decryptedFile = decrypt(fileData, USER_ID);
    var decryptedFilePath = app.getPath("desktop") + "/Vault" + "/" + file;
    fs.writeFileSync(decryptedFilePath, decryptedFile);
    fs.unlinkSync(filePath);
  }
}
);
    
// check if download folder is less than allocated_size
ipcMain.on("CHECKDOWNLOADSSIZE", (event, arg) => {
  var size;
  // check download folder size
  fsUtils.fsizeSync(Downloads, function (err, size) {
      size = size / 1000000000;
      console.log("Download folder size: " + size);
      if (size < ALLOCATED_SIZE) {
        console.log("RETURNING TRUE");
        return size
      }
      else {
        console.log("RETURNING FALSE");
        return size
      }
  });
  return size;
});

//check if downloads folder is less than allocated_size
ipcMain.handle("GETDOWNLOADS", async (event, arg) => {
  var Downloads = app.getPath("desktop") + "/Vault";
  return Downloads;
});








ipcMain.handle("GETCONFIG", (event, arg) => {
  return firebaseConfig;
});
ipcMain.handle("GETFIRSTTIME", (event, arg) => {
  return firsttime;
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
ipcMain.handle("GETUSERID", (event, arg) => {
  return USER_ID;
});
























//////////////////////////////////////////////////////////////

