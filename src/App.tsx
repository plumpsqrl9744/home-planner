import { useScenarioStore } from './store/scenarioStore';
import { Header } from './components/layout/Header';
import { SingleView } from './components/layout/SingleView';
import { ComparisonInputs } from './components/layout/ComparisonInputs';
import { ComparisonView } from './components/comparison/ComparisonView';

export default function App() {
  const comparisonMode = useScenarioStore((s) => s.comparisonMode);
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {comparisonMode ? (
          <>
            <ComparisonInputs />
            <ComparisonView />
          </>
        ) : (
          <SingleView />
        )}
      </div>
    </div>
  );
}
