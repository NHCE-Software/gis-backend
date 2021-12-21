var express = require("express");
var router = express.Router();
const grantAccess = require("./middleware/verifytoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var multer = require("multer");

var { mail } = require("./resources/newmail");

const imagesToPdf = require("images-to-pdf");

/* This will be made into a seperate utility file*/

const fs = require("fs");
const carbone = require("carbone");
const { time } = require("console");
const path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, "./static/bills");
    } else if (file.fieldname === "bill" && file.mimetype === "image/png") {
      cb(null, "./static/temp");
    } else if (file.fieldname === "bill" && file.mimetype === "image/jpeg") {
      cb(null, "./static/temp");
    } else if (file.fieldname === "bill" && file.mimetype === "image/jpg") {
      cb(null, "./static/temp");
    } else if (file.mimetype === "image/png") {
      cb(null, "./static/images");
    } else if (file.mimetype === "image/jpg") {
      cb(null, "./static/images");
    } else if (file.mimetype === "image/jpeg") {
      cb(null, "./static/images");
    } else {
      console.log(file.mimetype);
      cb({
        error: "Mime type not supported",
      });
    }
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    var date_now = new Date();
    let dd = String(date_now.getDate()).padStart(2, "0");
    let mm = String(date_now.getMonth() + 1).padStart(2, "0");
    let yy = date_now.getFullYear();
    let timestamp = dd + "-" + mm + "-" + yy + "";
    cb(
      null,
      file.originalname +
      "-" +
      file.fieldname +
      "-" +
      timestamp +
      "." +
      extension
    );
  },
});
var upload = multer({ storage: storage });
/*Testing File Merger
router.get("/", async function (req, res) {
  merge(
    ["./static/bills/1.pdf", "./static/bills/2.pdf"],
    "./static/bills/File Ouput.pdf",
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("Successfully merged!");
    }
  );
});
*/

router.post("/adduser", grantAccess("admin"), async function (req, res, next) {
  try {
    const { email, dept, password } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);

    const newuser = await prisma.users.create({
      data: {
        email_id: email,
        dept: dept,
        password: encryptedPassword,
      },
    });
    mail(email, password);

    res.status(200).json({
      user_id: newuser.user_id,
      dept: newuser.dept,
      email: newuser.email_id,
      status: "created",
    });
  } catch (err) {
    console.log(err);
    res.status(200).json({
      status: "Failed to add user",
    });
  }
});

router.get("/allusers", async function (req, res) {
  try {
    const allusers = await prisma.users.findMany({
      where: {},
      select: {
        dept: true,
        email_id: true,
        user_id: true,
      },
    });
    res.json(allusers);
  } catch (err) {
    console.log(err);
    res.status(200).json({
      status: "Failed to Get Users",
    });
  }
});

// ADD ITEMS
router.post(
  "/additem",
  grantAccess("admin"),
  [upload.any()],
  async function (req, res) {
    try {
      const allfiles = req.files;
      allfiles.sort((a, b) =>
        a.fieldname > b.fieldname ? 1 : b.fieldname > a.fieldname ? -1 : 0
      );
      console.log(allfiles);
      console.log(req.body.items);
      var date_now = new Date();
      let dd = String(date_now.getDate()).padStart(2, "0");
      let mm = String(date_now.getMonth() + 1).padStart(2, "0");
      let yy = date_now.getFullYear();
      let timestamp = dd + "-" + mm + "-" + yy + "";
      const billinfo = allfiles.slice(-1);
      if (billinfo[0].mimetype !== "application/pdf") {
        await imagesToPdf(
          [`./static/temp/${billinfo[0].filename}`],
          `./static/bills/${billinfo[0].originalname}-${billinfo[0].fieldname}-${timestamp}.pdf`
        );
      }
      const images = allfiles.slice(0, allfiles.length - 1);
      console.log(images);

      /* Parse JSON from Vue to read fields */

      console.log(JSON.parse(req.body.items));
      const itemss = JSON.parse(req.body.items);

      /* Sample Data 
  const items = [
    {
      name: "Pooen",
      quantity: 2,
      class: "A",
    },
    {
      name: "Chair",
      quantity: 2,
      class: "B",
    },
  ];*/
      var jsonbill = [
        {
          bill1: `${billinfo[0].originalname}-${billinfo[0].fieldname}-${timestamp}.pdf`,
        },
      ];

      await Promise.all(
        itemss.map(async (post, index) => {
          await prisma.inventory.create({
            data: {
              name: post.name,
              quantity: post.quantity,
              class: post.class,
              bill: jsonbill,
              image: images[index].filename,
              prodCustomID: post.prodCustomID,
            },
          });
        })
      );
      res.status(200).json({
        status: "success",
      });
    } catch (err) {
      console.log(err);
      res.status(200).json({
        status: "Failed to Add Item",
      });
    }
  }
);

