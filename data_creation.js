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

const add_cars = () => {
    const car_colors = ['red', 'black', 'blue', 'yellow', 'white','grey', 'silver'];
    for (let i=0; i<2000; i++){
        let new_car = { id:i, colour:car_colors[i%7], make:'make'+String(Math.floor(i/100)), model:'model'+String(Math.floor(i/100))+String(i%10), rate:10 + i%10};
        // 20 makes, each make has 10 models
        con.query('INSERT INTO cars SET ?', new_car, (err, res)=>{
            if(err) throw err;
        });
    }
}

const add_garage = () => {
    for (let i = 0; i<50; i++){
        // 50 garages
        // 40 cars per garage
        // 10 cities
        // 5 states
        let new_garage = {id:i, capacity:100-(i%3)*10, staddress:'address '+i, city:'city '+(i%10), state:'state '+((i%10)%5), zipcode:String(100000+i)};
        con.query('INSERT INTO garages SET ?', new_garage, (err, res)=>{
            if(err) throw err;
        });
    }
}

const add_user = () => {
    for (let i = 0; i<10000; i++){
        // 50 garages
        // 40 cars per garage
        // 10 cities
        // 5 states
        let new_user = {username:String(i), password:String(i), firstname:'fname '+i, lastname:'lastname '+i};
        con.query('INSERT INTO users SET ?', new_user, (err, res)=>{
            if(err) throw err;
        });
    }
}


const add_parked_at = () => {
    for (let i = 0; i<2000; i++){
        // 50 garages
        // 40 cars per garage
        // 10 cities
        // 5 states
        let new_entry = {id:i, car_id:i, garage_id:i%40}
        con.query('INSERT INTO parked_at SET ?', new_entry, (err, res)=>{
            if(err) throw err;
        });
    }
}



// add_cars();
// add_garage();
// add_user();
// add_parked_at();



con.query('SELECT count(*) FROM parked_at', (err,rows) => {
    if(err) throw err;
  
    console.log('Data received from Db:');
    console.log(rows);
  });

con.end((err) => {});


