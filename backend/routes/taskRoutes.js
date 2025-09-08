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
import { hasPermission, hasResourceAccess } from '../Middlewares/hasPermissionMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireSignIn);

// Task CRUD operations
router.post('/', hasPermission('tasks', 'create'), createTask); // Also support POST /tasks for frontend compatibility
router.post('/create', hasPermission('tasks', 'create'), createTask);
router.get('/', hasResourceAccess('tasks'), getTasks);
router.get('/:id', hasResourceAccess('tasks'), getTask);
router.put('/:id', hasPermission('tasks', 'update'), updateTask);
router.delete('/:id', hasPermission('tasks', 'delete'), deleteTask);

// Board and workflow management
router.get('/board/:boardName', hasResourceAccess('tasks'), getTasksByBoard);
router.put('/:id/move', hasPermission('tasks', 'update'), moveTask);

// Task collaboration
router.post('/:id/comments', hasPermission('tasks', 'update'), addComment);
router.post('/:id/checklist', hasPermission('tasks', 'update'), addChecklistItem);
router.put('/:id/checklist/:itemIndex/complete', hasPermission('tasks', 'update'), completeChecklistItem);
router.put('/:id/status', hasPermission('tasks', 'update'), updateStatus);
router.put('/:id/priority', hasPermission('tasks', 'update'), updateTask); // Update priority
router.put('/:id/assign', hasPermission('tasks', 'assign'), updateTask); // Assign task
router.post('/:id/attachments', hasPermission('tasks', 'update'), addAttachment);

// Task queries and filters
router.get('/user/:userId?', hasResourceAccess('tasks'), getTasksByUser);
router.get('/overdue/all', hasResourceAccess('tasks'), getOverdueTasks);
router.get('/due/today', hasResourceAccess('tasks'), getTasksDueToday);

// Additional routes for frontend compatibility
router.get('/my-tasks', hasResourceAccess('tasks'), getTasksByUser);
router.get('/overdue', hasResourceAccess('tasks'), getOverdueTasks);
router.get('/due-today', hasResourceAccess('tasks'), getTasksDueToday);
router.get('/stats', hasResourceAccess('tasks'), getTaskStats);
router.get('/templates', hasResourceAccess('tasks'), getTaskTemplates);
router.post('/templates/:templateId/create', hasPermission('tasks', 'create'), createTaskFromTemplate);
router.patch('/bulk-update', hasPermission('tasks', 'update'), bulkUpdateTasks);
router.get('/:id/activity', hasResourceAccess('tasks'), getTaskActivity);

export default router;
