'use strict';

//#region Imports
const http = require("http")
const express = require("express")
const path = require("path")
require("dotenv").config()
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const i18n = require('i18n')
const cookieSession = require("cookie-session")
//#endregion

//Set up i18n
i18n.configure({
    locales: ['en', 'de'],
    directory: path.join(__dirname, "locales"),
    defaultLocale: 'en',
    retryInDefaultLocale: true,
    queryParameter: 'lang', //Language can be changed by adding ?lang=xy
    autoReload: true,
    updateFiles: true,
    syncFiles: true,
    fallbacks: {
        //https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
        'de-*': 'de',
        'en-*': 'en'
    },
})

//Initialize app
let app = express();

//Set up authentication
passport.use(new LocalStrategy((username, password, done) => {
    //TODO Get things from the db
    done(null, "Username")
    //done(null, false) to let login fail
}))

//Set up EJS. Tell it what to use (path and engine)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs")

//Set a port. Used by the webserver
app.set('port', process.env.PORT)

//Enable json and urlencoded support
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
//Enable i18n based on accept-language header
app.use(i18n.init)
//Serve static assets such as images, stylesheets and javascript
app.use(express.static(path.join(__dirname, 'public')))

//Cookies! Changing the cookie secret invalidates old cookies.
app.use(cookieSession({
    name: "eventPlanner",
    secret: process.env.COOKIE_SECRET,
    maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
}))

//#region Routes
const eventsRouter = require("./routes/events")
const usersRouter = require("./routes/users")
const authRouter = require("./routes/auth")
const indexRouter = require("./routes/index")


app.use("/", indexRouter)
app.use("/events", eventsRouter)
app.use("/users", usersRouter)
app.use("/auth", authRouter)
//If the request still isnt being processed by something return a 404
app.use((req, res, next) => {
    res.render('404')
})
//#endregion

let server = http.createServer(app)
server.listen(process.env.PORT)

server.on('error', (error) => {
 console.error(error)
})

server.on('listening', () => {
    const addr = server.address();
    //Get either a pipe or port to display
    var binding = typeof addr === `string` ? `pipe ${addr}` : `port ${addr.port}`
    console.log(`Listening on ${binding}`)
})