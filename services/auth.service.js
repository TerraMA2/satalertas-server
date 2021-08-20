const logger = require('../utils/logger');
const Result = require("../utils/result");
const {User} = require("../models");
const bcrypt = require("bcrypt");

module.exports = AuthService = {
    async login(req, res) {
        try {
            const params = req.body.params;
            const userName = params.username;
            const password = params.password;
            return await User.findOne({
                where: {
                    username: userName
                }
            }).then((user) => {
                if (!user) {
                    return Result.err()
                }
                const hashedPassword = bcrypt.hashSync(password, user.salt);

                if (user.password === hashedPassword) {
                    return Result.ok(
                        {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            username: user.username,
                            administrator: user.administrator,
                            token: user.token
                        }
                    )
                }
                return Result.err();
            });
        } catch (e) {
            const msgErr = `In unit auth.service, method login:${ e }`;
            logger.error(msgErr);
            throw new Error(msgErr);
        }
    }
};
