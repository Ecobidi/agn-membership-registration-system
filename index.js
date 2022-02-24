require('dotenv').config({path: __dirname + '/.env'})
let express = require('express')
let expressSession = require('express-session')
let fileupload = require('express-fileupload')
let connectFlash = require('connect-flash')
let mongoose = require('mongoose')
// let MongoStore = require('connect-mongo')(expressSession)
// let passport = require('passport')
let { APPNAME, PORT, dbhost, dbport, dbname, sessionsecret, domain,} = require('./config') 

let port = process.env.PORT || PORT

//bring in mongo uri from mlab
// const mongoURI = "mongodb+srv://dbUser:dbPassword@cluster0.qmunc.mongodb.net/dbName?retryWrites=true&w=majority"
//monnect mongodb
// mongoose.connect(mongoURI, { useMongoClient: true });

// mongoose.connect(`mongodb://${dbhost}:${dbport}/${dbname}`)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qmunc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

try {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('connected to database: ' + process.env.DB_NAME)
} catch (error) {
  console.log('Error connecting to database: ' + process.env.DB_NAME)
  console.log(error)
}

// routes
const { LoginRouter, UserRouter, MemberRouter } = require('./routes')

// models
const MemberModel = require('./models/member')
const UserModel = require('./models/user')

// init express App
let app = express()

// view engine 
app.set('view engine', 'ejs')
app.set('views', './views')

// expressStatic
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/uploads'))

// bodyparser middlewares
app.use(express.json())
app.use(express.urlencoded())

// app.use(fileupload())

// express-session middleware
app.use(expressSession({
  secret: sessionsecret,
  saveUninitialized: true,
  resave: true,
  // store: new MongoStore({
  //   mongooseConnection: mongoose.connection,
  //   ttl: 14 * 24 * 60 * 60
  // })
}))
// passport middleware
// app.use(passport.initialize())
// app.use(passport.session())
// connect-flash
app.use(connectFlash())

app.use((req, res, next) => {
  res.locals.errors = req.flash('errors')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.success_msg = req.flash('success_msg')
  res.locals.user = req.session.user || { username: 'test' }
  app.locals.appname = APPNAME
  app.locals.port = PORT
  app.locals.domain = domain + ':' + PORT
  next()
})

// routes

app.use('/login', LoginRouter)

app.use('/', (req, res, next) => {
  // for authenticating login
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
})

app.get('/logout', (req, res) => {
  req.session.loggedIn = false
  req.session.username = ''
  req.session.user = null
  res.redirect('/login')
})

let getDashboard = async (req, res) => {
  try {
    let member_count = await MemberModel.count()
    let user_count = await UserModel.count()
    res.render('dashboard', {member_count, user_count})
  } catch (err) {
    console.log(err)
    res.render('dashboard', {
      member_count: 0, user_count: 0,
    })
  }
}

app.get('/', getDashboard)

app.get('/dashboard', getDashboard)

app.use('/members', MemberRouter)

app.use('/users', UserRouter)

app.listen(port, () => { console.log(`${APPNAME} running on port ${port}`) })