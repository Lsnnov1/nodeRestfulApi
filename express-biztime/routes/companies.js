const express = require("express");
const router = express.Router();
const db = require("../db");


// GET ALL COMPANIES 
router.get('/',  async function(req, res, ){
    const results = await db.query(`SELECT * FROM companies`)
    return res.json(results.rows)
})

// GET COMPANY BY CODE 
router.get("/:code", async function(req, res, next){
    try {
        // EXTRACT CODE PARAMITER FROM URL
    let code = req.params.code;


    const results =  await db.query(
        `SELECT * FROM companies WHERE code = $1`, [code]);
   

    const invResult = await db.query(
        `SELECT id FROM invoices WHERE comp_code = $1`, [code]);

        // IF NO COMPANY FOUND, THROW ERROR 
    if (results.rows.length === 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
        }
    
        const company = results.rows[0];
        const invoices = invResult.rows;
    
        company.invoices = invoices.map(inv => inv.id);
    
        return res.json({"company": company}); 

    } catch (err) {
        return next(err);
    }
    });

//  CREATE COMPANY ROUTE 
router.post("/companies", async function(req, res, next){
try {

    // GET NAME, DESCRIPTION FROM RES BODY
    const {name, description } = req.body;
    // SLUGIFY GENERATES URL FRIENDLY CODE 
    let code = slugify(name, {lower: true});


    const result = db.query(`INSERT INTO companies (code, name, description)
                            VALUES ($1, $2, $3)
                            RETURNING (code, name, description)`, [code, name, description]);
// RETURN AS JSON
    return res.status(201).json({"company": result.rows[0]});

} catch(err) {
    return next(err)}
})



// UPDATE ROUTE 
// PUT
router.put("/:code", async function (req, res, next) {
    try {
        // GET NAME AND DESCRIPTION FROM RES BODY
      let {name, description} = req.body;
      let code = req.params.code;

//   UPDATE SQL
      const result = await db.query(
            `UPDATE companies
             SET name=$1, description=$2
             WHERE code = $3
             RETURNING code, name, description`,
          [name, description, code]);

//   THROW ERROR IF NO COMPANY IS FOUND
      if (result.rows.length === 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      } else {

        // RETURN JSON RESPONSE
        return res.json({"company": result.rows[0]});
      }
    }
  
    catch (err) {
      return next(err);
    }
  
  });



// DELETE ROUTE 
router.delete("/:code", async function (req, res, next) {
    try {
        // GET COMPANY BY CODE PARAM EXTRACTED FROM URL
      let code = req.params.code;
  
    //   DELETE FROM DB BY CODE 
      const result = await db.query(
            `DELETE FROM companies
             WHERE code=$1
             RETURNING code`,
          [code]);

//   IF NONE FOUND THROW ERROR 
      if (result.rows.length == 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      } else {
        
        // RETURN JSON RESPONSE
        return res.json({"status": "deleted"});
      }
    }
  
    catch (err) {
      return next(err);
    }
  });

module.exports = router;