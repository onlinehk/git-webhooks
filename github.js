var mysql = require("mysql");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cmd = require("node-cmd");
var crypto = require("crypto");

var port = 8080;
var secret = "githubtest";
var mysql_host = "localhost";
var mysql_user = "git_user";
var mysql_password = "github";
var mysql_database = "git_db";

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

function verifyGitHub(req) {
  if (!req.headers["user-agent"].includes("GitHub-Hookshot")) {
    return false;
  }
  // console.log(req.headers['user-agent']);
  var hmac = crypto.createHmac("sha1", secret);
  var digest = "sha1=" + hmac.update(JSON.stringify(req.body)).digest("hex");
  var checksum = req.headers["x-hub-signature"];
  if (!checksum || !digest || checksum !== digest) {
    console.log(
      `Request body digest (${digest}) did not match ${"x-hub-signature"} (${checksum})`
    );
    return false;
  } else {
    // console.log(digest);
    return true;
  }
}

app.post("/githubpull", function (request, response) {
  response.send("Hello");
  if (verifyGitHub(request)) {
    var obj = request.body;
    if (obj.ref == "refs/heads/master") {
      // console.log(obj.repository.name);

      var connection = mysql.createConnection({
        host: mysql_host,
        user: mysql_user,
        password: mysql_password,
        database: mysql_database
      });

      connection.connect();

      connection.query(
        "SELECT * FROM github WHERE name='" + obj.repository.name + "'",
        function (error, rows) {
          // if (error) {
          // 	throw error;
          // }
          if (rows.length > 0) {
            cmd.get(
              "cd " +
                rows[0].path +
                " && /usr/bin/git reset --hard origin/master && /usr/bin/git clean -f && /usr/bin/git pull 2>&1",
              function (err, data, stderr) {
                console.log(data);
              }
            );
          } else {
            console.log("no db");
          }
        }
      );

      connection.end();
    }
  }
});

app.listen(port, function (err) {
  if (err) {
    return console.log("something bad happened", err);
  }

  console.log("github server is listening on " + port);
});
