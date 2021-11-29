const mongoose = require("mongoose");

mongoose.connect(process.env.tokenData, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

module.exports = mongoose;
