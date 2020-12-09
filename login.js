var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const { response } = require('express');
const { request } = require('http');


const con = mysql.createConnection({
    host: 'localhost',
    user: 'aditya',
    password: 'Password1',
    database: 'car_rental'
  });
  con.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
  });

  const app = express();
  // set the view engine to ejs
  app.set('view engine', 'ejs');

  app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.get('/', (request, response) => {
	response.render('login');
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		con.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


app.get('/register_user', (request, response) => {
	response.render('register_user');
});

app.post('/register_user', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var fname = request.body.first_name;
	var lname = request.body.last_name;
	if (username && password && fname && lname) {
        console.log(username);
		con.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
            if (results.length > 0) {
				// response.send('username in use.')
				response.redirect('/register_user');
			} else {
                // response.send('Registration successful.');
                let new_user = {username:username, password: password, firstname: fname, lastname: lname};
                con.query('Insert into users SET ?', new_user ,(err, res) => {
                    if(err) throw err;
                  
                    console.log('Last insert ID:', res.insertId);
                  });
				response.redirect('/booking-step1');
			}			
			// response.end();
		});
	} else {
		response.send('Please enter all details!');
        response.redirect('/register_user');
        // response.end();
	}
});


app.get(['/booking-step1','/home'], (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
    }
    else{
        var headline = 'START NEW BOOKING. We have garages all over US. Select your state';
        con.query('SELECT DISTINCT state from garages', (err, all_options) => {
        if(err) throw err;
        var word = 'State'
        all_options = all_options.map(opt => opt.state.split(" ")[1]);
        // console.log(all_options);
        var formaction = 'booking-step1';

        res.render('booking', {
            headline: headline,
            all_options: all_options,
            formaction: formaction,
            word: word
        });

        });
        
    }
});


app.post('/booking-step1', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{
        var state = req.body.list;
        // console.log(state,'_____________');
        if (state){
            state = 'state ' + state.substring(5,req.body.list.length);
            req.session.state = state;
            res.redirect('booking-step2');
        }
        res.send();
    }
});



app.get('/booking-step2', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }


    else{
        var headline = 'Select your city';
        con.query('SELECT DISTINCT city from garages where state = ?',
            [req.session.state], (err, all_options) => {
            if(err) throw err;
            var word = 'City'
            all_options = all_options.map(opt => opt.city.split(" ")[1]);
            var formaction = 'booking-step2';
    
            res.render('booking', {
                headline: headline,
                all_options: all_options,
                formaction: formaction,
                word: word
            });
    
        });

    }
});



app.post('/booking-step2', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{

        var city = req.body.list;

        if (city){
            city = 'city ' + city.substring(4,req.body.list.length);
            req.session.city = city;
            // console.log(garage,'---------------------');
            res.redirect('booking-step3');
        }
        res.send();
    }
});




app.get('/booking-step3', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }


    else{
        var headline = 'Select a pickup garage';
        con.query('SELECT DISTINCT id from garages where state = ? and city = ?',
            [req.session.state, req.session.city], (err, all_options) => {
            if(err) throw err;
            var word = 'Garage'
            all_options = all_options.map(opt => opt.id);
            var formaction = 'booking-step3';
    
            res.render('booking', {
                headline: headline,
                all_options: all_options,
                formaction: formaction,
                word: word
            });
    
        });

    }
});



app.post('/booking-step3', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{

        var garage = req.body.list;

        if (garage){
            garage = garage.substring(6,req.body.list.length);
            req.session.garage = garage;
            // console.log(garage,'---------------------');
            res.redirect('booking-step4');
        }
        res.send();
    }
});



app.get('/booking-step4', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{
        var headline = 'We have the following cars at Garage' + req.session.garage +'. Select a model';
        con.query('select distinct model from cars, parked_at where garage_id =? and parked_at.car_id = cars.id',
            [req.session.garage], (err, all_options) => {
            if(err) throw err;
            var word = ''
            all_options = all_options.map(opt => opt.model);
            var formaction = 'booking-step4';
    
            res.render('booking', {
                headline: headline,
                all_options: all_options,
                formaction: formaction,
                word: word
            });
    
        });
    }
});



app.post('/booking-step4', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{

        var model = req.body.list;

        if (model){
            // garage = garage.substring(6,req.body.list.length);
            req.session.model = model;
            // console.log(garage,'---------------------');
            res.redirect('booking-step5');
        }
        res.send();
    }
});




