import React, { useState } from 'react';
import { Cube } from '../ui/widgets/cube.js';
import { LoginBackground } from './bg.js';
import { MonotoneBg } from './monotone.js';
import { Button } from '../ui/widgets/button.js';
import { Biomes } from '../repositories/biomes.js';

const LoginForm = ({ onSubmit, types = [] as any[] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [variant, setVariant] = useState(1);
  const [register, setRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      if (!password || !username || username.length < 4 || (
        register ? !email : false
      )) {
        if (!username) setError("Username  is required");
        else if (username.length < 4) setError("Username can&apos;t be less than");
        else if (!password) setError('Password is required');

        if (register && !email) setError('Email username is required');
      } else {
        onSubmit({ username, password, email, register, variant: types[variant].manifest.id }, setRegister, setError);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const changeVariant = (prev) => {
    let newVariant = prev ? variant - 1 : variant + 1;
    if (newVariant >= types.length) {
      newVariant = 0;
    } else if (newVariant < 0) {
      newVariant = types.length - 1;
    }
    setVariant(newVariant);
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
            <p>Choose your variant</p>
            <div className='gloom-chooser'>
              {types.map((i, ind) => (
                <>
                  {variant == ind && <div className='gloom-type'>
                    <Cube gloom={true} size={20} color={i.biome.colors[0]}></Cube>
                    <p>{i.biome.name || i.manifest.id}</p>
                  </div>}
                </>
              ))}
              <div onClick={() => changeVariant(1)} className="prev"></div>
              <div onClick={() => changeVariant(0)} className="next"></div>
            </div>
            <div>
              <input type="text" value={email} placeholder='Email' onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div> : <div>
            <div>
              <input type="text" value={username} placeholder='Username' onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <input type="password" value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>}
          <Button onClick={handleLogin} color='#333333'>
            {register ? 'Sign up' : 'Login'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
