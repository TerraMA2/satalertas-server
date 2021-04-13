const express = require('express'),
    compression = require('compression'),
    morgan = require('morgan'),
    helmet = require('helmet'),
    cors = require('cors')

const viewRouter = require('./routes/view')
const groupRouter = require('./routes/group.router')
const groupViewRouter = require('./routes/group-view.router')
const geoserverRouter = require('./routes/geoserver')
const reportRouter = require('./routes/report')
const configRouter = require('./routes/config')
const satVegRouter = require('./routes/sat-veg')
const carRouter = require('./routes/car.router')
const dashboardRouter = require('./routes/dashboard.router')
const mapRouter = require('./routes/map.router')
const biomeRouter = require('./routes/biome.router')
const projusRouter = require('./routes/projus.router')
const indigenousLandRouter = require('./routes/indigenous-land.router')
const conservationUnitRouter = require('./routes/conservation-unit.router')
const cityRouter = require('./routes/city.router')
const analyzeRouter = require('./routes/analyze.router')
const exportRouter = require('./routes/export.router')

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
const basePath = config.basePath;

const errorController = require('./controllers/error')

const app = express()

app.use(cors())
app.use(compression({}))
app.use(helmet())
app.use(morgan('combined', {}))
app.use(express.json({limit: '200mb', inflate: true, strict: true, type: 'application/json'}))

app.use(basePath+'/group', groupRouter)
app.use(basePath+'/groupView', groupViewRouter)
app.use(basePath+'/view', viewRouter)
app.use(basePath+'/geoserver', geoserverRouter)
app.use(basePath+'/report', reportRouter)
app.use(basePath+'/config', configRouter)
app.use(basePath+'/satveg', satVegRouter)
app.use(basePath+'/car', carRouter)
app.use(basePath+'/dashboard', dashboardRouter)
app.use(basePath+'/map', mapRouter)
app.use(basePath+'/biome', biomeRouter)
app.use(basePath+'/projus', projusRouter)
app.use(basePath+'/indigenousLand', indigenousLandRouter)
app.use(basePath+'/conservationUnit', conservationUnitRouter)
app.use(basePath+'/city', cityRouter)
app.use(basePath+'/analyze', analyzeRouter)
app.use(basePath+'/export', exportRouter)

// Error handler
app.use(errorController.show404)
app.use(errorController.show500)
app.use(errorController.showError)

module.exports = app
