const { Category, db } = require('../config')


const getAllCategories = async (req, res) => {
    const { id } = req.params
    console.log(`this is the id: ${id}`)
    try {
        const snapshot = await Category
        .where('userid', '==', id)
        .get();
        
        const categories = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log(categories);
    
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
}

const createCategory = async (req, res) =>{
    const { icon, name, userid} = req.body;
    const createdAt = Date.now()

    const newCategory = {
        icon: icon,
        name: name,
        userid: userid,
        createdAt: createdAt
    }

    try { 
        await Category.add( newCategory );
        //res.status(201).json({ message: 'Category created successfully.' });
        res.send({ message: "Category Added" });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
}

const updateCategory = async (req, res) =>{
    const { id } = req.params;
    const { icon, name } = req.body;
    const updatedAt = Date.now()

    const updatedCategory = {
        ...(icon && { icon }),
        ...(name && { name }),
        updatedAt
    };
    
    try {
        const CategoryRef = await Category.doc(id);
        await CategoryRef.update( updatedCategory );
        res.status(200).json({ message: 'Category updated successfully.' });
    } catch (error) {
        console.error('Error updating Category:', error);
        res.status(500).json({ error: 'Failed to update Category' });
    }
}


const deleteCategory = async (req, res) =>{
    const { id } = req.params;
    try {
        const categoryRef = Category.doc(id);
        await categoryRef.delete();
        res.status(200).json({ message: 'Category deleted successfully.' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
}


const syncCategories = async (req, res) =>{
    const categories = req.body.categories; // Expecting an array of category objects

    const batch = db.batch()

    const firebaseCategoryIds = [];

    console.log(`categories: ${categories}`)
    if (!categories || !Array.isArray(categories)) {
        return res.status(400).json({ success: false, message: 'Invalid input. Expected an array of categories.' });
    }
    try {
        // Perform batch write in Firebase
        categories.forEach(category => {
            const newCategoryRef = Category.doc(); // Create a new document reference
            batch.set(newCategoryRef, {
                icon: category.icon,
                name: category.name,
                userid: category.userid,
                createdAt: Date.now()
            });

            firebaseCategoryIds.push({ localId: category.id, firebaseId: newCategoryRef.id });

        });

        await batch.commit(); // Commit the batch operation
        console.log('categories sync successful')
        res.status(201).json({ 
            message: `${categories.length} categories added successfully.`,
            ids: firebaseCategoryIds  });
    } catch (error) {
        console.error('An error has occured while syncing transactions:', error)
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory, syncCategories }