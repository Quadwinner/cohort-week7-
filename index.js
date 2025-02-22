const bcrypt = require("bcrypt");
const express = require("express");
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require('body-parser');

const JWT_SECRET = "mynmaeisshubham ";

mongoose.connect("mongodb+srv://shubhamkush0123:aBW6uW9FUUqbbZ86@cluster0.obpzn.mongodb.net/todo-shubham");
const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());

app.post("/signup", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hasedPassword = await bcrypt.hash(password, 5);
    console.log(hasedPassword);

    await UserModel.create({
        email: email,
        password: hasedPassword,
        name: name
    });
    res.json({
        message: "User signed up successfully"
    });
});

app.post("/signin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email: email,
        
    });
    console.log(response);

    if (!response) {
        res.status(403).json({
            message: "user in not exist in the database"
        });
        return;
    }

    const passwordMatch = await bcrypt.compare(password, response.password);

    if (passwordMatch) {
        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_SECRET);
        res.json({
            token: token,
            message: 'Signed in successfully'
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
        userId: userId,
        message: 'Todo created successfully'
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
