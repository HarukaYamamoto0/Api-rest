const path = require("path");
const { createTransport } = require("nodemailer");
const { host, port, user, pass } = process.env;

const transport = createTransport({
  host,
  port,
  auth: { user, pass }
});

module.exports = transport;
