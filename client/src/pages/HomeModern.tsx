/**
 * 🏠 Homepage MODERNA - Design System Completo
 * Layout redesenhado com componentes visuais premium
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Star, ArrowRight, Shield, Clock, Sparkles, 
  MessageCircle, TrendingUp, Users, Award, Zap
} from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import GradientCard from "@/components/ui/GradientCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import FloatingCard from "@/components/ui/FloatingCard";
import StatCard from "@/components/ui/StatCard";
import OptimizedImage from "@/components/OptimizedImage";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function HomeModern() {
  // Fetch consultores
  const { data: consultantsData, isLoading: consultantsLoading } = useQuery({
    queryKey: ["/api/consultants/featured"],
    retry: 2,
  });

  const consultants = Array.isArray(consultantsData) ? consultantsData : [];

  const { data: testimonials } = useQuery({
    queryKey: ["/api/testimonials"],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dark Mode Toggle - Flutuante */}
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>

      {/* === HERO SECTION === */}
      <HeroSection
        subtitle="✨ Orientação Espiritual Online"
        title={
          <span>
            Transforme Sua Vida com{" "}
            <span className="text-gradient bg-gradient-to-r from-yellow-300 to-pink-300">
              Sabedoria Ancestral
            </span>
          </span>
        }
        description="Conecte-se com especialistas em Tarot, Astrologia, Numerologia e muito mais. Orientação profissional a qualquer hora, de qualquer lugar."
        background="mystic"
        actions={
          <>
            <Link href="/consultores">
              <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                Ver Consultores
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </button>
            </Link>
            <Link href="/como-funciona">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-full font-bold text-lg hover:bg-white/20 transition-all">
                Saiba Mais
              </button>
            </Link>
          </>
        }
      />

      {/* === ESTATÍSTICAS === */}
      <AnimatedSection className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Consultores Ativos"
            value="50+"
            icon={Users}
            variant="primary"
          />
          <StatCard
            label="Consultas Realizadas"
            value="10K+"
            icon={MessageCircle}
            variant="success"
          />
          <StatCard
            label="Satisfação"
            value="98%"
            icon={Star}
            trend="up"
            trendValue="+5%"
            variant="warning"
          />
          <StatCard
            label="Disponibilidade"
            value="24/7"
            icon={Clock}
            variant="primary"
          />
        </div>
      </AnimatedSection>

      {/* === NOSSOS CONSULTORES === */}
      <AnimatedSection className="py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Nossos Especialistas
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Consultores certificados e experientes, prontos para guiar você
            </p>
          </div>

          {consultantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {consultants.slice(0, 6).map((consultant: any, index: number) => (
                <AnimatedSection
                  key={consultant.id}
                  animation="fade-up"
                  delay={index * 100}
                >
                  <FloatingCard className="p-6 hover:shadow-2xl">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <OptimizedImage
                          src={consultant.imageUrl || consultant.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${consultant.name}`}
                          alt={consultant.name}
                          className="w-32 h-32 rounded-full border-4 border-purple-500"
                          width={128}
                          height={128}
                        />
                        {consultant.status === 'online' && (
                          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse" />
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {consultant.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                          {consultant.specialty}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mb-4">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900 dark:text-white">
                          {consultant.rating || '5.0'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          ({consultant.reviewCount || consultant.review_count || 0} avaliações)
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                        {consultant.description}
                      </p>

                      <Link href={`/consultores/${consultant.slug || consultant.id}`}>
                        <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-xl font-bold hover:scale-105 transition-transform">
                          Ver Perfil
                        </button>
                      </Link>
                    </div>
                  </FloatingCard>
                </AnimatedSection>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/consultores">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                Ver Todos os Consultores
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* === COMO FUNCIONA === */}
      <AnimatedSection className="py-24 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Simples, rápido e seguro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "1. Escolha seu Consultor",
                description: "Browse através de nossa seleção de especialistas e encontre o perfeito para você",
                color: "primary"
              },
              {
                icon: MessageCircle,
                title: "2. Agende sua Sessão",
                description: "Escolha horário conveniente e prepare suas perguntas",
                color: "success"
              },
              {
                icon: Sparkles,
                title: "3. Receba Orientação",
                description: "Consulta online via chat ou vídeo, com total privacidade",
                color: "warning"
              }
            ].map((step, index) => (
              <AnimatedSection
                key={index}
                animation="scale"
                delay={index * 150}
              >
                <GradientCard
                  variant={step.color as any}
                  className="p-8 text-center"
                >
                  <div className="flex justify-center mb-6">
                    <div className="p-6 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-white/90 text-lg">
                    {step.description}
                  </p>
                </GradientCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* === POR QUE NOS ESCOLHER === */}
      <AnimatedSection className="py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Por Que Nos Escolher?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "100% Seguro",
                description: "Suas informações protegidas"
              },
              {
                icon: Award,
                title: "Certificados",
                description: "Consultores verificados"
              },
              {
                icon: Zap,
                title: "Rápido",
                description: "Atendimento instantâneo"
              },
              {
                icon: TrendingUp,
                title: "Resultados",
                description: "Transformação real"
              }
            ].map((feature, index) => (
              <AnimatedSection
                key={index}
                animation="fade-up"
                delay={index * 100}
              >
                <div className="text-center p-6">
                  <div className="inline-flex p-4 bg-purple-100 dark:bg-purple-900 rounded-2xl mb-4">
                    <feature.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* === DEPOIMENTOS === */}
      {testimonials && testimonials.length > 0 && (
        <AnimatedSection className="py-24 bg-gradient-to-br from-gray-900 to-purple-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4">
                O Que Dizem Nossos Clientes
              </h2>
              <p className="text-xl text-white/80">
                Histórias reais de transformação
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial: any, index: number) => (
                <AnimatedSection
                  key={index}
                  animation="scale"
                  delay={index * 150}
                >
                  <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-white/90 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-sm text-white/60">Cliente Verificado</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* === CTA FINAL === */}
      <AnimatedSection className="py-24 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Pronto Para Transformar Sua Vida?
          </h2>
          <p className="text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
            Comece sua jornada de autoconhecimento hoje mesmo
          </p>
          <Link href="/cadastro">
            <button className="px-12 py-5 bg-white text-purple-600 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl">
              Começar Agora
              <Sparkles className="inline ml-3 w-6 h-6" />
            </button>
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}

