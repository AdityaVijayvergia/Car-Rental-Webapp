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



con.query('SELECT * FROM cars', (err,rows) => {
    if(err) throw err;
  
    console.log('Data received from Db:');
    console.log(rows);
  });

con.end((err) => {});