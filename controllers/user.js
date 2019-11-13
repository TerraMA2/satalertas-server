const bcrypt = require('bcrypt')
      models = require('../models')
      User = models.user

exports.get = (req, res, next) => {
    const userId = req.params.id
    if(userId){
        User.findByPk(userId).then(user => {
            res.json(user)
        })
    }else{
        User.findAll().then(users => {
            res.json(users)
        })
    }
}

exports.addUpdate = (req, res, next) => {
    let userId = req.params.id
    const params = {
        name: "Marcelo",
        password: bcrypt.hash("090709", 10),
        email: "marcelo.silva979@gmail.com"
    }
    if(userId){
        User.update(params, {where: {id: userId}}).then(()=>{
            console.log("updated")
        })
    }else{
        User.create(params).then(()=>{
            console.log("created")
        })
    }
}

exports.delete = (req, res, next) => {
    const userId = req.params.id
    User.destroy({
        where: {
           id: userId
        }
    }).then(rowsDeleted => {
        console.log(rowsDeleted)
    })
}