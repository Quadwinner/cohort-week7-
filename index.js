const express = require("express");
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");

const JWT_SECRET = "mynmaeisshubham ";

mongoose.connect("mongodb+srv://shubhamkush0123:aBW6uW9FUUqbbZ86@cluster0.obpzn.mongodb.net/todo-shubham");
const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    await UserModel.create({
        email: email,
        password: password,
        name: name
    });
    res.json({
        message: "user created successfully"
    });
});

app.post("/signin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email: email,
        password: password
    });
    console.log(user);
    if (user) {
        const token = jwt.sign({
            id: user._id.toString()
        }, JWT_SECRET);
        res.json({
            token: token
        });
    } else {
        res.status(403).json({
            message: "invalid credentials"
        });
    }
});

app.post("/todo", auth, function (req, res) {
    const userId = req.userId;
    const title = req.body.title;
    TodoModel.create({
        title,
        userId
    });

    res.json({
        userId: userId
    });
});

app.get("/todos", auth, async function (req, res) {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    });

    res.json({
        todos
    });
});

function auth(req, res, next) {
    const token = req.headers.token;

    const decodedData = jwt.verify(token, JWT_SECRET);

    if (decodedData) {
        req.userId = decodedData.id;
        next();
    } else {
        res.status(403).json({
            message: "invalid token"
        });
    }
}

// Serve the index.html file
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'test', 'index.html'));
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
