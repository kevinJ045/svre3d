import React, { useState } from 'react';
import { Cube } from '../ui/widgets/cube.tsx';
import { LoginBackground } from './bg.tsx';
import { MonotoneBg } from './monotone.tsx';
import { Button } from '../ui/widgets/button.tsx';
import { Biomes } from '../repositories/biomes.ts';

const LoginForm = ({ onSubmit, types = [] as any[] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [variant, setVariant] = useState('');
  const [register, setRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      if (!password || !username || username.length < 4 || (
        register ? (!email || !variant) : false 
      )) {
        if (!username) setError("Username  is required");
        else if (username.length < 4) setError("Username can&apos;t be less than");
        else if (!password) setError('Password is required');

        if(register && !email) setError('Email is required');
        else if(register && !variant) setError('You need to choose your variant.');
      } else {
        onSubmit(username, password, setRegister);
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
        <div className="form">
          <h2>{register ? 'Create Account' : 'Login'}</h2>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {register ? <div>
            <div>
              <input type="text" value={username} placeholder='Username' onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <input type="password" value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div> : <div>
            <p>Choose your variant</p>
            <div style={{ display: 'flex' }}>
              {types.map(i => (
                <div>
                  <Cube gloom={true} size={20} color={i.biome.colors[0]}></Cube>
                  <p>{i.biome.name || i.manifest.id}</p>
                </div>
              ))}
            </div>
            <div>
              <input type="text" value={email} placeholder='Email' onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div> }
          <Button onClick={handleLogin} color='#09d0d0'>
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