router.post("/edit-transaction-status", async function (req, res) {
  const { requestID, action, items } = req.body;
  console.log(req.body);
  const reqid = parseInt(requestID);
  /*const items = [
    {
      id: 64,
      quantity: 3,
      name: Item name,
      class: Class A
    },
    {
      id: 65,
      quantity: 1,
      name: Item name,
      class: Class A
    },
  ];*/

  if (action === "Accepted") {
    /*
    This is where we can send the data for report making. JSON to PDF
    */
    try {
      await prisma.transactions.update({
        where: {
          id: reqid,
        },
        data: {
          assigned_items: items,
          status: "Accepted",
        },
      });

      items.map(async (i) => {
        await prisma.inventory.update({
          where: {
            id: parseInt(i.id),
          },
          data: {
            quantity: {
              decrement: parseInt(i.quantity),
            },
          },
        });
      });

      res.status(200).json({
        status: "Successfully Accepted Transaction",
      });
    } catch (err) {
      return res.status(200).json({
        status: "error",
        details: "Could not update Inventory",
      });
    }
  } else if (action === "Rejected") {
    try {
      await prisma.transactions.update({
        where: {
          id: requestID,
        },
        data: {
          status: "Rejected",
        },
      });
      res.status(200).json({
        status: "Successfully Rejected Transaction",
      });
    } catch (err) {
      return res.status(200).json({
        status: "error",
        details: "Transaction Failed",
      });
    }
  }
});

router.get("/alltransactions", grantAccess("admin"), async function (req, res) {
  try {
    const transactions = await prisma.transactions.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            dept: true,
          },
        },
      },
    });
    res.status(200).json({
      transactions: transactions,
    });
  } catch (err) {
    return res.json({
      status: "error",
      details: "Failed to Reterive Data",
    });
  }
});

