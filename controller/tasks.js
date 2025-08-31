const { makeOpenWeatherApiCall } = require("../utils/openWhether");
const Task = require('../model/task');


const createTask = async (req, res, next) => {
    try {
        const { status, isOutdoor, description, title } = req.body;

        const requiredFields = ['isOutdoor', 'description', 'title'];
        const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null);

        if (missingFields.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: `${missingFields.join(", ")} ${missingFields.length > 1 ? 'fields' : 'field'} required`
            });
        }

        const task = await Task.create({
            title : title,
            description : description,
            status : "pending",
            isOutdoor : isOutdoor,
            user : req.user._id
        });

        res.status(201).json({status : 'success', message : 'Task created successfully', data : task})

    } catch (error) {
        console.log(error.message, 'errerer');
        next(error) 
    }
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      status: "success",
      message: "Tasks fetched successfully",
      data: tasks
    });
  } catch (error) {
    console.log(error.message, "getTasks error");
    next(error);
  }
};


const editTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { title, description, isOutdoor, status } = req.body;

    const task = await Task.findOne({ _id: taskId, user: req.user._id });
    if (!task) {
      return res.status(404).json({ status: "error", message: "Task not found" });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (isOutdoor !== undefined) task.isOutdoor = isOutdoor;

   if (status === "completed") {
    if (task.isOutdoor) {
      const weather = await makeOpenWeatherApiCall(req.user.city);

      if (Array.isArray(weather)) {
        const badWeather = weather.some(w =>
          ["Rain", "Thunderstorm", "Drizzle"].includes(w.main)
        );

        if (badWeather) {
          return res.status(400).json({
            status: "error",
            message: "Cannot complete outdoor task due to bad weather"
          });
        }
      } else {
        console.log("Weather API failed, skipping weather restriction:", weather);
        // optional: you can block completion here instead if assignment requires
      }
    }

    task.status = "completed";
    task.completedAt = new Date();
  }

    await task.save();

    res.status(200).json({
      status: "success",
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    console.log(error.message, "editTask error");
    next(error);
  }
};

const completeTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findOne({ _id: taskId, user: req.user._id });
    if (!task) {
      return res.status(404).json({ status: "error", message: "Task not found" });
    }

    if (task.status === "completed") {
      return res.status(400).json({ status: "error", message: "Task is already completed" });
    }

    if (task.isOutdoor) {
      const weather = await makeOpenWeatherApiCall(req.user.city);

      if (Array.isArray(weather)) {
        const badWeather = weather.some(w =>
          ["Rain", "Thunderstorm", "Drizzle"].includes(w.main)
        );

        if (badWeather) {
          return res.status(400).json({
            status: "error",
            message: "Cannot complete outdoor task due to bad weather"
          });
        }
      } else {
        console.log("Weather API failed, skipping restriction:", weather);
      }
    }

    task.status = "completed";
    task.completedAt = new Date();
    await task.save();

    res.status(200).json({
      status: "success",
      message: "Task marked as completed",
      data: task,
    });
  } catch (error) {
    console.log(error.message, "completeTask error");
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findOne({_id : taskId, user : req.user._id});

    if (!task) {
      return res.status(400).json({status : 'error', message : 'You can delete task created by you only'});
    }

    console.log(task.status , 'task.status');
    
    if (task.status!=='pending') {
      return res.status(400).json({status : 'error', message : 'only pending task can be deleted'});
    };

    await task.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Task deleted successfully",
      data: task
    });
  } catch (error) {
    console.log(error.message, "getTasks error");
    next(error);
  }
};

const getTasksSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [summary] = await Task.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          totals: [
            { $count: "totalTasks" }
          ],
          completed: [
            { $match: { status: "completed" } },
            {
              $group: {
                _id: null,
                completedTasks: { $sum: 1 },
                avgCompletionMs: {
                  $avg: { $subtract: ["$completedAt", "$createdAt"] }
                },
                outdoorCompleted: {
                  $sum: { $cond: ["$isOutdoor", 1, 0] }
                }
              }
            }
          ]
        }
      }
    ]);

    console.log(summary, 'this is summary');

    const totalTasks = summary?.totals[0]?.totalTasks || 0;
    const completedTasks = summary?.completed[0]?.completedTasks || 0;
    const avgHours = summary?.completed[0]?.avgCompletionMs
      ? Number((summary.completed[0].avgCompletionMs / (1000 * 60 * 60)).toFixed(2))
      : 0;
    const outdoorCompleted = summary?.completed[0]?.outdoorCompleted || 0;

    let suggestion = null;
    if (outdoorCompleted >= 5) {
      try {
        const weather = await makeOpenWeatherApiCall(req.user.city);
        const badWeather = Array.isArray(weather) && weather.some(w =>
          ['Rain', 'Thunderstorm', 'Drizzle'].includes(w.main)
        );
        if (badWeather) {
          suggestion = 'Try an indoor task next due to unpredictable weather.';
        }
      } catch (err) {
        console.log("Weather API failed, ignoring suggestion:", err.message);
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        totalTasks,
        completedTasks,
        averageCompletionTimeHours: avgHours,
        suggestion
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    createTask,
    getTasks,
    completeTask,
    deleteTask,
    editTask,
    getTasksSummary
}