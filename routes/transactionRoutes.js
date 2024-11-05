const router = require('express').Router();
const { syncTransactions, getAllTransactions } =  require('../controller/transactionController')

router.post('/sync', syncTransactions);

router.post('/:id', getAllTransactions);

module.exports = router;