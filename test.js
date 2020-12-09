// npm start test.js
const express = require('express');
const app = express();

const mysql = require('mysql');
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






app.listen(4001, () => {
    console.log('server working');
});


app.get('/', (req, res, next)=>{

    res.status(404).send('<h1>nothing to show here but good<h1>');
});

app.get('/make1', (req, res, next)=>{
    
    con.query('SELECT * FROM cars where make=?', ['make1'], (err,rows) => {
        if(err) throw err;
    
        res.status(200).send(rows);
    });


});

// con.end((err) => {});

