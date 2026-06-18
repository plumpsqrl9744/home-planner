import { useFormContext, useWatch, Controller } from 'react-hook-form';
import type { BasicInfo, HousingType, ScenarioConfig } from '../../types/domain';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Slider } from '../ui/Slider';
import { FormNumberInput } from '../ui/form/FormNumberInput';
import { HOUSING_LABELS, defaultHousing } from '../../config/defaults.config';
import { FIELD_HELP } from '../../config/fieldHelp.config';
import { POLICY } from '../../config/policy.config';
import { calcPurchaseLoan } from '../../lib/loan';
import { toScenario } from '../../lib/adapter';
import { formatKRW } from '../../lib/format';

const HOUSING_OPTIONS = (Object.keys(HOUSING_LABELS) as HousingType[]).map((t) => ({
  value: t,
  label: HOUSING_LABELS[t],
}));

const LOAN_STEP = 1_000_000; // 100만원 단위

export function HousingForm({ basic }: { basic: BasicInfo }) {
  const { control, setValue } = useFormContext<ScenarioConfig>();
  const housing = useWatch({ control, name: 'housing' });

  return (
    <div className="space-y-4">
      <SegmentedControl
        value={housing.type}
        options={HOUSING_OPTIONS}
        onChange={(t) => setValue('housing', defaultHousing(t as HousingType), { shouldDirty: true })}
      />

      {housing.type === 'happy' && (
        <div className="grid grid-cols-2 gap-3">
          <FormNumberInput control={control} name="housing.deposit" label="보증금 (만원)" help={FIELD_HELP.happyDeposit} unit="manwon" step={100} />
          <FormNumberInput control={control} name="housing.monthlyRent" label="월세 (만원)" help={FIELD_HELP.monthlyRent} unit="manwon" step={1} />
          <FormNumberInput control={control} name="housing.managementFee" label="관리비 (만원)" help={FIELD_HELP.managementFee} unit="manwon" step={1} />
        </div>
      )}

      {housing.type === 'jeonse' && (
        <div className="grid grid-cols-2 gap-3">
          <FormNumberInput control={control} name="housing.deposit" label="전세 보증금 (만원)" help={FIELD_HELP.jeonseDeposit} unit="manwon" step={100} />
          <FormNumberInput control={control} name="housing.loanLimit" label="전세자금대출 한도 (만원)" help={FIELD_HELP.loanLimit} unit="manwon" step={100} />
          <FormNumberInput control={control} name="housing.loanRate" label="전세대출 금리 (%)" help={FIELD_HELP.jeonseLoanRate} unit="percent" step={0.1} />
          <FormNumberInput control={control} name="housing.managementFee" label="관리비 (만원)" help={FIELD_HELP.managementFee} unit="manwon" step={1} />
        </div>
      )}

      {housing.type === 'purchase' && (
        <PurchaseFields basic={basic} />
      )}
    </div>
  );
}

function PurchaseFields({ basic }: { basic: BasicInfo }) {
  const { control } = useFormContext<ScenarioConfig>();
  const housing = useWatch({ control, name: 'housing' });
  const policy = useWatch({ control, name: 'policy' });
  if (housing.type !== 'purchase') return null;

  // 현재 입력 기준 대출 상한과 남은 투자현금을 즉시 계산해 슬라이더 아래에 표시
  const scenario = toScenario(basic, { label: '', housing, policy });
  const { maxLoan } = calcPurchaseLoan(housing, scenario.common, policy);
  const finalLoan = Math.min(housing.desiredLoan, maxLoan);
  const acquisitionCost = housing.price * POLICY.acquisitionCostRate;
  const initialCash = housing.price - finalLoan + acquisitionCost;
  const investCash = basic.cash - initialCash;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormNumberInput control={control} name="housing.price" label="주택 가격 (만원)" help={FIELD_HELP.price} unit="manwon" step={100} />
        <FormNumberInput control={control} name="housing.loanRate" label="주담대 금리 (%)" help={FIELD_HELP.purchaseLoanRate} unit="percent" step={0.1} />
        <FormNumberInput control={control} name="housing.loanMaturityYears" label="대출 만기 (년)" help={FIELD_HELP.loanMaturityYears} unit="plain" step={1} />
        <FormNumberInput control={control} name="housing.managementFee" label="관리비 (만원)" help={FIELD_HELP.managementFee} unit="manwon" step={1} />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 space-y-2">
        <Controller
          control={control}
          name="housing.desiredLoan"
          render={({ field }) => (
            <Slider
              label="대출 받을 금액"
              help={FIELD_HELP.desiredLoan}
              value={Math.min(Number(field.value) || 0, maxLoan)}
              min={0}
              max={maxLoan}
              step={LOAN_STEP}
              valueLabel={formatKRW(finalLoan)}
              onChange={field.onChange}
            />
          )}
        />
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400">최대 대출 가능 {formatKRW(maxLoan)}</span>
          <span className={investCash >= 0 ? 'text-success-600 font-medium' : 'text-danger-600 font-medium'}>
            {investCash >= 0 ? `남은 투자 현금 ${formatKRW(investCash)}` : `자금 부족 ${formatKRW(-investCash)}`}
          </span>
        </div>
      </div>
    </div>
  );
}
