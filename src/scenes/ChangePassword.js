import React, { useState } from 'react';
import axios from 'axios';

function ChangePassword() {
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('https://api.aktollpark.com/api/subpartner/change-password', {
        email,
        oldPassword,
        newPassword,
      });

      if (response.data.success) {
        setMessage('Password changed successfully!');
        setEmail('');
        setOldPassword('');
        setNewPassword('');
      } else {
        setMessage(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Error changing password');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Old Password:</label><br />
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>New Password:</label><br />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '20px', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>
      )}
    </div>
  );
}

export default ChangePassword;
