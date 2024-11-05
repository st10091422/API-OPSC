const router = require('express').Router();
const { getAllExpenses, addExpense, updateExpense, deleteExpense } =  require('../controller/expenseContoller')

router.get('/:id', getAllExpenses);

router.post('/', addExpense);

router.put('/:id', updateExpense);

router.delete('/:id', deleteExpense);

module.exports = router;