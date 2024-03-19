const express = require('express')
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const globalError = require('./controllers/errorController')
const mongoose = require('mongoose')
const userRoute = require('./routes/userRoute')

const app = express()

app.use(express.json())

// MONGODB CONNECT
const DB = process.env.DATABASE.replace('<password>', process.env.PASSWORD)
mongoose.connect(DB).then(con => {
    console.log('Connected')
})

app.use('/api/users', userRoute)
app.use(globalError)

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log('Working')
})
