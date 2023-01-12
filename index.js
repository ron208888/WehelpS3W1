const express = require("express");
const app = express();
const multer = require("multer");
const AWS = require("aws-sdk");
const mysql = require("mysql");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

require("dotenv").config();
app.use(express.static("public"));

const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
});

const connection = mysql.createConnection({
  host: process.env.host,
  user: "ron208888",
  password: process.env.password,
  database: "WehelpS3W1",
});

app.get("/", function (req, res) {
  res.render("index.ejs");
});

app.post("/upload", upload.single("upload"), (req, res) => {
  const text = req.body.text;
  const file = req.file;
  const fileName = decodeURIComponent(file.originalname);

  const params = {
    Bucket: "ron208888/images",
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
    const bucketName = process.env.bucketName;
    const cloudfrontDomain = process.env.cloudfrontDomain;

    const imgUrl = decodeURIComponent(data.Location).replace(
      `https://${bucketName}.s3.amazonaws.com/`,
      `${cloudfrontDomain}`
    );

    insertInToTable(imgUrl);

    res.send({ ok: true });
  });

  function insertInToTable(imgUrl) {
    try {
      const insertInTo = "INSERT INTO uploadtext(text,img) VALUES(?,?)";
      connection.query(insertInTo, [text, imgUrl]);
      console.log("Inserted into table!");
    } catch (error) {
      console.log("Error: " + error);
    }
  }
});

app.get("/showPost", (req, res) => {
  const selectFrom = "SELECT * FROM uploadtext";

  connection.query(selectFrom, (err, result) => {
    if (err) throw err;

    res.send(result);
  });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
