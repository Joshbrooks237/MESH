const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.post('/api/auth/login', (req, res) => {
  console.log('LOGIN REQUEST:', req.body);
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password123') {
    console.log('Login successful');
    return res.json({
      message: 'Login successful',
      user: { username: 'admin', role: 'admin' },
      token: 'test-token-123'
    });
  }

  console.log('Login failed');
  res.status(401).json({ error: 'Invalid credentials' });
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

