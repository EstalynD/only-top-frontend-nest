"use client";
import React from 'react';
import { loginApi } from '@/lib/http';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
  // El backend espera `username`; soportamos usuario o correo
  const identifier = email.trim();
  const username = identifier.includes('@') ? identifier.toLowerCase() : identifier;
  const res = await loginApi(username, password);
      sessionStorage.setItem('ot_token', res.token);
      if (remember) sessionStorage.setItem('ot_remember', '1');
      router.replace('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#18181b] flex items-center justify-center p-4 md:p-6">
      <main
        className="max-w-7xl w-full rounded-[24px] md:rounded-[30px] flex flex-col md:flex-row overflow-hidden border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
        style={{ minHeight: 'min(600px, 90vh)', background: '#f7f9fc' }}
      >
        {/* Left side */}
        <section className="flex-1 px-6 py-8 md:px-10 md:py-12 flex flex-col justify-between">
          <header className="flex items-center justify-start gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1c41d9] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OT</span>
              </div>
              <h1 className="font-extrabold text-xl leading-none text-black">OnlyTop</h1>
            </div>
            <p className="text-xs text-gray-600 hidden sm:block">Gestión Empresarial</p>
          </header>

          <form onSubmit={onSubmit} className="max-w-sm w-full mx-auto flex flex-col gap-6">
            <div className="text-center mb-2">
              <h2 className="font-bold text-2xl md:text-3xl leading-tight mb-2 md:mb-3 text-[#18181b]">Bienvenido de vuelta</h2>
              <p className="text-gray-600 text-sm">Ingresa tus credenciales para acceder</p>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-700 font-medium" htmlFor="email">
                Usuario o correo *
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 md:py-3 outline-none text-sm font-medium transition-colors focus:border-[#1c41d9] focus:bg-blue-50/30 text-gray-800 placeholder:text-gray-400"
                placeholder="usuario o ejemplo@empresa.com"
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-700 font-medium" htmlFor="password">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 md:py-3 pr-12 outline-none text-sm font-medium transition-colors focus:border-[#1c41d9] focus:bg-blue-50/30 text-gray-800 placeholder:text-gray-400"
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            ) : null}

            {/* Remember & Forgot */}
            <div className="flex justify-between items-center text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#1c41d9] border-2 border-gray-300 rounded"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Recordarme
              </label>
              <button type="button" className="hover:text-[#1c41d9] font-medium">¿Olvidaste tu contraseña?</button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1c41d9] to-[#1e338a] hover:from-[#1e338a] hover:to-[#1c41d9] text-white font-bold py-2.5 md:py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Iniciando sesión…' : 'Iniciar Sesión'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <button type="button" className="font-bold text-[#1c41d9] hover:text-[#1e338a]">Contáctanos</button>
              </p>
            </div>
          </form>

          <footer className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <a href="#" className="hover:text-[#1E8AFF]">Términos de Servicio</a>
              <span>|</span>
              <a href="#" className="hover:text-[#1E8AFF]">Política de Privacidad</a>
              <span>|</span>
              <a href="#" className="hover:text-[#1E8AFF]">Soporte</a>
            </div>
            <p className="text-xs text-gray-400 mt-2">© 2025 OnlyTop. Todos los derechos reservados.</p>
          </footer>
        </section>

        {/* Right side */}
        <section className="hidden md:flex flex-1 relative bg-gradient-to-br from-[#1e338a] to-black p-8 lg:p-12 flex-col justify-center items-center overflow-hidden">
          {/* Solo logo */}
          <div className="z-10 relative text-center">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[#1c41d9] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl lg:text-2xl">OT</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
