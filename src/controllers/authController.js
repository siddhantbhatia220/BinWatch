const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).send({ message: "User already exists" });
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        let userRole = 'user';
        if (email === process.env.ADMIN_EMAIL) {
            userRole = 'admin';
        }
        
        user = new User({ email, password: hashedPassword, role: userRole });
        await user.save();
        console.log('New user registered:', email, 'Role:', userRole);
        res.status(201).send({ message: "User created!" });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).send({ message: "Server error", error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send({ message: "Invalid email or password" });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send({ message: "Invalid email or password" });
        
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );
        console.log('User logged in:', email);
        res.send({ token });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).send({ message: "Server error", error: err.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId; 
        const saltRounds = 10; 

        if (!currentPassword || !newPassword) {
            return res.status(400).send({ message: "Both current and new passwords are required." });
        }
        if (newPassword.length < 6) {
             return res.status(400).send({ message: "New password must be at least 6 characters long." });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Invalid current password." });
        }

        const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = newHashedPassword;
        await user.save();

        console.log(`Password changed successfully for user: ${user.email}`);
        res.status(200).send({ message: "Password updated successfully!" });
    } catch (err) {
        console.error("Change Password Error:", err);
        res.status(500).send({ message: "Server error" });
    }
};

module.exports = { register, login, changePassword };
