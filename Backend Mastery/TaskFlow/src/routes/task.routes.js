import { Router } from 'express';
const router = Router();
import { createTask, getAllTasks, getTask, updateTask, deleteTask } from '../controllers/taskController';
import { single } from '../config/multer';


router.post('/', single('image'), createTask);
router.get('/', getAllTasks);
router.get('/:id', getTask);
router.patch('/:id', single('image'), updateTask);
router.delete('/:id', deleteTask);

export default router;