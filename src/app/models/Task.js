const { Schema, model } = require("mongoose");

const TaskSchema = new Schema({
  title: {
    type: String,
    require: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    require: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/*
title: String
assignedTo: UserId
*/

const Task = model("Task", TaskSchema);
module.exports = Task;
