// apps/web/pages/auth/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { login } from '../../store/slices/userSlice';
import { toast } from 'react-hot-toast';

// Define validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Get redirect path from location state, default to home
  const from = location.state?.from?.pathname || '/';

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await dispatch(login(data)).unwrap();
      toast.success('Login successful!');
      
      // Redirect to the intended page or home
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error || 'Login failed. Please try again.');
      setError('root', { message: error || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center full-height">
      <div className="card" style={{ width: '400px' }}>
        <h2>Login to Social Platform</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
              {...register('email')}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              {...register('password')}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>

          {errors.root && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            className="button button-primary full-width"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p>
            Don't have an account? <a href="/register">Register here</a>
          </p>
          <p>
            <a href="/forgot-password">Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;