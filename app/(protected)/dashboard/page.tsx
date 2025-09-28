export default function DashboardPage() {
  return (
    <main className="min-h-[calc(100dvh-56px)] flex items-start justify-stretch p-4">
      <section className="ot-card w-full p-6 md:p-8">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Panel OnlyTop</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Bienvenido al dashboard.</p>
        </div>
        {/* Aquí irán widgets/resúmenes indicadores con la misma paleta corporativa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="ot-card p-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Indicador</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>—</p>
          </div>
          <div className="ot-card p-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Indicador</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>—</p>
          </div>
          <div className="ot-card p-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Indicador</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>—</p>
          </div>
        </div>
      </section>
    </main>
  );
}
