//name constant variables
const inquirer = require("inquirer");
const axios = require("axios");
const util = require("util");
const fs = require("fs");
const conversion = require("phantom-html-to-pdf")();
const writeFileAsync = util.promisify(fs.writeFile);

//promts user to answer questions in the terminal
function promptUser() {
  return inquirer.prompt([
    {
      type: "input",
      message: "What is your GitHub username?",
      name: "github"
    },
  ]);
}
//Generate HTML
function generateHTML(inputs) {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
  <title>Document</title>
  <script src="https://unpkg.com/jspdf@latest/dist/jspdf.min.js"></script>
</head>
<body>
  <div class="jumbotron jumbotron-fluid">
  <div class="container">
    <h1 class="display-4">Hi! My name is ${inputs.gitname}!</h1>
    <h2 class="lead"><img src=${inputs.pic}></h2>
    <h2 class="lead">Here is my bio: ${inputs.bio}
    <h2 class="lead">I have ${inputs.followers} followers.</h2>
    <h2 class="lead">I am following ${inputs.following} people.</h2>
    <h2 class="lead">I have ${inputs.repos} repositories.</h2>
  </div>
</div>
</body>
</html>`;
}
promptUser()
//makes API request from GitHub
  .then(function (inputs) {
    const queryUrl = `https://api.github.com/users/${inputs.github}`;
    return axios
      .get(queryUrl)
  })
//logs all returned requests to the above HTML code
  .then(function (response) {
    const html = generateHTML({
      gitname: response.data.name,
      pic: response.data.avatar_url,
      following: response.data.following,
      followers: response.data.followers,
      bio: response.data.bio,      
      repos: response.data.public_repos,
    });
//Converts HTML to PDF and saves the file to the current folder
    conversion({ html: html }, function (err, pdf) {
      var output = fs.createWriteStream(__dirname + '/output.pdf')
      console.log(pdf.logs);
      console.log(pdf.numberOfPages);
      // since pdf.stream is a node.js stream you can use it
      // to save the pdf to a file (like in this example) or to
      // respond an http request.
      pdf.stream.pipe(output);
      return;
    });
    return writeFileAsync("index.html", html);
  })
  .then(function () {
    console.log("Successfully wrote to index.html");
  })
  .catch(function (err) {
    console.log(err);
  });