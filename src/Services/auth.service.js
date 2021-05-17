const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../Models/user.model');
const Token = require('../Models/token.model');
const sendEmail = require('../Utils/Emails/sendEmail');


const JWTSecret = process.env.JWT_SECRET;
const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;

const signup = async (data) => {
  let user = await User.findOne({ email: data.email});
  if(user)
  {
    throw new Error("Email já existe!");
  }

  user = new User(data);
  const token = JWT.sign({ id: user._id}, JWTSecret);
  await user.save();

  return (data = {
    userId: user._id,
    email: user.email,
    name: user.name,
    token: token,
  });

}

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });

  if(!user) throw new Error("Usuário não existe!");
  let token = await Token.findOne({ userId: user._id });

  if(token) await token.deleteOne();
  let resetToken = crypto.randomBytes(32).toString('hex');
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();


  const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
  sendEmail(user.email, "Redefinição de senha", { name: user.name, link: link},"./template/requestResetPassword.handlebars");
  return link;
}

const resetPassword = async (userId, token, password) => {
  let passwordResetToken = await Token.findOne({ userId });
  if(!passwordResetToken)
  {
    throw new Error("Token de redefinição de senha inválido ou expirado");
  }

  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if(!isValid)
  {
    throw new Error("Token de redefinição de senha inválido ou expirado");
  }

  const hash = await bcrypt.hash(password, Number(bcryptSalt));
  await User.updateOne(
    { _id: userId },
    { $set: { password: hash }},
    { new: true }
  );
  const user = await User.findById({ _id: userId });

  sendEmail(
    user.email,
    "Senha Recuperada com sucesso",
    {
      name: user.name,
    },
    "./template/resetPassword.handlebars"
  );

  await passwordResetToken.deleteOne();
  return true;
}

module.exports = {
  signup,
  requestPasswordReset,
  resetPassword
}
