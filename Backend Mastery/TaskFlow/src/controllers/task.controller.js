const Task = require('../models/Task');
const AppError = require('../utils/AppError'); // We'll create this next

// CREATE Task
exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// READ ALL Tasks
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      results: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// READ ONE Task
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE Task
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      return next(new AppError('Task not found', 404));
    }
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// DELETE Task
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return next(new AppError('Task not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};