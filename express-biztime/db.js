/** Database setup for BizTime. */

// require pg to access the pg.client or detructurized {client}
const {Client} = require("pg")



// create uri variable,
let DB_URI;

// two separate databases, if node process = test, use test db,
if (process.env.NODE_ENV === "test"){
    DB_URI = "postgresql:///biztime_test";
} else {
    // if not use regular db
    DB_URI = "postgresql:///biztime";
}


let db = new Client({
    connectionString: DB_URI


})

db.connect()

module.exports = db;