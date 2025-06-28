const User = require('../models/user');
const generateUserId = require('../utils/generateUserId');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, division } = req.body;
    const userId = generateUserId(role);
    const newUser = new User({ name, email, password, role, division: role === 'user' ? null : division, userId });
    await newUser.save();
    await sendMail(email, 'Welcome to Maintenance Portal', `Hello ${name}, Your USER ID is: ${userId}`);
    res.status(201).json({ message: 'User created, check email for USER ID.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Signup failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'Invalid User ID' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid Password' });
    const token = jwt.sign({ userId: user.userId, role: user.role, id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user: { role: user.role, name: user.name, userId: user.userId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // The 'authenticate' middleware has already found the user and attached it to req.user
    // If authenticate middleware selected '-password', it's already safe.
    // Otherwise, ensure password is not sent.
    const user = req.user; // req.user already holds the user document

    if (!user) {
      // This case should ideally be caught by the authenticate middleware
      return res.status(404).json({ message: 'User profile not found after authentication' });
    }

    // Create a new object to send, explicitly excluding the password
    const profileData = {
        _id: user._id,
        name: user.name,
        userId: user.userId, // Ensure this matches your model field name
        email: user.email,
        role: user.role,
        division: user.division // Include division if applicable
        // Add any other fields you want to expose
    };

    res.status(200).json(profileData); // Send the user profile data
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};
