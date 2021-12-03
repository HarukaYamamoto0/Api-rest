const express = require("express");
const app = express();

async function start() {
  try {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    await require("./database/index.js").start();
    await require("./app/controllers/index.js")(app);

    await app.listen(process.env.PORT || 3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (err) {
    console.error(err);
  }
}

start();
