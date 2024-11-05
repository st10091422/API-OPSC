const { Transaction, Category, db} = require('../config')

const getAllTransactions = async (req, res) => {
    const { id } = req.params
    console.log(`this is the id: ${id}`)
    try {
        const snapshot = await Transaction
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

const syncTransactions = async (req, res) =>{
    const transactions = req.body.transactions; // Expecting an array of category objects

    const batch = db.batch()

    const firebaseTransactionIds = [];

    console.log(`transactions: ${transactions}`);
    
    if (!transactions || !Array.isArray(transactions)) {
        return res.status(400).json({ success: false, message: 'Invalid input. Expected an array of categories.' });
    }
    try {
        // Perform batch write in Firebase
        transactions.forEach(transaction => {
            const newTransactionRef = Transaction.doc(); // Create a new document reference
            batch.set(newTransactionRef, {
                date: transaction.date,
                categoryid: transaction.categoryid,
                amount: transaction.amount,
                title: transaction.title,
                description: transaction.description,
                userid: transaction.userid,
                type: transaction.transactionType,
                createdAt: Date.now()
            });

            firebaseTransactionIds.push({ localId: transaction.id, firebaseId: newTransactionRef.id });

        });

        await batch.commit(); // Commit the batch operation
        console.log('transaction sync successful')
        res.status(201).json({ 
            message: `${transactions.length} transactions added successfully.`,
            ids: firebaseTransactionIds  });
    } catch (error) {
        console.error('An error has occured while syncing transactions:', error)
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { syncTransactions, getAllTransactions }