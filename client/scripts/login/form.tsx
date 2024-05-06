import React, { useState } from 'react';
import { Cube } from '../ui/widgets/cube.tsx';
import { LoginBackground } from './bg.tsx';
import { MonotoneBg } from './monotone.tsx';

const LoginForm = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      if (!password || !username || username.length < 4) {
        if (!username) setError("Username  is required");
        else if (username.length < 4) setError("Username can&apos;t be less than");
        else if (!password) setError('Password is required');
      } else {
        onSubmit(username, password)
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className='login-page'>
      <div></div>
      <LoginBackground></LoginBackground>
      <div className="login-form">
        <div className="bg-glow"></div>
        <MonotoneBg></MonotoneBg>
        <h2>Login {<Cube gloom={true} size={20} inline={true} />} </h2>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div>
          <div>
            <input type="text" value={username} placeholder='Username' onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <input type="password" value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default LoginForm;
