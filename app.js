const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const userRouter = require("./router/userRouter");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", userRouter);
app.use("/user", userRouter);

app.listen(3000,()=>{
    console.log('Server is Running on 3000')
});