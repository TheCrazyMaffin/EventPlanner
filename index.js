//#region Imports
const http = require("http")
const express = require("express")
const path = require("path")
require("dotenv").config()
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
//#endregion

//Initialize app
let app = express();

//Set up authentication
passport.use(new LocalStrategy((username, password, done) => {
    //TODO Get things from the db
    done(null, "Username")
    //done(null, false) to let login fail
}))

//Set up EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs")

//Set a port
app.set('port', process.env.PORT)

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use()
//Serve static assets such as images, stylesheets and javascript
app.use(express.static(path.join(__dirname, 'public')))

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

})

server.on('listening', () => {
    const addr = server.address();
    //Get either a pipe or port to display
    var binding = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
    console.log(`Listening on ${binding}`)
})