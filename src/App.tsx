import './App.css';

const navigation = ['Runs', 'Cards', 'Stream', 'Validation'];

export default function App() {
  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Lab navigation">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            G
          </span>
          <span>UI Component Gym</span>
        </div>
        <nav>
          {navigation.map((item, index) => (
            <button
              className={index === 0 ? 'nav-item is-active' : 'nav-item'}
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace" aria-labelledby="workspace-title">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Controlled renderer</p>
            <h1 id="workspace-title">Execution workspace</h1>
          </div>
          <span className="status" role="status">
            Foundation ready
          </span>
        </header>

        <section className="empty-state" aria-labelledby="empty-state-title">
          <div className="empty-state-icon" aria-hidden="true">
            +
          </div>
          <h2 id="empty-state-title">No active run</h2>
          <p>Tool results and validated work cards will appear here.</p>
        </section>
      </section>
    </main>
  );
}
