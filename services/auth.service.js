const {User} = require("../models");
const bcrypt = require("bcrypt");
const BadRequestError = require('../errors/bad-request.error');
const {response} = require("../utils/response");
const httpStatus = require('../enum/http-status');

module.exports.login = async (userName, password) => {
    if (!userName) {
        throw new BadRequestError('Usuário inválido');
    }
    const user = await User.findOne({
        where: {
            username: userName
        }
    });
    if (!user) {
        throw new BadRequestError('Usuário não encontrado');
    }
    const hashedPassword = bcrypt.hashSync(password, user.salt);

    if (user.password !== hashedPassword) {
        throw new BadRequestError('Senha incorreta');
    }
    const data = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        administrator: user.administrator,
        token: user.token
    };
    return response(httpStatus.SUCCESS, data, 'Login realizado com sucesso!');
}
