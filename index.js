//load libs
const express = require('express')
const hbs = require('express-handlebars')
const mysql = require('mysql2/promise')

//config PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

// configure connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306, 
    database: process.env.DB_NAME || 'leisure',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: 4, 
    timezone: '+08:00'
})

// create express and configure hbs
const app = express()
app.engine('hbs', hbs({ defaultLayout: 'default.hbs' }))
app.set('view engine', 'hbs')



const startApp = async(app,pool) => {
    try{
        // acquire a connection from the connection pool
        const conn = await pool.getConnection();

        console.log('Pinging database....');
        await conn.ping();
        //release the connection
        conn.release();

        app.listen(PORT,()=>{
            console.log(`app is running on`,PORT);
        })

    }catch(e){
        console.log(`Cannot ping database: `,e);
    }
}

app.get('/',(req,res)=>{
    res.status(200)
    res.type('text/html')
    res.render('index')
})

startApp(app, pool);