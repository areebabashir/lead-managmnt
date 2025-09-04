import express from 'express';
import {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    getTasksByBoard,
    moveTask,
    addComment,
    addChecklistItem,
    completeChecklistItem,
    updateStatus,
    getTasksByUser,
    getOverdueTasks,
    getTasksDueToday,
    addAttachment,
    getTaskStats,
    getTaskTemplates,
    createTaskFromTemplate,
    bulkUpdateTasks,
    getTaskActivity
} from '../controllers/taskController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireSignIn);

// Task CRUD operations
router.post('/', createTask); // Also support POST /tasks for frontend compatibility
router.post('/create', createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Board and workflow management
router.get('/board/:boardName', getTasksByBoard);
router.put('/:id/move', moveTask);

// Task collaboration
router.post('/:id/comments', addComment);
router.post('/:id/checklist', addChecklistItem);
router.put('/:id/checklist/:itemIndex/complete', completeChecklistItem);
router.put('/:id/status', updateStatus);
router.put('/:id/priority', updateTask); // Update priority
router.put('/:id/assign', updateTask); // Assign task
router.post('/:id/attachments', addAttachment);

// Task queries and filters
router.get('/user/:userId?', getTasksByUser);
router.get('/overdue/all', getOverdueTasks);
router.get('/due/today', getTasksDueToday);

// Additional routes for frontend compatibility
router.get('/my-tasks', getTasksByUser);
router.get('/overdue', getOverdueTasks);
router.get('/due-today', getTasksDueToday);
router.get('/stats', getTaskStats);
router.get('/templates', getTaskTemplates);
router.post('/templates/:templateId/create', createTaskFromTemplate);
router.patch('/bulk-update', bulkUpdateTasks);
router.get('/:id/activity', getTaskActivity);

export default router;
