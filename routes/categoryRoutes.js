const router = require('express').Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory, syncCategories } =  require('../controller/categoryController')

router.get('/:id', getAllCategories);

router.post('/', createCategory);

router.put('/:id', updateCategory);

router.delete('/:id',  deleteCategory);

router.post('/sync/data', syncCategories);


module.exports = router;