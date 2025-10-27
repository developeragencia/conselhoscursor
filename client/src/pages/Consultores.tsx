import { useState, useEffect } from 'react';
import { Star, Clock, MessageCircle, Phone, Search, Loader2 } from 'lucide-react';

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
  status: string;
}

export default function Consultores() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  useEffect(() => {
    loadConsultants();
  }, []);

  const loadConsultants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usa URL absoluta se estiver no domínio customizado
      const apiUrl = window.location.hostname.includes('conselhosesotericos.com.br')
        ? 'https://conselhos-esotericos.onrender.com/api/consultants?limit=50'
        : '/api/consultants?limit=50';
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar: ${response.status}`);
      }

      const data = await response.json();
      
      // Extrai array de consultores independente do formato
      const consultantsList = Array.isArray(data) 
        ? data 
        : (data.consultants || data.data || []);

      setConsultants(consultantsList);
    } catch (err) {
      console.error('Erro ao carregar consultores:', err);
      setError('Não foi possível carregar os consultores. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultant.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            consultant.specialty?.toLowerCase() === selectedSpecialty.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });

  const specialties = ['all', ...new Set(consultants.map(c => c.specialty).filter(Boolean))];

  // Estado de Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carregando Consultores...</h2>
          <p className="text-gray-600">Por favor, aguarde</p>
        </div>
      </div>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao Carregar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadConsultants}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Nossos Consultores Especializados
          </h1>
          <p className="text-xl text-center text-purple-100 max-w-2xl mx-auto">
            Conecte-se com especialistas experientes em {consultants.length} áreas místicas
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* Filtro de Especialidade */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="all">Todas as Especialidades</option>
              {specialties.filter(s => s !== 'all').map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredConsultants.length} de {consultants.length} consultores
          </div>
        </div>

        {/* Grid de Consultores */}
        {filteredConsultants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">Nenhum consultor encontrado</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('all');
              }}
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredConsultants.map((consultant) => (
              <div
                key={consultant.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Imagem */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                  <img
                    src={consultant.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant.name)}&size=400&background=random`}
                    alt={consultant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant.name)}&size=400&background=random`;
                    }}
                  />
                  
                  {/* Badge de Status */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      consultant.status === 'online' 
                        ? 'bg-green-500 text-white' 
                        : consultant.status === 'busy'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {consultant.status === 'online' ? '🟢 Online' : 
                       consultant.status === 'busy' ? '🟡 Ocupado' : 
                       '⚫ Offline'}
                    </span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {consultant.name}
                  </h3>
                  <p className="text-purple-600 font-semibold mb-2">
                    {consultant.title || consultant.specialty}
                  </p>

                  {/* Avaliação */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(consultant.rating || 5)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {consultant.rating || 5.0} ({consultant.reviewCount || 0} avaliações)
                    </span>
                  </div>

                  {/* Descrição */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {consultant.description || 'Especialista experiente pronto para ajudar você.'}
                  </p>

                  {/* Preço */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Por minuto</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      R$ {(consultant.pricePerMinute || 3.5).toFixed(2)}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                      <Phone className="w-4 h-4" />
                      Ligar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botão para carregar mais */}
        {consultants.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={loadConsultants}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg"
            >
              Atualizar Consultores
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

