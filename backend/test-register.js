async function testRegister() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Test1234',
        role: 'student'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful:', data);
    } else {
      console.error('❌ Registration failed:', {
        status: response.status,
        message: data.message,
        error: data.error,
        details: data.details
      });
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testRegister();
