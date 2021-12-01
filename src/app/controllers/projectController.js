const express = require("express");
const authMiddleware = require("../middlewares/auth");

const Project = require("../models/Project");
const Task = require("../models/Task");

const router = express.Router();
router.use(authMiddleware);

// get all the projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate(["user", "tasks"]);

    return res.send({ projects });
  } catch (err) {
    return res.status(400).send({ error: "Error loading projects" });
  }
});

// take only one project
router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId.trim())
    .populate(["user", "tasks"]);
    
    if (!project)
      return res.status(400).send({ error: "Project not found" });
    
    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: "Error loading this project" });
  }
});

// create a new project
router.post("/", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;
    
    const project = await Project.create({ title, description, user: req.userId });
    
    if (Array.isArray(tasks))
      await Promise.all(tasks.map(async task => {
        const projectTask = new Task({ ...task, project: project._id });
        
        await projectTask.save();
        project.tasks.push(projectTask);
      }));
    
    await project.save();
    
    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: "Error creating project" });
  }
});

// update a project
router.post("/:projectId", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;
    
    const project = await Project.findByIdAndUpdate(req.params.projectId, {
      title,
      description
    }, { new: true });
    
    if (Array.isArray(tasks)) {
      project.tasks = [];
      await Task.deleteMany({ project: project._id });
      
      await Promise.all(tasks.map(async task => {
        const projectTask = new Task({ ...task, project: project._id });
        
        await projectTask.save();
        project.tasks.push(projectTask);
      }));
    }
    
    await project.save();
    
    return res.send({ project });
  } catch (err) {
    console.log(err)
    return res.status(400).send({ error: "Error updating project" });
  }
});

// delete a project
router.delete("/:projectId", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.projectId);
    await Task.deleteMany({ project: req.params.projectId });
    
    return res.send({ message: "Project deleted successfully" });
  } catch (err) {
    return res.status(400).send({ error: "Error deleting project, try again" });
  }
});


module.exports = app => app.use("/projects", router);
