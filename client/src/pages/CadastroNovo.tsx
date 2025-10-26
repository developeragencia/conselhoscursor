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
    // Dados do Consultor
    description: '',
    hourlyRate: '',
    specialty: 'tarot',
    experience: '',
    certifications: '',
    specialties: [] as string[],
    languages: [] as string[],
    availability: '',
    profileImage: '',
    bio: '',
    achievements: '',
    consultationTypes: [] as string[]
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
    return accountType === 'cliente' || accountType === 'consultor';
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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nome Completo *
          </Label>
          <Input
            id="nome"
            type="text"
            placeholder="Seu nome completo"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className={`h-12 ${errors.nome ? 'border-red-500' : ''}`}
          />
          {errors.nome && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.nome}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            CPF *
          </Label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
            maxLength={14}
            className={`h-12 ${errors.cpf ? 'border-red-500' : ''}`}
          />
          {errors.cpf && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.cpf}
            </p>
          )}
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
          className="flex-1 h-12"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
        <Button
          type="button"
          onClick={nextStep}
          className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
        >
          Continuar
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`h-12 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
              maxLength={15}
              className={`h-12 ${errors.phone ? 'border-red-500' : ''}`}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Senha *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`h-12 ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirmar Senha *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`h-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {accountType === 'consultor' && (
          <>
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Dados Profissionais
              </h3>
              
              <div className="space-y-4">
                {/* Especialidade Principal */}
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Especialidade Principal *
                  </Label>
                  <select
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    className="w-full h-12 p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="tarot">Tarot</option>
                    <option value="astrologia">Astrologia</option>
                    <option value="numerologia">Numerologia</option>
                    <option value="runas">Runas</option>
                    <option value="mediunidade">Mediunidade</option>
                    <option value="reiki">Reiki</option>
                    <option value="cristaloterapia">Cristaloterapia</option>
                    <option value="oraculos">Oráculos</option>
                  </select>
                </div>

                {/* Bio Profissional */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Bio Profissional (Para o perfil público) *
                  </Label>
                  <textarea
                    id="bio"
                    rows={3}
                    placeholder="Ex: Tarólogo há 10 anos, especializado em amor e carreira..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className={`w-full p-3 rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <p className="text-xs text-gray-500">Esta descrição aparecerá no seu perfil público</p>
                </div>

                {/* Anos de Experiência */}
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Anos de Experiência *
                  </Label>
                  <select
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full h-12 p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="1-2">1-2 anos</option>
                    <option value="3-5">3-5 anos</option>
                    <option value="6-10">6-10 anos</option>
                    <option value="10+">Mais de 10 anos</option>
                  </select>
                </div>

                {/* Especialidades Adicionais */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Especialidades Adicionais (Selecione até 3)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Tarot', 'Astrologia', 'Numerologia', 'Runas', 'Mediunidade', 'Reiki'].map((spec) => (
                      <label key={spec} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(spec)}
                          onChange={(e) => {
                            const current = formData.specialties;
                            if (e.target.checked && current.length < 3) {
                              handleInputChange('specialties', [...current, spec] as any);
                            } else if (!e.target.checked) {
                              handleInputChange('specialties', current.filter(s => s !== spec) as any);
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tipos de Consulta */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipos de Consulta Oferecidos *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Chat', 'Vídeo', 'Áudio', 'Email'].map((type) => (
                      <label key={type} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.consultationTypes.includes(type)}
                          onChange={(e) => {
                            const current = formData.consultationTypes;
                            if (e.target.checked) {
                              handleInputChange('consultationTypes', [...current, type] as any);
                            } else {
                              handleInputChange('consultationTypes', current.filter(t => t !== type) as any);
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Idiomas */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Idiomas que Atende *
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Português', 'Inglês', 'Espanhol'].map((lang) => (
                      <label key={lang} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={(e) => {
                            const current = formData.languages;
                            if (e.target.checked) {
                              handleInputChange('languages', [...current, lang] as any);
                            } else {
                              handleInputChange('languages', current.filter(l => l !== lang) as any);
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Certificações */}
                <div className="space-y-2">
                  <Label htmlFor="certifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Certificações e Cursos (Opcional)
                  </Label>
                  <textarea
                    id="certifications"
                    rows={2}
                    placeholder="Ex: Certificado em Tarot pela Escola X, Curso de Astrologia Vedica..."
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Conquistas */}
                <div className="space-y-2">
                  <Label htmlFor="achievements" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Conquistas e Destaques (Opcional)
                  </Label>
                  <textarea
                    id="achievements"
                    rows={2}
                    placeholder="Ex: Mais de 1000 consultas realizadas, Avaliação 5 estrelas..."
                    value={formData.achievements}
                    onChange={(e) => handleInputChange('achievements', e.target.value)}
                    className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Valor por Hora */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Valor por Hora (R$) *
                    </Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="50.00"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      className={`h-12 ${errors.hourlyRate ? 'border-red-500' : ''}`}
                    />
                    {errors.hourlyRate && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.hourlyRate}
                      </p>
                    )}
                  </div>

                  {/* Disponibilidade */}
                  <div className="space-y-2">
                    <Label htmlFor="availability" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Disponibilidade *
                    </Label>
                    <select
                      id="availability"
                      value={formData.availability}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                      className="w-full h-12 p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="full-time">Tempo Integral</option>
                      <option value="part-time">Meio Período</option>
                      <option value="weekends">Finais de Semana</option>
                      <option value="evenings">Noites</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
          className="flex-1 h-12"
          disabled={loading}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
        <Button
          type="button"
          onClick={nextStep}
          disabled={loading}
          className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Cadastrando...
            </>
          ) : (
            <>
              Finalizar Cadastro
              <Check className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
          Cadastro Realizado com Sucesso!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {accountType === 'cliente' 
            ? 'Sua conta foi criada. Redirecionando para seu painel...'
            : 'Sua conta foi criada. Aguarde aprovação da equipe.'}
        </p>
      </div>

      <div className="flex items-center justify-center space-x-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Redirecionando...</span>
      </div>
    </div>
  );

  // Progress indicator
  const progressSteps = [
    { num: 1, label: 'Tipo de Conta' },
    { num: 2, label: 'Dados Pessoais' },
    { num: 3, label: 'Finalizar' },
    { num: 4, label: 'Concluído' }
  ];

  return (
    <AuthLayout
      title={step === 4 ? 'Bem-vindo!' : 'Criar Nova Conta'}
      subtitle={
        step === 1 ? 'Escolha como você deseja usar a plataforma' :
        step === 2 ? 'Preencha seus dados pessoais' :
        step === 3 ? 'Complete as informações para finalizar' :
        'Sua conta foi criada com sucesso'
      }
    >
      {/* Progress Indicator */}
      {step < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {progressSteps.slice(0, 3).map((progressStep, index) => (
              <React.Fragment key={progressStep.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      progressStep.num < step
                        ? 'bg-green-500 text-white'
                        : progressStep.num === step
                        ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {progressStep.num < step ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      progressStep.num
                    )}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 hidden sm:block">
                    {progressStep.label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      progressStep.num < step
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Steps Content */}
      <div className="mt-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </AuthLayout>
  );
}