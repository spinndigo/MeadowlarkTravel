
/*  ---------------------- IMPORTS ----------------------------   */
var express = require('express');
var handlebars = require('express-handlebars').create({defaultLayout: 'main', 
helpers: {
    section: function(name, options){
        if(!this._sections){this._sections = {};}
        this._sections[name] = options.fn(this);
        return null;
    }}});
var fortune = require('./lib/fortune.js');
var formidable = require('formidable');
const { getWeatherData } = require('./lib/dummyWeather.js');
var cartValidation = require('./lib/cartValidation.js');
var credentials = require('./credentials.js');


/*  ---------------------- APP ----------------------------   */
var app = express();


app.engine('handlebars' , handlebars.engine);

app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

switch (app.get('env')) {
    case 'development':
        app.use(require('morgan'));
        break;
    case 'production':
        app.use(require('express-logger')({
            path: __dirname + '/log/requests.log'
        }));
        break;
}

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret
}));

app.use(function(req,res,next){
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

app.use(function (req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weatherContext = getWeatherData();
    next();
});

app.use(function (req, res, next) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

app.get('/' , function(req, res){
    res.render('home');
});

app.get('/about' , function(req, res){
   res.render('about', {fortune: fortune.getFortune(), pageTestScript: '/qa/tests-about.js'});
});

app.get('/contest/vacation-photo', function (req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth(),
    })
});

app.post('/contest/vacation-photo/:year/:month', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) return res.redirect(303, '/error');
        console.log('received fields: ', fields);
        console.log('received files: ', files);
         req.session.flash = {
            type: 'success',
            intro: 'thank you for your submission',
            message: 'your photo is appreciated',
        }
        res.redirect(303, '/thank-you');
    })
})

app.get('/headers' , function(req, res){
    res.set('Content-Type' , 'text/plain');
    var s = '';
    for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});

app.get('/newsletter', function(req, res){
    res.render('newsletter' , {csrf: 'CSRF Token here'});
});

app.get('/nursery-rhyme', function(req, res){
    res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function(req, res){
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck'
    })
});

app.get('/thank-you' , function(req, res){
    res.render('thank-you');
});

app.get('/tours/hood-river' , function(req, res){
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate' , function(req, res){
    res.render('tours/request-group-rate');
});

app.post('/process' , function(req,res){
    if (req.xhr || req.accepts(['json', 'html']) === 'json') {
        res.send({ success: true });
    }
    else {
        req.session.flash = {
            type: 'success',
            intro: 'thank you for your submission',
            message: 'your contribution is appreciated',
        }
        res.redirect(303, '/thank-you');
    }
});

app.use(function(req, res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port') , function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; using environment: ' + app.get('env') + '; press Ctrl-C to terminate');
});