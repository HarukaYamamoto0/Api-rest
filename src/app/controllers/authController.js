const fs = require("fs"),
  path = require("path"),
  bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken"),
  crypto = require("crypto"),
  mailer = require("../../modules/mailer"),
  secret = process.env.secret,
  { Router } = require("express");

const User = require("../models/User");
const router = Router();

function generateToken(params) {
  return jwt.sign(params, secret, {
    expiresIn: 86400
  });
}


router.post("/register", async (req, res) => {
  const { email } = req.body;
  
  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    const user = await User.create(req.body);
    user.password = undefined;

    return res.send({
      user,
      token: generateToken({ id: user._id })
    });
  } catch (err) {
    return res.status(400).send({ error: "Registration failed" });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password)
    return res.status(400).send({ error: "Parameters were not passed correctly" });
  
  const user = await User.findOne({ email }).select("+password");

  if (!user) return res.status(400).send({ error: "User not found" });

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ error: "Invalid password" });

  user.password = undefined;

  res.send({
    user,
    token: generateToken({ id: user._id })
  });
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send({ error: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    });
    
    
    const buffer = fs.readFileSync(
      path.resolve("./src/resources/mail/auth/forgot_password.html"),
      "utf8"
    );
    
    function htmlFormatter(buffer, obj) {
      for (let prop in obj) {
        buffer = buffer.replace(`[[${prop}]]`, obj[prop]);
      }
      return buffer;
    }

    mailer.sendMail({
      to: email,
      from: "haruka69@gmail.com", // fictitious email
      html: htmlFormatter(buffer, { token })
    })
      .then(result => res.send({ ok: "The email has been sent" }))
      .catch(err => res.status(400).send({ error: "Failed to send email, try again" }));
  } catch (err) {
    res.status(400).send({ error: "Error on forgot password, try again" });
  }
});

router.post("/reset_password", async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );

    if (!user) return res.status(400).send({ error: "User not found" });

    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: "Token invalid" });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res
        .status(400)
        .send({ error: "Token Expired, generate a new one" });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await res.send({ user });
  } catch (err) {
    res.status(400).send({ error: "Could not reset password, try again" });
  }
});


module.exports = app => app.use("/auth", router);
