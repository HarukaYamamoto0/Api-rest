const { Router } = require("express");
const authMiddleware = require("../middlewares/auth");
const Project = require("../models/Project");
const Task = require("../models/Task");

const router = Router();
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
    
    if (!title || !description)
      return res.status(400).send({ error: "To create a project you need a title and description." });
    
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
    const { title, description } = req.body;
    
    const project = await Project.findOne({ _id: req.params.projectId.trim() });
    
    if (!project)
      return res.status(400).send({ error: "Project not found" });
    
    project.title = title || project.title;
    project.description = description || project.description;
    
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
    await Project.findByIdAndDelete(req.params.projectId.trim());
    await Task.deleteMany({ project: req.params.projectId.trim() });
    
    return res.send({ message: "Project deleted successfully" });
  } catch (err) {
    return res.status(400).send({ error: "Error deleting project, try again" });
  }
});


module.exports = app => app.use("/projects", router);
