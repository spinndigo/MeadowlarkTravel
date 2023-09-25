
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
const { getWeatherData } = require('./lib/dummyWeather.js');


/*  ---------------------- APP ----------------------------   */
var app = express();


app.engine('handlebars' , handlebars.engine);
app.set('view engine' , 'handlebars');

app.set('port' , process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({extended: true}));

app.use(function(req,res,next){
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

app.use(function(req, res, next){
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weatherContext = getWeatherData();
    next();
})

app.get('/' , function(req, res){
    res.render('home');
});

app.get('/about' , function(req, res){
   res.render('about', {fortune: fortune.getFortune(), pageTestScript: '/qa/tests-about.js'});
});

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

app.get('/tours/hood-river' , function(req, res){
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate' , function(req, res){
    res.render('tours/request-group-rate');
});

app.post('/process' , function(req,res){
    console.log('Form from querystring: ' + req.query.form);
    console.log('CSRF token from hidden form field: ' + req.body._csrf);
    console.log('Name from visible form field: ' + req.body.name);
    console.log('Email from visible form: ' + req.body.email);
    res.redirect(303 , '/thank-you');
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
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate');
});