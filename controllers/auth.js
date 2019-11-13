const User = require('../models').user
      fs = require("fs")

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findByPk({ email: email }).then(user => {
        if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const privateKey = fs.readFileSync('../config/private.key');
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            privateKey,
            {
                algorithm: 'RS256'
            },
            {
                expiresIn: '1h'
            }
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.logout = (req, res, next) => {

}