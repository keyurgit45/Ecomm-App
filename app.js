require('dotenv').config()
const cookieParser = require('cookie-parser')
const express = require('express')
const fileUpload = require('express-fileupload')
const morgan = require('morgan')
const app = express()

//swagger config
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//regular middlewares
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))

//morgan middleware
app.use(morgan("tiny"))

//import all routes
const home  = require('./routes/home.js')
const user = require('./routes/user.js')
//router middleware
app.use('/api/v1',home)
app.use('/api/v1',user)
module.exports = app