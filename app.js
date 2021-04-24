if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
} 

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./Utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const session = require('express-session');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');


const MongoStore = require('connect-mongo');

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp-x';

//local address for the app
//'mongodb://localhost:27017/yelp-camp-x'

//mongo atlas connection
//dbURL | process.env.DB_URL

mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    //usefindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'zokokokolangyetmanmanw!';
  
const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});


const sessionConfig ={
    store,
    name: 'session',
    secret,
    touchAfter: 24 * 3600, //24 hours (in seconds)
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expires after 1 week (in ms)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

store.on("error", function(e){
    console.log("Session Store Error!", e);
})

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

    const scriptSrcUrls = [
        "https://stackpath.bootstrapcdn.com/",
        "https://api.tiles.mapbox.com/",
        "https://api.mapbox.com/",
        "https://kit.fontawesome.com/",
        "https://cdnjs.cloudflare.com/",
        "https://cdn.jsdelivr.net",
    ];
    const styleSrcUrls = [
        "https://kit-free.fontawesome.com/",
        "https://stackpath.bootstrapcdn.com/",
        "https://api.mapbox.com/",
        "https://api.tiles.mapbox.com/",
        "https://fonts.googleapis.com/",
        "https://use.fontawesome.com/",
        "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css",
        "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.1/dist/umd/popper.min.js",
        "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.min.js"
    ];
    const connectSrcUrls = [
        "https://api.mapbox.com/",
        "https://a.tiles.mapbox.com/",
        "https://b.tiles.mapbox.com/",
        "https://events.mapbox.com/",
    ];
    const fontSrcUrls = [];
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                objectSrc: [],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/drodhd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                    "https://images.unsplash.com/",
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
            },
        })
    );

//must be below session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//whenever there's an action that requires a 'success' response
//just add <%=succes%> in an ejs file
//----if there's anytning reffering to the keys error, success, etc
app.use((req, res, next) => {
    //show login/logout/signup wether someone is logged in or not
    res.locals.currentUser = req.user;

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//setting up prefixes for the routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);



app.get('/', (req, res)=> {
    res.render('home')
}); 


app.all('*', (req, res, next) => {
    next(new ExpressError('404, Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong!'
    res.status(statusCode).render('error', { err }); //error.ejs
});


const port = process.env.PORT || 3000;
app.listen(port, () =>{
    console.log(`Listenning on port ${port}...`)
});