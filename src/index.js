const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require("./app/controllers/authController.js")(app);
require("./app/controllers/projectController.js")(app);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
