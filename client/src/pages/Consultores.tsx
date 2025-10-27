import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Phone, MessageCircle, XCircle, RefreshCcw } from 'lucide-react';

interface Consultant {
  id: string;
  name: string;
  title: string;
  specialty: string;
  description: string;
  pricePerMinute: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  status: 'online' | 'busy' | 'offline';
}

const getStatusColor = (status: Consultant['status']) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'busy': return 'bg-yellow-500';
    case 'offline': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

const getStatusText = (status: Consultant['status']) => {
  switch (status) {
    case 'online': return 'Online';
    case 'busy': return 'Ocupado';
    case 'offline': return 'Offline';
    default: return 'Indisponível';
  }
};

export default function ConsultoresPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userCredits, setUserCredits] = useState<number | null>(null);

  useEffect(() => {
    loadConsultants();
    loadUserCredits();
  }, []);

  const loadConsultants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/consultants?limit=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar: ${response.status}`);
      }

      const data = await response.json();
      
      const consultantsList = Array.isArray(data) 
        ? data.map(c => ({
            ...c,
            pricePerMinute: parseFloat(c.pricePerMinute) || 0,
            rating: parseFloat(c.rating) || 0,
          }))
        : (data.consultants || data.data || []).map((c: any) => ({
            ...c,
            pricePerMinute: parseFloat(c.pricePerMinute) || 0,
            rating: parseFloat(c.rating) || 0,
          }));

      setConsultants(consultantsList);
    } catch (err) {
      console.error('Erro ao carregar consultores:', err);
      setError('Não foi possível carregar os consultores. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCredits = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        setUserCredits(parseFloat(user.credits) || 0);
      }
    } catch (err) {
      console.error('Erro ao carregar créditos:', err);
    }
  };

  const handleConsultClick = async (consultant: Consultant) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      alert('⚠️ Você precisa fazer login para consultar!');
      window.location.href = '/login';
      return;
    }

    if (userCredits === null || userCredits < 5) {
      const confirmar = confirm(
        `💰 Você precisa de no mínimo R$ 5,00 em créditos para iniciar uma consulta.\n\n` +
        `Seu saldo atual: R$ ${(userCredits || 0).toFixed(2)}\n\n` +
        `Deseja comprar créditos agora?`
      );
      if (confirmar) {
        window.location.href = '/comprar/creditos';
      }
      return;
    }

    const confirmar = confirm(
      `🔮 Iniciar consulta com ${consultant.name}?\n\n` +
      `💰 Valor: R$ ${consultant.pricePerMinute.toFixed(2)}/minuto\n` +
      `💳 Seu saldo: R$ ${userCredits.toFixed(2)}\n\n` +
      `A cobrança será feita proporcionalmente ao tempo de consulta.`
    );

    if (!confirmar) return;

    try {
      const response = await fetch('/api/consultations/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ consultant_id: consultant.id })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Consulta iniciada com sucesso!\n\nID: ${data.consultation.id}`);
        window.location.href = `/consultation/${data.consultation.id}`;
      } else {
        alert(`❌ Erro: ${data.error}`);
        if (data.error.includes('Créditos insuficientes')) {
          const comprar = confirm('Deseja comprar créditos agora?');
          if (comprar) {
            window.location.href = '/comprar/creditos';
          }
        }
      }
    } catch (err) {
      alert('❌ Erro ao iniciar consulta. Tente novamente.');
      console.error(err);
    }
  };

  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultant.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty = specialtyFilter === 'all' || consultant.specialty.toLowerCase() === specialtyFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || consultant.status === statusFilter;

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const availableSpecialties = useMemo(() => {
    const specialties = new Set(consultants.map(c => c.specialty));
    return ['all', ...Array.from(specialties).sort()];
  }, [consultants]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium text-lg">Carregando Consultores...</p>
          <p className="text-gray-500 text-sm">Por favor, aguarde enquanto buscamos os especialistas.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Erro ao Carregar Consultores</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={loadConsultants}
            className="px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-2 shadow-md"
          >
            <RefreshCcw className="w-5 h-5" />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-purple-900 mb-4 leading-tight">
            Nossos Consultores Especializados
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Conecte-se com os melhores especialistas em diversas áreas esotéricas.
          </p>
          
          {userCredits !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 inline-block bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg"
            >
              <span className="text-lg font-semibold text-purple-800">
                💰 Seu saldo: R$ {userCredits.toFixed(2)}
              </span>
              <button
                onClick={() => window.location.href = '/comprar/creditos'}
                className="ml-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-colors"
              >
                + Comprar Créditos
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg mb-12 max-w-4xl mx-auto flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar consultor por nome ou título..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              className="w-full md:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              {availableSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty === 'all' ? 'Todas as Especialidades' : specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">●</span>
            <select
              className="w-full md:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="online">Online</option>
              <option value="busy">Ocupado</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSpecialtyFilter('all');
              setStatusFilter('all');
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Limpar Filtros
          </button>
        </motion.div>

        {filteredConsultants.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 text-xl mt-16"
          >
            Nenhum consultor encontrado com os filtros aplicados.
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredConsultants.map((consultant) => (
            <motion.div
              key={consultant.id}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
            >
              <div className="relative h-48 w-full">
                <img
                  src={consultant.imageUrl || `https://ui-avatars.com/api/?name=${consultant.name}&background=random&color=fff&size=128`}
                  alt={consultant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${consultant.name}&background=random&color=fff&size=128`;
                  }}
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1 ${getStatusColor(consultant.status)}`}>
                  <span className="w-2 h-2 rounded-full bg-white opacity-75 animate-pulse"></span>
                  {getStatusText(consultant.status)}
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h2 className="text-2xl font-bold text-purple-800 mb-1">{consultant.name}</h2>
                <h3 className="text-md font-medium text-gray-600 mb-3">{consultant.title}</h3>
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400 mr-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={18} fill={i < Math.floor(consultant.rating) ? "currentColor" : "none"} strokeWidth={1.5} />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">
                    {consultant.rating.toFixed(1)} ({consultant.reviewCount} avaliações)
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{consultant.description}</p>
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-purple-700 font-bold text-lg">
                    R$ {consultant.pricePerMinute.toFixed(2)}/min
                  </span>
                  <button
                    onClick={() => handleConsultClick(consultant)}
                    disabled={consultant.status !== 'online'}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                      consultant.status === 'online'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {consultant.status === 'online' ? '🔮 Consultar' : '⏸️ Indisponível'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
