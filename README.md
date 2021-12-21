<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->
# Gift Inventory system - Backend

Written in Javascript using ExpressJS, Prisma and MySQL for database.

Gift Inventory System or GIS in short is the system that governs the inventory system of mementos in New Horizon College of Engineering, India.


## Contents
- [Must Do](#must-do)
  - [Before starting RUN](#before-starting-run)
  - [During every run](#during-every-run)
- [Schema change workflow](#schema-change-workflow)
- [API Docs](#api-docs)
  - [AUTH](#auth)
  - [ADDING USER](#adding-user)
  - [Reset Password](#reset-password)
  - [Add Items](#add-items)
  - [View All Users](#view-all-users)
  - [Edit Transaction Status / Assign Items](#edit-transaction-status--assign-items)
  - [View All Transactions](#view-all-transactions)
  - [View Particular Transaction](#view-particular-transaction)
- [File Structure](#file-structure)
- [Contributing to this project](#contributing-to-this-project)

<!-- /code_chunk_output -->
Backend for the Project
Specs: 
 ExpressJS
 REST API
 MySQL
 Prisma ORM



# Must Do
 ## Before starting RUN
 `npm install`
 then
 1. Install Mysql and edit your MySQL URI in the .env file as `mysql://{your mysql name}:{mysql password}@localhost:3306/backend_db`
 2. RUN `npx prisma migrate dev`
 3. Finally run `npm start` to start the server

 ## During every run
 1. pull first
 2. `npm install`
 3. RUN `npx prisma migrate dev`
 4. Finally run `npm start` to start the server

API folder is divided into 3 files
```
admin.js - write all endpoints related to admin here
client.js - endpoints for clients
auth.js - Login endpoint

```
To view database use `npx prisma studio`

# Schema change workflow

On change in the schema in `schema.prisma` file do the following
1. `npx prisma migrate dev --name {name of the change eg: bill_added}`
2. Commit and push the migration files
   
# API Docs
## AUTH

Sample login cred
email: admin@nhce.com
password: 123456789

email: hodcse@nhce.com
password: 123456789
```
/auth/login
```
Send Data in this format 
```
{
    email: Email Address,
    password: Password
}
```

On Successful Login Response is as follows
```
{
    "dept":"Admin",
    "email":"admin@nhce.com",
    "user_id":1,    
    "token": You recieve a JWT token with data which is explained in next block
}
```
JWT format
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MjgwNzEyODQsImV4cCI6MTYyODA3ODQ4NH0.5c1A-fVG6CWNWNPks-icbhO8MpDXZQeY8zc2KWMHu4I

Contains:

{
  "alg": "HS256",
  "typ": "JWT"
}

{
  "user_id": 1,
  "role": "admin",
  "iat": 1628071284,
  "exp": 1628078484
}
```
1. Store this JWT after you recieve it into LocalStorage of Browser.
2. Use it to render the Admin or Client UI based on the role in JWT.
3. To Decode the JWT use the key which is in .env folder.
4. Send the JWT along with ever API call.

---

## ADDING USER
```
/admin/adduser
```
Send Data in this format 
```
{
    email: String,
    dept: String,
    password: String
}
```
```
Application Headers 
"token: Send the JWT token that was stored in LocalStorage after login
(it contains the access credintials required and validity of the api call)"
```


On Successful Login Response is as follows
```
Status code 200
{
      user_id: Int,
      dept: String,
      email: String,
      status: "created",
}
```
Errors
1. No token sent
   ```
   Status code : 200

   return res.status(200).json({
        status: "error",
        details: "A token is required to call this api"
      });
   ```
2. Invalid Token
   ```
   Status code: 200
   
   return res.status(200).json({
          status: "error",
          details: "Invalid Token"
        });
   ```
   



Test query for backend
```
curl --header "token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MjgzNTE4MDMsImV4cCI6MTYyODM1OTAwM30.LFp-EXSm26EgMg8wKQiESX_JvoN6DeQcDjL4hUBBj_A" \
  --request POST \
  --data '{"email":"dev@nhce","dept":"v","password":"123456789"}' \
  http://localhost:3000/admin/adduser \
-H "Content-Type: application/json"

```

## Reset Password
```
/utils/resetpwd
```
Send Data in this format 
```
{
    old_password: String,
    new_password: String
}
+
JWT
```

On Successful Login Response is as follows
```
Status code : 200
{
  status: "success"
}
```
Errors
`Status: 200`
Invalid Request
   ```
    {
        status:"error",
        details:"Failed to update password"
    }
  ```

Incorrect Password
```
    {
        status:"error",
        details:"Incorrect Current Password"
    }
  ```


## Add Items
```
/admin/additem

```
POST

Should contain 

***highlighted ones are fieldnames and should be the same***

`items` = items[] 

`bill` = Field for Bill file (pdf)

`0` = Field for items[0]

`1` = Field for items[1]

.. = ...
and so on till nth element

1. Content-Type: multipart/form-data

2. Stringify JSON so it can be parsed back in server

3. Send `token` through Headers


```
{
  items:[
    {
      name: String,
      quantity: Int,
      class: String,
    }
    {
      name: String,
      quantity: Int,
      class: String,
    }

  ]

  bill: File Upload (pdf)
  0: image of 0th item in items[]
  1: image of 1st item in items[]
  .. and so on
}

```

Postman Query
![Postman Query](./postman.png "multipart")

cURL Query
```
curl \
--header "token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2Mjk1NTEzNjQsImV4cCI6MTYyOTU1ODU2NH0.iv67-prINrJ3kffXtdHrCAHUYmgdd8Kim9t0mq0pQGM" \
-F "bill=@/home/dp/Desktop/Maybill.pdf" \
-F "0=@/home/dp/Desktop/Cupimg.png" \
-F "1=@/home/dp/Desktop/Bookimg.png" \
-F "items=[{\"name\":\"Cups\",\"quantity\":2,\"class\":\"A\"},{\"name\":\"Books\",\"quantity\":2,\"class\":\"B\"}]" \
localhost:3000/admin/additem
```

Successful Response
```
status: success
data: Contains added data with generated itemid and doc names
```
Error
```
Invalid
```


## View All Users
`/admin/allusers`

GET
Response
```
{
    dept: string;
    email_id: string;
}[]
```


## Edit Transaction Status / Assign Items

`/admin//edit-transaction-status`

Request
```
    [{
        requestID: AlphaNumber,
        action: "Accepted" / "Rejected",
        items: [{
            itemID: AlphaNumber,
            quantity: Number,
            name: Item Name,
            class: Class name
    }]
```


## View All Transactions

GET
`/admin/alltransactions`

Sends all the transaction data in descending order of created date and time



## View Particular Transaction

GET

`/admin/viewtransaction`

Request
```
{
  id: Transaction ID
}
```

Returns all the transaction data for that is

## File Structure


## Contributing to this project




