import React from 'react';
import { Link } from 'wouter';
import { Moon, Sun, Sparkles } from 'lucide-react';
import logoImage from "@assets/CONSELHOS_20250521_110746_0000_1754078656294.png";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
}) => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Coluna Esquerda - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-white dark:bg-gray-900 relative overflow-hidden border-r border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10">
          <Link href="/">
            <div className="flex items-center space-x-3 mb-12">
              {showLogo && (
                <img src={logoImage} alt="Conselhos Esotéricos" className="h-16 w-auto" />
              )}
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  Conselhos Esotéricos
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Conectando energias e destinos</p>
              </div>
            </div>
          </Link>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white">
                Transforme sua vida com <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">orientação espiritual</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Conecte-se com consultores especializados em tarot, astrologia, numerologia e muito mais.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '🔮', text: 'Consultas online seguras e privadas' },
                { icon: '⭐', text: 'Mais de 1000 consultas realizadas' },
                { icon: '💜', text: 'Consultores verificados e experientes' },
                { icon: '🎯', text: 'Pagamento seguro e transparente' },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Conselhos Esotéricos. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="flex flex-col bg-white dark:bg-gray-900 relative">
        <div className="lg:hidden flex items-center justify-between p-6 border-b dark:border-gray-800">
          <Link href="/">
            <img src={logoImage} alt="Conselhos Esotéricos" className="h-12 w-auto" />
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="hidden lg:block absolute top-6 right-6">
          <button onClick={toggleTheme} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {isDark ? <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
              {subtitle && <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>

        <div className="lg:hidden p-6 border-t dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          <p> 2025 Conselhos Esotéricos</p>
        </div>
      </div>
    </div>
  );
};
