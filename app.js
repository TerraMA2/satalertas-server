const express = require('express')
    compression = require('compression')
    path = require('path')
    morgan = require('morgan')
    helmet = require('helmet')
    cors = require('cors')
    csrf = require('csurf')
    bodyParser = require('body-parser')

const viewRouter = require('./routes/view')
const geoserverRouter = require('./routes/geoserver')
const reportRouter = require('./routes/report')
const configRouter = require('./routes/config')

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
const basePath = config.basePath;

const errorController = require('./controllers/error')

const app = express()

app.use(cors())
app.use(compression())
app.use(helmet())
app.use(morgan('combined'))
app.use(express.json({limit: '100mb'}))

app.use(basePath+'/view', viewRouter)
app.use(basePath+'/geoserver', geoserverRouter)
app.use(basePath+'/report', reportRouter)
app.use(basePath+'/config', configRouter)

// Error handler
app.use(errorController.show404)
app.use(errorController.show500)
app.use(errorController.showError)

module.exports = app
