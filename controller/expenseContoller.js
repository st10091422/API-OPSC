const { Expense, Category } = require('../config')


const getAllExpenses = async (req, res) => {
    const { id } = req.params
    console.log(`this is the id: ${id}`)
    try {
        const snapshot = await Expense
        .where('userid', '==', id)
        .get();
        
        const expenses = snapshot.docs
            .map(doc => { 
                const data = doc.data(); // Access the nested `data` object
                console.log(`Transaction data: ${JSON.stringify(data)}`);
                return { id: doc.id, ...data }; 
            });

        if (snapshot.length === 0) {
            console.log('No matching transactions.');
            return res.status(200).json({ transactions: [] });
        }
        
        const transactionsWithCategory = [];

        // Iterate through each transaction to get the associated category
        for (const transaction of expenses) {
            const categoryId = transaction.categoryid;
            console.log(`Processing transaction with id ${transaction.id} and categoryid ${categoryId}`);

            if (categoryId) {
                const categorySnapshot = await Category.doc(categoryId).get();

                if (categorySnapshot.exists) {
                    const category = categorySnapshot.data();
                    console.log(`Found category: ${JSON.stringify(category)}`);

                    transactionsWithCategory.push({
                        transactionId: transaction.id,
                        ...transaction,
                        categoryId: categorySnapshot.id,
                        category: category
                    });
                } else {
                    console.log(`No matching category found for categoryId: ${categoryId}`);
                }
            } else {
                console.log(`No categoryId found in transaction: ${transaction.id}`);
            }
        }

        console.log(transactionsWithCategory);
        res.status(200).json(transactionsWithCategory);
    
    } catch (error) {
        console.error('Error getting Expenses:', error);
        res.status(500).json({ error: 'Failed to fetch Expenses' });
    }
}


const addExpense = async (req, res) =>{
    const {
        date,
        categoryid, 
        amount,
        title,
        description,
        userid
    } = req.body;  

    const createdAt = Date.now()

    try { 
        const newExpense = {
            date: date,
            categoryid: categoryid,
            amount: amount,
            title: title,
            description: description,
            userid: userid,
            createdAt: createdAt
        }
        await Expense.add( newExpense );
        //res.status(201).json({ message: 'Goal created successfully.' });
        res.send({ msg: "Expense Added" });
    } catch (error) {
        console.error('Error creating Expense:', error);
        res.status(500).json({ error: 'Failed to create Expense' });
    }
}

const updateExpense = async (req, res) =>{
    const { id } = req.params;
    const { 
        date,
        categoryid, 
        amount,
        title,
        description
     } = req.body;
    const updatedAt = Date.now()

    const updatedExpense = {
        date: date,
        categoryid: categoryid,
        amount: amount,
        title: title,
        description: description,
        updatedAt: updatedAt
    };
    
    try {
        const expenseRef = await Expense.doc(id);
        await expenseRef.update( updatedExpense );
        res.status(200).json({ message: 'Expense updated successfully.' });
    } catch (error) {
        console.error('Error updating Expense:', error);
        res.status(500).json({ error: 'Failed to update Expense' });
    }
}


const deleteExpense = async (req, res) =>{
    const { id } = req.params;
    try {
        const expenseRef = Expense.doc(id);
        await expenseRef.delete();
        res.status(200).json({ message: 'Expense deleted successfully.' });
    } catch (error) {
        console.error('Error deleting Expense:', error);
        res.status(500).json({ error: 'Failed to delete Expense' });
    }
}


module.exports = { getAllExpenses, addExpense, updateExpense, deleteExpense }