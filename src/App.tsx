import { useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { BasicInfo, ScenarioConfig } from './types/domain';
import { DEFAULT_BASIC, makeScenarioConfig } from './config/defaults.config';
import { PROJECTION_YEARS } from './config/policy.config';
import { CHART_COLORS } from './config/theme.config';
import { toScenario } from './lib/adapter';
import { simulate } from './lib/simulate';
import { analyzeLeverage } from './lib/leverage';
import { Header } from './components/layout/Header';
import { Card } from './components/ui/Card';
import { BasicInfoForm } from './components/forms/BasicInfoForm';
import { ScenarioForm } from './components/forms/ScenarioForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { ComparisonSummary } from './components/comparison/ComparisonSummary';

const TARGET_YEAR = PROJECTION_YEARS[PROJECTION_YEARS.length - 1];

export default function App() {
  const basicForm = useForm<BasicInfo>({ defaultValues: DEFAULT_BASIC, mode: 'onChange' });
  const formA = useForm<ScenarioConfig>({ defaultValues: makeScenarioConfig('시나리오 A', 'purchase'), mode: 'onChange' });
  const formB = useForm<ScenarioConfig>({ defaultValues: makeScenarioConfig('시나리오 B', 'jeonse'), mode: 'onChange' });
  const [comparison, setComparison] = useState(false);

  const basic = basicForm.watch();
  const scA = formA.watch();
  const scB = formB.watch();

  const resultA = useMemo(() => simulate(toScenario(basic, scA)), [basic, scA]);
  const leverageA = useMemo(() => analyzeLeverage(toScenario(basic, scA), TARGET_YEAR), [basic, scA]);
  const resultB = useMemo(() => simulate(toScenario(basic, scB)), [basic, scB]);
  const leverageB = useMemo(() => analyzeLeverage(toScenario(basic, scB), TARGET_YEAR), [basic, scB]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header comparison={comparison} onToggle={() => setComparison((v) => !v)} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Card title="공통 기본정보 (시나리오 A·B 공유)">
          <FormProvider {...basicForm}>
            <BasicInfoForm />
          </FormProvider>
        </Card>

        {comparison ? (
          <>
            <ComparisonSummary resultA={resultA} resultB={resultB} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-primary-700">시나리오 A</h2>
                <FormProvider {...formA}>
                  <ScenarioForm basic={basic} />
                </FormProvider>
                <Dashboard result={resultA} leverage={leverageA} accent={CHART_COLORS.A} />
              </div>
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-success-600">시나리오 B</h2>
                <FormProvider {...formB}>
                  <ScenarioForm basic={basic} />
                </FormProvider>
                <Dashboard result={resultB} leverage={leverageB} accent={CHART_COLORS.B} />
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
            <aside>
              <FormProvider {...formA}>
                <ScenarioForm basic={basic} />
              </FormProvider>
            </aside>
            <main>
              <Dashboard result={resultA} leverage={leverageA} accent={CHART_COLORS.A} />
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
