import Task from '../models/taskModel.js';
import { hasPermission } from '../helpers/permissionHelper.js';

// Create new task
export const createTask = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'create')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot create tasks'
            });
        }

        const taskData = {
            ...req.body,
            createdBy: req.user._id
        };

        // Set default position if not provided
        if (!taskData.position) {
            const lastTask = await Task.findOne({ 
                board: taskData.board, 
                column: taskData.column 
            }).sort({ position: -1 });
            taskData.position = lastTask ? lastTask.position + 1 : 0;
        }

        const task = new Task(taskData);
        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('relatedContact', 'firstName lastName company')
            .populate('relatedDeal', 'name')
            .populate('relatedCampaign', 'name');

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: populatedTask
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating task',
            error: error.message
        });
    }
};

// Get all tasks with filtering and pagination
export const getTasks = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read tasks'
            });
        }

        const {
            page = 1,
            limit = 20,
            board,
            column,
            status,
            assignedTo,
            type,
            priority,
            dueDate,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { isActive: true };

        if (board) filter.board = board;
        if (column) filter.column = column;
        if (status) filter.status = status;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (type) filter.type = type;
        if (priority) filter.priority = priority;
        if (dueDate) {
            const date = new Date(dueDate);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            filter.dueDate = { $gte: date, $lt: nextDay };
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const tasks = await Task.find(filter)
            .populate('assignedTo', 'name email')
            .populate('relatedContact', 'firstName lastName company')
            .populate('relatedDeal', 'name')
            .populate('relatedCampaign', 'name')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(filter);

        res.json({
            success: true,
            data: tasks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
            error: error.message
        });
    }
};

// Get single task by ID
export const getTask = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read tasks'
            });
        }

        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('relatedContact', 'firstName lastName company')
            .populate('relatedDeal', 'name')
            .populate('relatedCampaign', 'name')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('dependencies.task', 'title status');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching task',
            error: error.message
        });
    }
};

// Update task
export const updateTask = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update tasks'
            });
        }

        const taskData = {
            ...req.body,
            updatedBy: req.user._id
        };

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            taskData,
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name email')
         .populate('relatedContact', 'firstName lastName company')
         .populate('relatedDeal', 'name')
         .populate('relatedCampaign', 'name');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating task',
            error: error.message
        });
    }
};

// Delete task (soft delete)
export const deleteTask = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'delete')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot delete tasks'
            });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { isActive: false, updatedBy: req.user._id },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
            error: error.message
        });
    }
};

// Get tasks by board (for drag-and-drop interface)
export const getTasksByBoard = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read tasks'
            });
        }

        const { boardName } = req.params;
        const tasks = await Task.getTasksByBoard(boardName);

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks by board:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks by board',
            error: error.message
        });
    }
};

// Move task to different column/position (drag-and-drop)
export const moveTask = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update tasks'
            });
        }

        const { newColumn, newPosition } = req.body;

        if (!newColumn || newPosition === undefined) {
            return res.status(400).json({
                success: false,
                message: 'New column and position are required'
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Update positions of other tasks in the new column
        if (newColumn !== task.column) {
            await Task.updateMany(
                { 
                    board: task.board, 
                    column: newColumn, 
                    position: { $gte: newPosition },
                    _id: { $ne: task._id }
                },
                { $inc: { position: 1 } }
            );
        }

        await task.moveToColumn(newColumn, newPosition);

        res.json({
            success: true,
            message: 'Task moved successfully',
            data: task
        });
    } catch (error) {
        console.error('Error moving task:', error);
        res.status(500).json({
            success: false,
            message: 'Error moving task',
            error: error.message
        });
    }
};

// Add comment to task
export const addComment = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update tasks'
            });
        }

        const { content, attachments = [] } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        await task.addComment(content, req.user._id, attachments);

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: task
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

// Add checklist item
export const addChecklistItem = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update tasks'
            });
        }

        const { item } = req.body;

        if (!item) {
            return res.status(400).json({
                success: false,
                message: 'Checklist item is required'
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        await task.addChecklistItem(item);

        res.json({
            success: true,
            message: 'Checklist item added successfully',
            data: task
        });
    } catch (error) {
        console.error('Error adding checklist item:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding checklist item',
            error: error.message
        });
    }
};

// Complete checklist item
export const completeChecklistItem = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update tasks'
            });
        }

        const { itemIndex } = req.params;

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        await task.completeChecklistItem(parseInt(itemIndex), req.user._id);

        res.json({
            success: true,
            message: 'Checklist item completed successfully',
            data: task
        });
    } catch (error) {
        console.error('Error completing checklist item:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing checklist item',
            error: error.message
        });
    }
};

// Update task status
export const updateStatus = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update tasks'
            });
        }

        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        await task.updateStatus(status, req.user._id);

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: task
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status',
            error: error.message
        });
    }
};

// Get tasks by user
export const getTasksByUser = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read tasks'
            });
        }

        const userId = req.params.userId || req.user._id;
        const tasks = await Task.getTasksByUser(userId);

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks by user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks by user',
            error: error.message
        });
    }
};

// Get overdue tasks
export const getOverdueTasks = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read tasks'
            });
        }

        const tasks = await Task.getOverdueTasks();

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching overdue tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching overdue tasks',
            error: error.message
        });
    }
};

// Get tasks due today
export const getTasksDueToday = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot read tasks'
            });
        }

        const tasks = await Task.getTasksDueToday();

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks due today:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks due today',
            error: error.message
        });
    }
};

// Add attachment to task
export const addAttachment = async (req, res) => {
    try {
        // Check permission
        if (!await hasPermission(req.user._id, 'tasks', 'update')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied: Cannot update tasks'
            });
        }

        const attachment = req.body;

        if (!attachment.filename || !attachment.url) {
            return res.status(400).json({
                success: false,
                message: 'Attachment filename and URL are required'
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        await task.addAttachment(attachment, req.user._id);

        res.json({
            success: true,
            message: 'Attachment added successfully',
            data: task
        });
    } catch (error) {
        console.error('Error adding attachment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding attachment',
            error: error.message
        });
    }
};
