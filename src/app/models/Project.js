const { Schema, model } = require("mongoose");

const ProjectSchema = new Schema({
  title: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true
  },
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: "Task",
    require: false
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/*
title: String
description: String
*/

const Project = model("Project", ProjectSchema);
module.exports = Project;