router.get(
  "/viewtransaction/:id",
  grantAccess("admin"),
  async function (req, res) {
    const id = req.params.id;
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

router.get("/viewitem/:id", grantAccess("admin"), async function (req, res) {
  // TODO Have to include Send File

  var id = req.params.id;
  console.log(id);
  try {
    const item = await prisma.inventory.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({
      status: "Success",
      item: item,
    });
  } catch (err) {
    return res.json({
      status: "error",
      details: "Failed to Reterive Data",
    });
  }
});

router.get("/viewinventory", grantAccess("admin"), async function (req, res) {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    res.status(200).json({
      inventory: inventory,
    });
  } catch (err) {
    return res.json({
      status: "error",
      details: "Failed to Reterive Data",
    });
  }
});

//EDIT ITEM
router.post("/edititem", upload.single("newbill"), async function (req, res) {
  const change = JSON.parse(req.body.change);
  const bill_file = req.file;
  console.log(change[0].itemID);
  console.log(bill_file);
  var date_now = new Date();
  let dd = String(date_now.getDate()).padStart(2, "0");
  let mm = String(date_now.getMonth() + 1).padStart(2, "0");
  let yy = date_now.getFullYear();
  let timestamp = dd + "-" + mm + "-" + yy + "";
  try {
    const oldbill = await prisma.inventory.findUnique({
      where: {
        id: parseInt(change[0].itemID),
      },
      select: {
        bill: true,
      },
    });

    const billObject = oldbill.bill;
    console.log(billObject);

    if (bill_file.mimetype !== "application/pdf") {
      await imagesToPdf(
        [`./static/images/${bill_file.filename}`],
        `./static/bills/${bill_file.originalname}-${bill_file.fieldname}-${timestamp}.pdf`
      );
    }

    var length = parseInt(billObject.length);
    var nextlength = length + 1;
    var name = "bill" + nextlength;
    billObject.push({
      [name]: `${bill_file.originalname}-${bill_file.fieldname}-${timestamp}.pdf`,
    });
    console.log(billObject);

    const updateditem = await prisma.inventory.update({
      where: {
        id: parseInt(change[0].itemID),
      },
      data: {
        quantity: parseInt(change[0].newquantity),
        bill: billObject,
      },
    });

    res.status(200).json({
      status: "Successfully edited item",
      inventory: updateditem,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: "error",
      details: "Failed to Edit Item",
    });
  }
});

router.post("/edit-prodCustomID", async function (req, res) {
  try {
    const { itemID, prodCustomID } = req.body;
    const updateditem = await prisma.inventory.update({
      where: {
        id: parseInt(itemID),
      },
      data: {
        prodCustomID: prodCustomID,
      },
    });
    res.status(200).json({
      status: "Updated prodCustomID",
      item: updateditem,
    });
  } catch (err) {
    return res.json({
      status: "error",
      details: "Failed to Edit",
    });
  }
});

//REPORT
router.post("/report", async function (req, res) {
  const { from_date, to_date } = req.body;
  //const from_date = "2020-01-01"
  //const to_date = "2025-01-01"
  const transaction_data = await prisma.transactions.findMany({
    where: {
      AND: [
        {
          updatedAt: {
            gte: new Date(from_date),
            lte: new Date(to_date),
          },
        },
        {
          status: {
            equals: "Accepted",
          },
        },
      ],
    },
    select: {
      title: true,
      user_id: true,
      assigned_items: true,
      user: {
        select: {
          dept: true,
        },
      },
    },
  });
  let data = {
    transaction: transaction_data,
    fromdate: from_date,
    todate: to_date,
  };
  let options = {
    convertTo: "pdf",
  };
  var timestamp = new Date().toISOString().replace(/[-:.]/g, "");

  carbone.render("./template.odt", data, options, (err, ress) => {
    if (err) {
      return console.log(err);
    }
    // fs is used to create the PDF file from the render result
    var paths = `./static/reports/report-${timestamp}.pdf`;
    fs.writeFileSync(paths, ress);
    /*res.sendFile(
      path.join(__dirname, "..", "static", "reports", `report-${timestamp}.pdf`)
    );*/
    res.status(200).json({
      status: "Success",
      report_filename: `report-${timestamp}.pdf`,
    });
  });
});

router.get("/getfiles/:type/:name", async function (req, res) {
  var type = req.params.type;
  var name = req.params.name;
  var ext = name.substr(name.lastIndexOf(".") + 1);
  if (type === "bills" && (ext === "jpg" || ext === "jpeg" || ext === "png"))
    type = "images";

  console.log(type);
  console.log(name);
  res.sendFile(path.join(__dirname, "..", "static", type, name));
});

router.post(
  "/resetclientpassword",
  grantAccess("admin"),
  async function (req, res) {
    try {
      console.log(req.body);
      const { userID } = req.body;

      const password = "123456789";
      const encryptedPassword = await bcrypt.hash(password, 10);

      await prisma.users.update({
        where: {
          user_id: parseInt(userID),
        },
        data: {
          password: encryptedPassword,
        },
      });
      res.status(200).json({
        status: "Success",
      });
    } catch (err) {
      console.log(err);
      res.status(200).json({
        status: "Reset Failed",
      });
    }
  }
);

router.post("/return-item", async function (req, res) {
  try {
    const { requestID, itemID, quantity } = req.body;
    
    const transaction = await prisma.transactions.findUnique({
      where: {
        id: requestID,
      },
      select: {
        assigned_items: true,
      },
    });
    const itemo = await prisma.inventory.findUnique({
      where: {
        id: itemID,
      },
      select: {
        quantity: true,
      },
    });
    let newquantity = parseInt(itemo.quantity) + parseInt(quantity);
    let neww = 0
    var items = transaction.assigned_items
    var item = items.find(x => x.id == itemID);
    if (item) {
      if(quantity <= item.quantity)
      {
      item.quantity = item.quantity - quantity;
      neww = item.quantity+quantity
      }
      else{
        item.quantity=item.quantity
        quantity=0
      }
    }
    await prisma.transactions.update({
      where: {
        id: requestID,
      },
      data: {
        assigned_items: items,
      }
    })

    await prisma.inventory.update({
      where: {
        id: parseInt(itemID),
      },
      data: {
        quantity: parseInt(newquantity),

      },
    });
    res.status(200).json({
      status: "Successfully Returned",
      new: newquantity,
      quantity: item.quantity,
    });
  } catch (err) {
    return res.status(200).json({
      status: "error",
      details: "Could not Return Item",
    });
  }
});





router.post("/deleteitem", grantAccess("admin"), async function (req, res) {
  const { requestID } = req.body;
  try {
    const deleteItem = await prisma.inventory.delete({
      where: {
        id: parseInt(requestID),
      },
    });
    res.status(200).json({
      status: "Deleted Item",
      item: deleteItem,
    });
  } catch (err) {
    return res.json({
      status: "error",
      details: "Failed to Delete",
    });
  }
});

/*
Need to add try and catch block so that email is triggred only when adding user is successful
var send_mail = require("./mail.js");
send_mail.data.sendMail("email", "password"); //Change to email and pass of the user being added later.
*/
module.exports = router;
