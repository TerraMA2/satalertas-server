const express = require('express')
    compression = require('compression')
    path = require('path')
    morgan = require('morgan')
    helmet = require('helmet')
    cors = require('cors')
    csrf = require('csurf')

const viewRouter = require('./routes/view')
const geoserverRouter = require('./routes/geoserver')

const errorController = require('./controllers/error')

// const csrfProtection = csrf()

const app = express()

// app.use(passport.initialize());
app.use(cors())
app.use(compression())
app.use(helmet())
app.use(morgan('combined'))
app.use(express.json())

// app.use(csrfProtection)

// app.use((req, res, next) => {
//     res.locals.csrfToken = req.csrfToken()
//     next()
// })

app.use('/view', viewRouter)
app.use('/geoserver', geoserverRouter)

// Error handler
app.use(errorController.show404)
app.use(errorController.show500)
app.use(errorController.showError)

module.exports = app