app.get('/booking-step5', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{
        var headline = req.session.model +' is available in following colours. Select one';
        con.query('select distinct colour from cars, parked_at where garage_id = ? and parked_at.car_id = cars.id and cars.model=?;',
            [req.session.garage, req.session.model], (err, all_options) => {
            if(err) throw err;
            var word = ''
            all_options = all_options.map(opt => opt.colour);
            var formaction = 'booking-step5';
    
            res.render('booking', {
                headline: headline,
                all_options: all_options,
                formaction: formaction,
                word: word
            });
    
        });
    }
});


app.post('/booking-step5', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{
        var colour = req.body.list;

        if (colour){
            req.session.colour = colour;
            // console.log(garage,'---------------------');
            res.redirect('booking-step6');
        }
        res.send();
    }
});


// select rate from cars, parked_at where garage_id = 3 and parked_at.car_id = cars.id and cars.model="model03" and cars.colour = "black";


app.get('/booking-step6', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{
        var headline = 'Your final hourly rate is for '+req.session.model+' is ';
        con.query('select MIN(rate) from cars, parked_at where garage_id = ? and parked_at.car_id = cars.id and cars.model=? and cars.colour = ?',
            [req.session.garage, req.session.model, req.session.colour], (err, all_options) => {
            if(err) throw err;
            console.log(all_options);
            // all_options = all_options.map(opt => opt.model);
            // var formaction = 'bookcar';
            rate = all_options[0]['MIN(rate)'];
            headline = headline + '$' + rate;
            req.session.rate = rate
    
            res.render('final_booking', {
                headline: headline
                // formaction: 'bookcar'
            });
    
        });
    }
});


app.post('/bookcar', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{
        // console.log('==================================');
        con.query('select cars.id from cars, parked_at where garage_id = ? and parked_at.car_id = cars.id and cars.model=? and cars.colour = ? and rate=?',
        [req.session.garage, req.session.model, req.session.colour, req.session.rate], (err, all_options) => {
            if(err) throw err;
            console.log(all_options);
            req.session.car_id = all_options[0].id;

            con.query('insert into bookings (rent,car_id, username) values(?,?,?)', 
                [req.session.rate, req.session.car_id, req.session.username], (err, all_options) => {
                    if(err) throw err;
                    console.log(all_options);
                    req.session.booking_id = all_options.insertId;
                });
        });

        req.session.last = 'car';
        res.redirect('booking-done');
    }
});



app.get('/booking-done', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{
        
        if (req.session.last == 'car')
            var headline = 'Your booking is complete. We recomment you buying an insurance for your journey. You can select an insurance from the website.';    
        else
            var headline = 'Insurance selection complete'

        res.render('notice', {
            headline: headline
        });
    }
});



app.get('/buy-insurance', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{
        var headline = 'Select one insurance policy.';
        con.query('SELECT * from insurances', (err, all_options) => {
            if(err) throw err;
            var word = ''
            all_options = all_options.map(opt => 
                'Insurance'+ opt.id + ' for $' + opt.price
            );
            // console.log(all_options);
            var formaction = 'buy-insurance';

            res.render('booking', {
                headline: headline,
                all_options: all_options,
                formaction: formaction,
                word: word
            });

        });
        
    }
});


app.post('/buy-insurance', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to start booking.');
        // res.send('please login to start booking.');
    }
    else{
        var ins = req.body.list;
        // console.log(state,'_____________');
        if (ins){
            ins = ins.split(" ")[0];
            ins = ins.substring(9,ins.length);
            req.session.insurance_id = ins;
            req.session.last = 'ins';

            con.query('insert into insured (car_id, username, insurance_id) values (?,?,?);', 
                [req.session.car_id, req.session.username, req.session.insurance_id], (err, all_options) => {
                if(err) throw err;
                // console.log(all_options);
                // req.session.booking_id = all_options.insertId;
            });

            res.redirect('booking-done');
        }
        res.send();
    }
});



app.get('/view-bookings', (req, res) => {
    if(!req.session.loggedin){
        res.send('please <a href = /> login </a> to proceed.');
    }
    else{
        var headline = 'Your upcoming bookings will be shown below';
        con.query('select * from bookings JOIN (cars) on (cars.id = bookings.car_id) where username = ?;', [req.session.username], (err, all_options) => {
        if(err) throw err;


        res.render('show_bookings', {
            all_options: all_options
        });

        });
        
    }
});

app.get('/contact-us', (req, res) => {

        res.render('contact-page');

});







app.listen(3000);