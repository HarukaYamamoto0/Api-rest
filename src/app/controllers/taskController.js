const { Router } = require("express");
const authMiddleware = require("../middlewares/auth");
const Project = require("../models/Project");
const Task = require("../models/Task");

const router = Router();
router.use(authMiddleware);

// get all the tasks of a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) return res.status(400).send({ error: "Project not found" });

    const tasks = await Task.find({ project: req.params.projectId });

    return res.send({ tasks });
  } catch (err) {
    return res.status(400).send({ error: "Error loading tasks" });
  }
});

// get information from a task
router.get("/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) return res.status(400).send({ error: "Task not found" });

    return res.send({ task });
  } catch (err) {
    return res.status(400).send({ error: "Error loading task" });
  }
});

// edit a task
router.post("/:taskId", async (req, res) => {
  try {
    const { title, completed } = req.body;

    const task = await Task.findOne({ _id: req.params.taskId });

    if (!task) return res.status(400).send({ error: "Task not found" });

    task.title = title ?? task.title;
    task.completed = typeof completed !== "boolean"
      ? task.completed
      : completed;
    await task.save();

    return res.send({ task });
  } catch (err) {
    return res
      .status(400)
      .send({ error: "Error trying to edit the task, try again" });
  }
});

// create a task
router.post("/", async (req, res) => {
  const { title, project: projectId } = req.body;

  try {
    if (!title || !projectId)
      return res
        .status(400)
        .send({ error: "Parameters were not passed correctly" });

    const project = await Project.findById(projectId);

    if (!project) return res.status(400).send({ error: "Project not found" });

    const task = await Task.create({
      title,
      project: projectId,
      assignedTo: req.userId
    });

    project.tasks.push(task);
    await project.save();

    return res.send({ task });
  } catch (err) {
    return res.status(400).send({ error: "Error creating task" });
  }
});

// delete a task
router.delete("/:taskId", async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId });

    if (!task) return res.status(400).send({ error: "Taks not found" });

    const project = await Project.findOne({ _id: task.project });

    if (!project) return res.status(400).send({ error: "Project not found" });

    const newTasks = project.tasks.filter(
      id => id.toString() !== task._id.toString()
    );

    project.tasks = newTasks;
    await project.save();

    await Task.findByIdAndDelete(req.params.taskId);

    return res.send({ task });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .send({ error: "Error while trying to delete, try again" });
  }
});

module.exports = app => app.use("/tasks", router);
