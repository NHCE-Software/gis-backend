var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const grantAccess = require("./middleware/verifytoken");
var multer = require("multer");
const imagesToPdf = require("images-to-pdf")

const { time } = require("console");

//Permission Letter Storage

var storage = multer.diskStorage({
  destination: function(req, file, cb){
    if(file.mimetype === "application/pdf"){
      cb(null, "./static/permission_letters");
    }
    else if (file.fieldname==="permission_letter"&&file.mimetype === "image/png") {
      cb(null, "./static/temp");
    }
    else if (file.fieldname==="permission_letter"&&file.mimetype === "image/jpeg") {
      cb(null, "./static/temp");
    }
    else if (file.fieldname==="permission_letter"&&file.mimetype === "image/jpg") {
      cb(null, "./static/temp");
    }
    else{
      console.log(file.mimetype);
      cb({error: "Mime type not supported"});
    }
  },
  filename: function(req, file, cb){
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length -1];
    var date_now = new Date();
    let dd = String(date_now.getDate()).padStart(2,"0")
    let mm = String(date_now.getMonth()+1).padStart(2,"0")
    let yy = date_now.getFullYear()
    let timestamp = dd + "-" + mm + "-" + yy + ""; 
    cb(
      null,
      file.originalname + "-" + file.fieldname + "-" + timestamp + "." + extension
    );
  }
});

var upload = multer({ storage: storage});

/* GET users listing. */
router.get('/', grantAccess("client"), async function(req, res, next) {
  res.json('Client for users');
});

//Raise a request.

router.post('/raiserequest', grantAccess("client"), [upload.any()], async function(req, res) {
  const file = req.files;
  console.log(file);

  var date_now = new Date();
  let dd = String(date_now.getDate()).padStart(2,"0")
  let mm = String(date_now.getMonth()+1).padStart(2,"0")
  let yy = date_now.getFullYear()
  let timestamp = dd + "-" + mm + "-" + yy + ""; 

  const perm_letter = file.slice(-1);

  if(perm_letter[0].mimetype!=="application/pdf"){

    await imagesToPdf([`./static/temp/${perm_letter[0].filename}`], `./static/permission_letters/${perm_letter[0].originalname}-${perm_letter[0].fieldname}-${timestamp}.pdf`)
    }

  
  const reqss = JSON.parse(req.body.reqs);

  const raiserequests = await Promise.all(
    reqss.map(async (post, index) => {
      
        const it = await prisma.transactions.create({
          data: {
            title: post.title,
            description: post.description,
            user_id: req.user.user_id,
            status: "Pending",
            permission_letter: `${perm_letter[0].originalname}-${perm_letter[0].fieldname}-${timestamp}.pdf`,
          },
        });
        res.status(200).json({
          status: "success",
          data: it,
        });
      
      
    })
  );
  
});

// My Requests

router.get("/myrequests", grantAccess("client"), async function (req, res) {
  const userid  = req.user.user_id;
  try {
    const transaction = await prisma.transactions.findMany({
      where: {
        user_id: userid,
      },
    });
    res.status(200).json({
      status: "Success",
      transaction: transaction,
    });
  } catch (err) {
    return res.json({
      status: "error",
      details: "Failed to Reterive Data",
    });
  }
});

router.get(
  "/viewtransaction/:id", grantAccess("client"),
  async function (req, res) {
    const id = parseInt(req.params.id);
    console.log(id)
    try {
      const transaction = await prisma.transactions.findUnique({
        where: {
          id: id,
        },
      });
      res.status(200).json({
        status: "Success",
        transaction: transaction,
      });
    } catch (err) {
      return res.json({
        status: "error",
        details: "Failed to Reterive Data",
      });
    }
  }
);

router.post("/deletereq",grantAccess("client"), async function(req,res){
  const {requestID} = req.body
  try {
    const deleteTransaction = await prisma.transactions.delete({
      where:{
        id:requestID
      }
    })
    res.status(200).json({
      status: "Deleted Transaction",
      transaction: deleteTransaction,
    });
  } catch (err) {
    return res.json({
      status: "error",
      details: "Failed to Delete",
    });
    
  }
})

// Edit Request
router.post("/editreq",grantAccess("client"), async function(req,res){
  const { requestID, newtitle, newdesc } = req.body;

  try {
    const editTransaction = await prisma.transactions.update({
      where:{
        id: parseInt(requestID)
      },
      data: {
        title: newtitle,
        description: newdesc,
      },
    });
    res.status(200).json({
      status: "Transaction Edited",
      data: editTransaction,
    });
  } catch (err) {
    return res.json({
      status: "error",
      details: "Failed to Edit",
    });
    
  }
})


router.get("/getfiles/:type/:name", async function (req, res) {
  
  const type = req.params.type;
  const name = req.params.name;
  const path = require('path');
  
  if (type === "bills"){
    res.json({
      status:"Error",
      details: "Cannot access this folder"
    })
  }
  else if(type === "permission_letters" || type === "images"){
  console.log(type);
  console.log(name);
  res.sendFile(path.join(__dirname, "..", "static", type, name));
  }
  else{
    res.json({
      status:"Error",
      details: "No such folder"
    })
  }
});



module.exports = router;
