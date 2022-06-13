var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cmd = require("node-cmd");
var port = 8080;

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

app.post("/", function (request, response) {
  response.send("Hello");
  if (request.body.push.changes[0].new.name == "master") {
    console.log(request.body.push.changes[0].new.name);
    console.log(request.body.repository.name);
    cmd.get(
      "cd /home/git/public_html && /usr/bin/git reset --hard origin/master && /usr/bin/git clean -f && /usr/bin/git pull 2>&1",
      function (err, data, stderr) {
        console.log("the current working dir is : ", data);
      }
    );
  }
});

app.listen(port, function (err) {
  if (err) {
    return console.log("something bad happened", err);
  }

  console.log("bitbucket 2 server is listening on " + port);
});
