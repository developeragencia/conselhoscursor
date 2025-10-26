import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { User, Crown, Check, ArrowRight, ArrowLeft, Mail, Lock, Phone, Briefcase, DollarSign, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

interface UserData {
  nome: string;
  cpf: string;
  nascimento?: string;
  situacao?: string;
}

interface FormErrors {
  nome?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  description?: string;
  hourlyRate?: string;
}

export default function CadastroNovo() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<'cliente' | 'consultor'>('cliente');
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    description: '',
    hourlyRate: '',
    specialty: 'tarot'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Máscaras e Formatações
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Validações
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  const validateStep1 = () => {
    return accountType !== '';
  };

  const validateStep2 = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido (deve ter 11 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: FormErrors = {};
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (accountType === 'consultor') {
      if (!formData.description.trim()) {
        newErrors.description = 'Descrição é obrigatória para consultores';
      }
      
      const rate = parseFloat(formData.hourlyRate);
      if (isNaN(rate) || rate <= 0) {
        newErrors.hourlyRate = 'Valor por hora inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navegação
  const nextStep = () => {
    let isValid = false;
    
    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        if (isValid) {
          handleSubmit();
          return;
        }
        break;
      default:
        isValid = true;
    }

    if (isValid && step < 4) {
      setStep(step + 1);
      setError('');
      setErrors({});
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
      setErrors({});
    }
  };

  // Submit final
  const handleSubmit = async () => {
    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const registerData = {
        name: formData.nome,
        email: formData.email,
        password: formData.password,
        role: accountType,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, ''),
        ...(accountType === 'consultor' && {
          specialty: formData.specialty,
          description: formData.description,
          pricePerMinute: Math.round(parseFloat(formData.hourlyRate) / 60 * 100) / 100
        })
      };

      console.log('🚀 Enviando cadastro:', registerData);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      const result = await response.json();

      if (response.ok && result.token) {
        setSuccess(true);
        setStep(4);
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          localStorage.setItem('authToken', result.token);
          if (accountType === 'cliente') {
            setLocation('/client-dashboard');
          } else {
            setLocation('/consultant-dashboard');
          }
        }, 2000);
      } else {
        throw new Error(result.error || 'Erro no cadastro');
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(err.message || 'Erro ao finalizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers de input
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuario digitar
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Render Steps
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setAccountType('cliente')}
          className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
            accountType === 'cliente'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
              : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${
              accountType === 'cliente' ? 'bg-orange-500' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <User className={`w-6 h-6 ${
                accountType === 'cliente' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Sou Cliente
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quero consultar especialistas
              </p>
            </div>
            {accountType === 'cliente' && (
              <CheckCircle2 className="w-6 h-6 text-orange-500" />
            )}
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Consultas online seguras</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Acesso a diversos especialistas</span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setAccountType('consultor')}
          className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
            accountType === 'consultor'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${
              accountType === 'consultor' ? 'bg-purple-500' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <Crown className={`w-6 h-6 ${
                accountType === 'consultor' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Sou Consultor
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quero oferecer meus serviços
              </p>
            </div>
            {accountType === 'consultor' && (
              <CheckCircle2 className="w-6 h-6 text-purple-500" />
            )}
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Perfil profissional</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Receba pagamentos seguros</span>
            </div>
          </div>
        </button>
      </div>

      <Button
        onClick={nextStep}
        className="w-full h-12 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold"
        size="lg"
      >
        Continuar
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-purple-600 hover:underline font-medium">
          Fazer Login
        </Link>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-purple-800 dark:text-purple-300">
          Consulta CPF
        </CardTitle>
        <CardDescription>
          Digite seu CPF para buscar seus dados automaticamente
        </CardDescription>
        <Badge variant="outline" className="mx-auto">
          {accountType === 'cliente' ? 'Cliente' : 'Consultor'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            maxLength={14}
            className="text-center text-lg"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={searchCPF} 
          disabled={loading || cpf.replace(/\D/g, '').length !== 11}
          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
          size="lg"
        >
          {loading ? (
            <>
              <Search className="w-4 h-4 mr-2 animate-spin" />
              Consultando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Buscar Dados
            </>
          )}
        </Button>

        <div className="text-center">
          <Button variant="ghost" onClick={() => setStep(1)}>
            Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-purple-800 dark:text-purple-300">
          Finalizar Cadastro
        </CardTitle>
        <CardDescription>
          Complete seus dados para finalizar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {userData && (
          <Alert>
            <Check className="w-4 h-4" />
            <AlertDescription>
              <strong>Dados encontrados:</strong> {userData.nome}
              <br />
              <strong>CPF:</strong> {formatCPF(userData.cpf)}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Repita a senha"
            />
          </div>
        </div>

        {accountType === 'consultor' && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              Dados Profissionais
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição Profissional</Label>
              <textarea
                id="description"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva sua experiência e especialidades..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Valor por Hora (R$)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  placeholder="50.00"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
            Voltar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
          >
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
            Cadastro Realizado!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sua conta foi criada com sucesso
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600">
            Fazer Login
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <Link href="/">
            <img 
              src="/logo.png" 
              alt="Conselhos Esotéricos" 
              className="h-16 mx-auto mb-4"
            />
          </Link>
          <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-300">
            Criar Nova Conta
          </h1>
          
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum <= step 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNum < step ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-12 h-1 mx-2 ${
                      stepNum < step ? 'bg-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-purple-600 hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}