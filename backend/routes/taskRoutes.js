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
    addAttachment
} from '../controllers/taskController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireSignIn);

// Task CRUD operations
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
router.post('/:id/attachments', addAttachment);

// Task queries and filters
router.get('/user/:userId?', getTasksByUser);
router.get('/overdue/all', getOverdueTasks);
router.get('/due/today', getTasksDueToday);

export default router;
