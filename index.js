//load libs
const express = require('express')
const hbs = require('express-handlebars')
const mysql = require('mysql2/promise')

//config PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

//SQL
const SQL_FIND_TVSHOWS = 'select * from tv_shows ORDER BY name DESC limit ?';
const SQL_GET_TVSHOW_BY_APPID = 'select * from tv_shows where tvid = ?'

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

app.get('/',async(req,res)=>{
    const conn = await pool.getConnection()

    try {
        const result = await conn.query(SQL_FIND_TVSHOWS, [20])
        // console.log(result[0]);
        res.status(200)
        res.type('text/html')
        res.render('index',{tv: result[0]})
    }catch(e){
        res.status(500)
        res.type('text/html')
        res.send(JSON.stringify(e))
        return
    }finally {
        conn.release()
    }
})

app.get('/:tvId',async(req,res)=>{
    const tvId = req.params['tvId'];

    const conn = await pool.getConnection();
    try {
        const result = await conn.query(SQL_GET_TVSHOW_BY_APPID, [tvId])
        const recs = result[0];
        
            res.format({
                'text/html' : () => {
                    res.type('text/html')
                    res.render('tv',{tv:recs[0]})
                },
                'application/json': () => {
                    res.type('application/json')
                    res.json(recs[0])
                },
                'default': () => {
                    res.type('text/plain')
                    res.send(JSON.stringify(recs[0]))
                }
            })
    } catch (e) {
        res.status(500)
        res.type('text/html')
        res.send(JSON.stringify(e))
        return
    } finally {
        conn.release()
    }
})

startApp(app, pool);