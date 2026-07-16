import { WorkCardGrid } from './components/WorkCards';
import { validCardSpecs } from './domain/fixtures';
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
          {navigation.map((item) => (
            <button
              className={item === 'Cards' ? 'nav-item is-active' : 'nav-item'}
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
            <h1 id="workspace-title">Approved work cards</h1>
          </div>
          <span className="status" role="status">
            Catalog verified
          </span>
        </header>

        <WorkCardGrid specs={validCardSpecs} />
      </section>
    </main>
  );
}
