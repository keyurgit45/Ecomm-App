const BigPromise = require("../middleware/bigPromise")

exports.home = BigPromise((req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Hello From API."
    })
})

exports.dummy = (req, res) => {
    res.status(200).json({
        success: true,
        greeting: "This is a dummy route."
    })
}