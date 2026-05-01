const AppError = require('../utils/AppError');

let users = [
    { id: 1, name: "Nasim" },
    { id: 2, name: "John" }
];

// GET users
exports.getUsers = (req, res, next) => {
    res.status(200).json({
        status: "success",
        data: users
    });
};

// GET single user
exports.getUser = (req, res, next) => {
    const user = users.find(u => u.id === parseInt(req.params.id));

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: user
    });
};

// CREATE user
exports.createUser = (req, res, next) => {
    const { name } = req.body;

    if (!name) {
        return next(new AppError("Name is required", 400));
    }

    const newUser = {
        id: users.length + 1,
        name
    };

    users.push(newUser);

    res.status(201).json({
        status: "success",
        data: newUser
    });
};

// DELETE user
exports.deleteUser = (req, res, next) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));

    if (index === -1) {
        return next(new AppError("User not found", 404));
    }

    users.splice(index, 1);

    res.status(204).json({
        status: "success",
        message: "User deleted"
    });
};