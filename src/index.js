const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require("./controllers/authController.js")(app);
require("./controllers/projectController.js")(app);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
