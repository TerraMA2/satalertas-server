const {User} = require("../models");
const bcrypt = require("bcrypt");
const BadRequestError = require('../errors/bad-request.error');

module.exports.login = async (userName, password) => {
  if (!userName) {
    throw new BadRequestError('Invalid user');
  }
  const user = await User.findOne({
    where: {
      username: userName
    }
  });
  if (!user) {
    throw new BadRequestError('User not found');
  }
  const hashedPassword = bcrypt.hashSync(password, user.salt);

  if (user.password !== hashedPassword) {
    throw new BadRequestError('Wrong password');
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    administrator: user.administrator,
    token: user.token
  };
}
