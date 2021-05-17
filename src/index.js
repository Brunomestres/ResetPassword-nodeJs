require('express-async-errors');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const connection = require('./Config/db');
const db = require('./Config/db');

const port = 8080;

(async function db(){
  await connection();
})();

app.use(cors());
app.use(express.json());
app.use("/api/v1", require('./Routes/index.route'));
app.use((error,req,res,next)=> {
  res.status(500).json({ error: error.message });
});

app.listen(port, () => {
  console.log('Escutando na porta ', port );
});


module.exports = app;