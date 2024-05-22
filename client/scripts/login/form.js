import React, { useState } from 'react';
import { Cube } from '../ui/widgets/cube.js';
import { LoginBackground } from './bg.js';
import { MonotoneBg } from './monotone.js';
import { Button } from '../ui/widgets/button.js';
const LoginForm = ({ onSubmit, types = [] }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [variant, setVariant] = useState(1);
    const [register, setRegister] = useState(false);
    const [error, setError] = useState(null);
    const handleLogin = async () => {
        try {
            if (!password || !username || username.length < 4 || (register ? !email : false)) {
                if (!username)
                    setError("Username  is required");
                else if (username.length < 4)
                    setError("Username can&apos;t be less than");
                else if (!password)
                    setError('Password is required');
                if (register && !email)
                    setError('Email username is required');
            }
            else {
                onSubmit({ username, password, email, register, variant: types[variant].manifest.id }, setRegister, setError);
            }
        }
        catch (error) {
            console.error('Login error:', error);
        }
    };
    const changeVariant = (prev) => {
        let newVariant = prev ? variant - 1 : variant + 1;
        if (newVariant >= types.length) {
            newVariant = 0;
        }
        else if (newVariant < 0) {
            newVariant = types.length - 1;
        }
        setVariant(newVariant);
    };
    return (React.createElement("div", { className: 'login-page' },
        React.createElement("div", null),
        React.createElement(LoginBackground, null),
        React.createElement("div", { className: "login-form" },
            React.createElement("div", { className: "bg-glow" }),
            React.createElement(MonotoneBg, null),
            React.createElement("div", { className: "form" },
                React.createElement("h2", null, register ? 'Create Account' : 'Login'),
                error && React.createElement("div", { style: { color: 'red' } }, error),
                register ? React.createElement("div", null,
                    React.createElement("p", null, "Choose your variant"),
                    React.createElement("div", { className: 'gloom-chooser' },
                        types.map((i, ind) => (React.createElement(React.Fragment, null, variant == ind && React.createElement("div", { className: 'gloom-type' },
                            React.createElement(Cube, { gloom: true, size: 20, color: i.biome.colors[0] }),
                            React.createElement("p", null, i.biome.name || i.manifest.id))))),
                        React.createElement("div", { onClick: () => changeVariant(1), className: "prev" }),
                        React.createElement("div", { onClick: () => changeVariant(0), className: "next" })),
                    React.createElement("div", null,
                        React.createElement("input", { type: "text", value: email, placeholder: 'Email', onChange: (e) => setEmail(e.target.value) }))) : React.createElement("div", null,
                    React.createElement("div", null,
                        React.createElement("input", { type: "text", value: username, placeholder: 'Username', onChange: (e) => setUsername(e.target.value) })),
                    React.createElement("div", null,
                        React.createElement("input", { type: "password", value: password, placeholder: 'Password', onChange: (e) => setPassword(e.target.value) }))),
                React.createElement(Button, { onClick: handleLogin, color: '#333333' }, register ? 'Sign up' : 'Login')))));
};
export default LoginForm;
