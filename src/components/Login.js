import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import LoadingOverlay from './LoadingOverlay';

const Login = ({ setIsLoggedIn }) => {
  const [user_email, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('user_email');
    if (rememberedEmail) {
      setUserEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!user_email.trim()) {
      errors.user_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(user_email)) {
      errors.user_email = 'Email is invalid';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, { user_email, password });
        localStorage.setItem('token', response.data.token);
        if (rememberMe) {
          localStorage.setItem('user_email', user_email);
        } else {
          localStorage.removeItem('user_email');
        }
        setIsLoggedIn(true);
        setLoginSuccess(true);
        toast.current.show({severity: 'success', summary: 'Success', detail: 'Logged in successfully', life: 3000});
        setTimeout(() => navigate('/'), 3000);
      } catch (error) {
        console.error('Login error:', error);
        toast.current.show({severity: 'error', summary: 'Error', detail: 'Invalid email or password. Please try again.', life: 3000});
      } finally {
        setLoading(false);
      }
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="p-fluid">
      <div className="field mb-4">
        <span className="p-float-label p-input-icon-right">
          <i className="pi pi-envelope" />
          <InputText
            id="user_email"
            name="user_email"
            type="email"
            value={user_email}
            onChange={(e) => setUserEmail(e.target.value)}
            className={classNames({ 'p-invalid': errors.user_email })}
            aria-describedby="email-error"
          />
          <label htmlFor="user_email">Email</label>
        </span>
        {errors.user_email && <small id="email-error" className="p-error">{errors.user_email}</small>}
      </div>
      <div className="field mb-4">
        <span className="p-float-label">
          <Password
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
            className={classNames({ 'p-invalid': errors.password })}
            aria-describedby="password-error"
            feedback={false}
          />
          <label htmlFor="password">Password</label>
        </span>
        {errors.password && <small id="password-error" className="p-error">{errors.password}</small>}
      </div>
      <div className="field-checkbox mb-4">
        <Checkbox inputId="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.checked)} />
        <label htmlFor="rememberMe" className="ml-2 cursor-pointer select-none">Remember me</label>
      </div>
      <Button type="submit" label="Sign In" icon="pi pi-user" loading={loading} className="mb-4 p-button-raised" />
    </form>
  );

  const renderSuccessMessage = () => (
    <div className="text-center">
      <i className="pi pi-check-circle" style={{ fontSize: '5rem', color: 'var(--green-500)' }}></i>
      <h2>Login Successful</h2>
      <p>You will be redirected to the home page shortly.</p>
    </div>
  );

  return (
    <div className="flex justify-content-center align-items-center min-h-screen login-background">
      <Toast ref={toast} />
      {loading && <LoadingOverlay />}
      <Card className="w-full max-w-30rem shadow-lg login-card fade-in">
        <div className="text-center mb-5">
          <div className="login-icon mb-3">
            <i className="pi pi-user text-4xl"></i>
          </div>
          <h1 className="text-900 text-3xl font-medium mb-3">Welcome Back</h1>
          <p className="text-600 font-medium">Sign in to continue</p>
        </div>

        {loginSuccess ? renderSuccessMessage() : renderLoginForm()}

        {!loginSuccess && (
          <div className="flex align-items-center justify-content-between">
            <Link to="/forgot-password" className="font-medium no-underline text-blue-500 cursor-pointer hover:text-blue-700 transition-colors transition-duration-300">Forgot password?</Link>
            <Link to="/register" className="font-medium no-underline text-blue-500 cursor-pointer hover:text-blue-700 transition-colors transition-duration-300">Create an account</Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;