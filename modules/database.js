if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const mysql  = require('mysql2/promise'),
      config = {
          host     : process.env.DB_HOST,
          user     : process.env.DB_USER,
          password : process.env.DB_PASSWORD,
          database : process.env.DB_DATABASE,
          port     : process.env.DB_PORT,
      }

async function sendQuery(query){
    const connection = await mysql.createConnection( config );
    try {
        const [results, ] = await connection.execute(query);
        connection.end();
        return results;
    }
    catch (error) { console.log(`[ DATABASE ] There was an error with the query: \n  ${error}`) }
}

module.exports = { sendQuery }