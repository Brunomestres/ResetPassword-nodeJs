const mongoose = require('mongoose');

let DB_URL = process.env.DB_URL;

module.exports = async function connection()
{
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      autoIndex: true
    },(error) => {
      if(error) return new Error("Falha ao conectar ao banco de dados");
      console.log("Conenctado");
    }
  );

  } catch (error) {
    console.log(error);
  }
}