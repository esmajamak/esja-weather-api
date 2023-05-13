const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");

function loadUserCredentials() {
  const fileContent = fs.readFileSync(
    path.resolve(__dirname, "credentials.txt"),
    {
      encoding: "utf8",
    }
  );
  console.log("here");
  const credentials = fileContent.split("\n").map((line) => line.trim());
  return credentials.reduce((acc, credential) => {
    const [username, password] = credential.split(":");
    acc[username] = password;
    return acc;
  }, {});
}

async function authenticateUser(base64) {
  const decoded64String = Buffer.from(base64.split(" ")[1], "base64").toString(
    "utf-8"
  );

  const [username, password] = decoded64String.split(":");

  if (!username || !password) {
    return false;
  }
  const credentials = loadUserCredentials();

  const hashedPassword = credentials[username];
  if (!hashedPassword) {
    return false;
  }

  return await bcrypt.compare(password, hashedPassword);
}

module.exports = { authenticateUser };
