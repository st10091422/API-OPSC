const { admin, auth, User } = require('../config')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email field is provided
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Sign in the user with Firebase Authentication using email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const userData = userCredential.user;

        // Fetch user details from Firestore based on the user ID (uid)
        const userDoc = await User.doc(userData.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userDoc.data();

        // Create a JWT payload with the user's UID and email
        const payload = {
            uid: userData.uid,
            email: userData.email
        };

        // Sign a JWT with a 3-day expiration
        //const token = jwt.sign(payload, process.env.JWT_SEC, { expiresIn: '3d' });

        res.status(200).json({
            ///token: token,
            id: userData.uid,
            username: user.username,
            email: user.email,
        });

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to log in user' });
    }
};


const register = async (req, res) => {
    const { username, email, password } = req.body;
    const createdAt = Date.now();
    
    try {
        // Check if a user with the provided email already exists
        const existingUser = await admin.auth().getUserByEmail(email);
        
        if (existingUser) {
            // If the user already exists, send a conflict error
            return res.status(409).json({ message: 'Email is already in use' });
        }
    } catch (error) {
        // If the error is not 'user-not-found', throw the error
        if (error.code !== 'auth/user-not-found') {
            console.error('Error checking existing user:', error);
            return res.status(500).json({ message: 'Something went wrong...' });
        }
    }

    try {
        // Create the user since no existing email was found
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: username
        });

        await User.doc(userRecord.uid).set({
            username: username,
            email: email,
            createdAt: createdAt
        });

        res.status(200).json({ message: 'User registration successful', id: userRecord.uid });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

const registerWithSSO = async (req, res) => {
    const { username, email } = req.body; // Data returned from SSO provider
    const createdAt = Date.now();

    try {
        // Check if a user with this email already exists
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log('User already exists:', userRecord.uid);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // User doesn't exist, create a new one
                userRecord = await admin.auth().createUser({
                    email: email,
                    displayName: username, // SSO-provided username
                });
                console.log('Created new user:', userRecord.uid);
            } else {
                // Handle other potential errors from getUserByEmail
                throw error;
            }
        }

        await User.doc(userRecord.uid).set({
            username: username,
            email: email,
            createdAt: createdAt,   
            phoneNumber: '', 
            dateOfBirth: ''
        });
        

        // Return a success response with user details
        res.status(200).json({
            message: "User signed up with SSO successfully",
            id: userRecord.uid,
            username: userRecord.displayName,
            email: userRecord.email
        });
    } catch (error) {
        console.error('Error during SSO signup:', error);
        res.status(500).json({ error: 'Failed to sign up with SSO' });
    }
};


const loginWithSSO = async (req, res) => { 
    const { email } = req.body;
    try {
        // Fetch the user document using the username
        const userSnapshot = await User.where('email', '==', email).get();

        if (userSnapshot.empty) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Assuming usernames are unique and there's only one user
        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();
        
        //console.log(userDoc.id); 

        // Sign in the user using email
        const userCredential = await admin.auth().getUserByEmail(user.email);

        const payload = {
            uid: userDoc.id,  // Firestore user document ID
            email: userCredential.email // Email from Firebase UserRecord
        };

        // Sign a JWT with a 3-day expiration
        const token = jwt.sign(payload, process.env.JWT_SEC, { expiresIn: '3d' });

        res.status(200).json({
            message: "User signed in successfully",
            id: userDoc.id,
            username: user.username,
            email: user.email,
            token: token
        });
    } catch (error) { 
        console.error('Error signing in user:', error);
        res.status(401).json({ error: 'Invalid username or password' });
    }
}


const updateUser = async (req, res) => {
    const {id} = req.params
    const { username, email } = req.body
    const updatedAt = Date.now()
    try {
        await admin.auth().updateUser(id, {
            email: email,
            displayName: username,
          });
      
          // Update the username in your Firestore database
          await User.doc(id).update({
            email: email,
            username: username,
            updatedAt: updatedAt
          });

          res.status(200).json({ 
            message: 'Email and username updated successfully.',
            username: username,
            email: email,
         });
    } catch (error) {
        console.log('Error updating Expense:', error)
        res.status(500).json({ error: 'Invalid username or password' });
    }
}


const deleteUser = async (req, res) =>{
    
}


module.exports = { register, login, registerWithSSO, loginWithSSO, updateUser, deleteUser}