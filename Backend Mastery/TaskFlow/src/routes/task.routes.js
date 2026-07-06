import { Router } from 'express';
const router = Router();
import { createTask, getAllTasks, getTask, updateTask, deleteTask } from '../controllers/taskController';
import { upload } from '../config/cloudinary';   

router.post('/', upload.single('image'), createTask);
router.get('/', getAllTasks);
router.get('/:id', getTask);
router.patch('/:id', upload.single('image'), updateTask);
router.delete('/:id', deleteTask);

export default router;