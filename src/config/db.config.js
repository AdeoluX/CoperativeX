// var mongoose = require('mongoose');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
const mongo = mongoose
  .connect(
    `mongodb+srv://juwontayo:${process.env.MONGO_PASSWORD}@cluster0.nmvkxa9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((con) => console.log('DB connected Dont lose focus!'))
  .catch((e) => console.log(e));

module.exports = mongo;