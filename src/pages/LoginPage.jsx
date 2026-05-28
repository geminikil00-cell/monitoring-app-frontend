import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuthContext } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async ({ email, password }) => {
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center">
        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
}

export default LoginPage;
