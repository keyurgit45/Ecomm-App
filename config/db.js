const mongoose = require('mongoose')

const connectToDB = () => {
    mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log("DB CONNECTED SUCCESSFULLY!"))
    .catch(error => {
        console.log("DB CONNECTION ISSUES")
        console.log(error)
        process.exit(1)
    })
}

module.exports = connectToDB