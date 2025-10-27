import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Star, Phone, MessageCircle, Search, RefreshCcw } from 'lucide-react';

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

export default function ConsultoresPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConsultants();
  }, []);

  const loadConsultants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/consultants?limit=50');

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      
      console.log('✅ Consultores:', list.length);
      setConsultants(list);
    } catch (err: any) {
      console.error('❌ Erro:', err);
      setError(err.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultants = consultants.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    if (status === 'online') return 'bg-green-500';
    if (status === 'busy') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    if (status === 'online') return 'Online';
    if (status === 'busy') return 'Ocupado';
    return 'Offline';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Erro</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={loadConsultants}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-2"
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-purple-900 mb-4">
            Nossos Consultores
          </h1>
          <p className="text-xl text-gray-700">
            {consultants.length} especialistas disponíveis
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar consultor..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredConsultants.length === 0 && (
          <div className="text-center text-gray-600 text-xl mt-16">
            Nenhum consultor encontrado.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredConsultants.map((consultant) => (
            <div
              key={consultant.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div className="relative h-48 w-full">
                <img
                  src={consultant.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant.name)}&background=random&color=fff&size=256`}
                  alt={consultant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant.name)}&background=random&color=fff&size=256`;
                  }}
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1 ${getStatusColor(consultant.status)}`}>
                  <span className="w-2 h-2 rounded-full bg-white opacity-75 animate-pulse"></span>
                  {getStatusText(consultant.status)}
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-purple-800 mb-1">{consultant.name}</h2>
                <h3 className="text-md font-medium text-gray-600 mb-3">{consultant.title}</h3>
                
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400 mr-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        fill={i < Math.floor(consultant.rating) ? "currentColor" : "none"} 
                        strokeWidth={1.5} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">
                    {consultant.rating.toFixed(1)} ({consultant.reviewCount})
                  </span>
                </div>
                
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {consultant.description}
                </p>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-purple-700 font-bold text-lg">
                    R$ {consultant.pricePerMinute.toFixed(2)}/min
                  </span>
                  <div className="flex gap-2">
                    <Link href={`/chat/${consultant.id}`}>
                      <button className="p-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
                        <MessageCircle size={20} />
                      </button>
                    </Link>
                    <button className="p-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
                      <Phone size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
