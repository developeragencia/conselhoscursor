import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Eye, EyeOff, User, Crown, Shield, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

const Login = () => {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState('cliente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const roleConfig = {
    cliente: {
      icon: User,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      borderColor: 'border-orange-500',
      title: 'Cliente',
      description: 'Acesso às consultas e serviços'
    },
    consultor: {
      icon: Crown,
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      borderColor: 'border-purple-600',
      title: 'Consultor',
      description: 'Painel do consultor esotérico'
    },
    admin: {
      icon: Shield,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      borderColor: 'border-blue-600',
      title: 'Administrador',
      description: 'Painel administrativo'
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar erros
    setError('');
    setEmailError('');
    setPasswordError('');

    // Validações
    let hasError = false;
    
    if (!email) {
      setEmailError('Email é obrigatório');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Email inválido');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Senha é obrigatória');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Senha deve ter no mínimo 6 caracteres');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (data.success || data.token) {
        localStorage.setItem('authToken', data.token);
        
        // Redirecionar baseado no role
        switch (data.user?.role || selectedRole) {
          case 'admin':
            setLocation('/admin-dashboard');
            break;
          case 'consultor':
            setLocation('/consultant-dashboard');
            break;
          case 'cliente':
          default:
            setLocation('/client-dashboard');
            break;
        }
      } else {
        setError(data.error || 'Credenciais inválidas');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      subtitle="Faça login para acessar sua conta"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Tipo de Usuário */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo de Acesso
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(roleConfig).map(([role, config]) => {
              const IconComponent = config.icon;
              const isSelected = selectedRole === role;
              
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                    isSelected
                      ? `${config.color} ${config.borderColor} text-white shadow-md`
                      : `bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600`
                  }`}
                >
                  <IconComponent className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-xs font-medium">{config.title}</div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {roleConfig[selectedRole as keyof typeof roleConfig].description}
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            placeholder="seu@email.com"
            className={`h-12 ${emailError ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {emailError && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {emailError}
            </p>
          )}
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="Sua senha"
              className={`h-12 pr-12 ${passwordError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {passwordError && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {passwordError}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className={`w-full h-12 font-semibold ${roleConfig[selectedRole as keyof typeof roleConfig].color} ${roleConfig[selectedRole as keyof typeof roleConfig].hoverColor} text-white transition-all`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            `Entrar como ${roleConfig[selectedRole as keyof typeof roleConfig].title}`
          )}
        </Button>

        {/* Links */}
        <div className="space-y-3 text-center">
          <Link href="/forgot-password">
            <button type="button" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline transition-colors">
              Esqueceu sua senha?
            </button>
          </Link>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Link href="/cadastro-novo">
              <span className="text-purple-600 dark:text-purple-400 font-medium hover:underline cursor-pointer">
                Cadastre-se agora
              </span>
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
