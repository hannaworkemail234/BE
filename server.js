const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Middleware
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
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

// POST API - Add a new product
app.post('/api/products', (req, res) => {
  try {
    const { name, price, quantity } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || price === undefined || quantity === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: name, price, quantity'
      });
    }

    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    if (!Number.isInteger(numericQuantity) || numericQuantity < 0) {
      return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const newProduct = {
      id: products.reduce((max, product) => Math.max(max, product.id), 0) + 1,
      name: name.trim(),
      price: numericPrice,
      quantity: numericQuantity,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

    res.status(201).json({
      message: 'Product added successfully',
      data: newProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save product data' });
  }
});

// GET API - Retrieve all products
app.get('/api/products', (req, res) => {
  try {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    res.status(200).json({
      message: 'Products retrieved successfully',
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read product data' });
  }
});

// GET API - Retrieve product IDs and details
app.get('/api/products/ids', (req, res) => {
  try {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const productDetails = products.map(({ id, name, price, quantity }) => ({
      id,
      name,
      price,
      quantity
    }));

    res.status(200).json({
      message: 'Product IDs retrieved successfully',
      count: productDetails.length,
      data: productDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read product data' });
  }
});

// GET API - Retrieve product details by ID (must stay after /api/products/ids)
app.get('/api/products/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID must be an integer' });
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const product = products.find((item) => item.id === id);
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${id} not found` });
    }

    res.status(200).json({
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read product data' });
  }
});

// PUT API - Update product details by ID
app.put('/api/products/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID must be an integer' });
    }

    const { name, price, quantity } = req.body || {};
    if (name === undefined && price === undefined && quantity === undefined) {
      return res.status(400).json({
        error: 'Provide at least one field to update: name, price, quantity'
      });
    }
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    const numericPrice = price === undefined ? undefined : Number(price);
    if (numericPrice !== undefined && (!Number.isFinite(numericPrice) || numericPrice < 0)) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    const numericQuantity = quantity === undefined ? undefined : Number(quantity);
    if (numericQuantity !== undefined && (!Number.isInteger(numericQuantity) || numericQuantity < 0)) {
      return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) {
      return res.status(404).json({ error: `Product with ID ${id} not found` });
    }

    const product = products[index];
    if (name !== undefined) product.name = name.trim();
    if (numericPrice !== undefined) product.price = numericPrice;
    if (numericQuantity !== undefined) product.quantity = numericQuantity;
    product.updatedAt = new Date().toISOString();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

    res.status(200).json({
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product data' });
  }
});

// DELETE API - Delete product by ID
app.delete('/api/products/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID must be an integer' });
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) {
      return res.status(404).json({ error: `Product with ID ${id} not found` });
    }

    const [deleted] = products.splice(index, 1);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    res.status(200).json({
      message: 'Product deleted successfully',
      data: deleted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product data' });
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
  console.log(`✓ POST /api/products - Add new product`);
  console.log(`✓ GET /api/products - Get all products`);
  console.log(`✓ GET /api/products/ids - Get product IDs and details`);
  console.log(`✓ GET /api/products/:id - Get product by ID`);
  console.log(`✓ PUT /api/products/:id - Update product by ID`);
  console.log(`✓ DELETE /api/products/:id - Delete product by ID`);
});
