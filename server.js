const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// POST API - Add new person
app.post('/api/users', (req, res) => {
  try {
    const { name, age, address } = req.body;

    // Validation
    if (!name || !age || !address) {
      return res.status(400).json({
        error: 'Missing required fields: name, age, address'
      });
    }

    // Read existing data
    let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Create new user object
    const newUser = {
      id: data.reduce((max, u) => Math.max(max, u.id), 0) + 1,
      name,
      age: parseInt(age),
      address,
      createdAt: new Date().toISOString()
    };

    // Add to data array
    data.push(newUser);

    // Write back to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.status(201).json({
      message: 'User added successfully',
      data: newUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

// GET API - Retrieve all users
app.get('/api/users', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.status(200).json({
      message: 'Users retrieved successfully',
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read user data' });
  }
});

// GET API - Retrieve user IDs and identifying details
app.get('/api/users/ids', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const users = data.map(({ id, name, age, address }) => ({
      id,
      name,
      age,
      address
    }));

    res.status(200).json({
      message: 'User IDs retrieved successfully',
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read user data' });
  }
});

// GET API - Retrieve user details by ID (must stay after /api/users/ids)
app.get('/api/users/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID must be an integer' });
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const user = data.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read user data' });
  }
});

// PUT API - Update user details by ID (any of name, age, address)
app.put('/api/users/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID must be an integer' });
    }

    const { name, age, address } = req.body || {};
    if (name === undefined && age === undefined && address === undefined) {
      return res.status(400).json({
        error: 'Provide at least one field to update: name, age, address'
      });
    }

    if (age !== undefined && !Number.isInteger(Number(age))) {
      return res.status(400).json({ error: 'Age must be an integer' });
    }
    if ((name !== undefined && !name) || (address !== undefined && !address)) {
      return res.status(400).json({ error: 'Name and address cannot be empty' });
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const index = data.findIndex((u) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }

    const user = data[index];
    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = parseInt(age);
    if (address !== undefined) user.address = address;
    user.updatedAt = new Date().toISOString();

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.status(200).json({
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user data' });
  }
});

// DELETE API - Delete user by ID
app.delete('/api/users/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID must be an integer' });
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const index = data.findIndex((u) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }

    const [deleted] = data.splice(index, 1);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.status(200).json({
      message: 'User deleted successfully',
      data: deleted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user data' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server is running on http://localhost:${PORT}`);
  console.log(`✓ POST /api/users - Add new user`);
  console.log(`✓ GET /api/users - Get all users`);
  console.log(`✓ GET /api/users/ids - Get user IDs and details`);
  console.log(`✓ GET /api/users/:id - Get user by ID`);
  console.log(`✓ PUT /api/users/:id - Update user by ID`);
  console.log(`✓ DELETE /api/users/:id - Delete user by ID`);
});
