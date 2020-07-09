
const sql = require('mssql');
const setStat = 'SET STATISTICS TIME, IO ON '; 
let currRequest;
  
async function checkDBConnection(sqlConfig){  
    let result = true;
    try{ 
        // async/await style:
        const pool = new sql.ConnectionPool(sqlConfig);
        await pool.connect();  
        //await sql.connect(sqlConfig);
    }
    catch(err){   
        throw err;
    }
    finally{  
        sql.close();
    }
    return result; 
}
 
async function runScript(sqlConfig, sqlScript){    
    let result = {};
    result.IO = [];
    result.Time = [];

    try{   
        const pool = new sql.ConnectionPool(sqlConfig);
        await pool.connect();   
        currRequest = new sql.Request(pool);
        
        currRequest.on('info', info => { 
            if(info.number == 3612 || info.number == 3613)
                result.Time.push(info);
            else if(info.number == 3615)
                result.IO.push(info);
        }) 

        await currRequest.query(setStat + sqlScript);  

    }
    catch(err){  
        throw err;
    }
    finally{ 
        sql.close();  
    }
    return result; 
}

function cancelScript(){  
    try{ 
        currRequest.cancel();
    }
    catch(err){  
        console.log(err)
    }  
    finally{ 
        sql.close();  
    }
}
