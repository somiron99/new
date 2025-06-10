const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB (local)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// User schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', userSchema);

// Signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    try {
        const user = new User({ username, password: hashed });
        await user.save();
        res.json({ message: 'Signup successful' });
    } catch (e) {
        res.status(400).json({ error: 'User already exists' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    // Create a token (for real apps, use a secret from env)
    const token = jwt.sign({ username }, process.env.JWT_SECRET);
    res.json({ message: 'Login successful', token });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));