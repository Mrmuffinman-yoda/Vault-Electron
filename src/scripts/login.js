//javascript file for selecting usernames
//If username file exists then ignore this and continue with program
window.onload = function(){
    const username = document.getElementsByClassName("username").value;
    const submitUsername = document.getElementById("submitUsername");
    var SimpleFileWriter = require('simple-file-writer');

    submitUsername.onclick = function(){
        console.log("Warning : Yet to complete")
        console.log(username)
    }
}