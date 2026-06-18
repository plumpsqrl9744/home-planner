import { useFormContext } from 'react-hook-form';
import type { BasicInfo } from '../../types/domain';
import { FormNumberInput } from '../ui/form/FormNumberInput';
import { FIELD_HELP } from '../../config/fieldHelp.config';

/** 공통 기본정보 폼. 시나리오 A/B가 공유한다. */
export function BasicInfoForm() {
  const { control } = useFormContext<BasicInfo>();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <FormNumberInput control={control} name="cash" label="보유 현금 (만원)" help={FIELD_HELP.cash} unit="manwon" step={100} />
      <FormNumberInput control={control} name="annualIncome" label="부부합산 연소득 (만원)" help={FIELD_HELP.annualIncome} unit="manwon" step={100} />
      <FormNumberInput control={control} name="monthlyLiving" label="월 생활비 (만원)" help={FIELD_HELP.monthlyLiving} unit="manwon" step={10} />
      <FormNumberInput control={control} name="creditLoan" label="기존 신용대출 (만원)" help={FIELD_HELP.creditLoan} unit="manwon" step={100} />
      <FormNumberInput control={control} name="etfReturnRate" label="ETF 연수익률 (%)" help={FIELD_HELP.etfReturnRate} unit="percent" step={0.5} />
      <FormNumberInput control={control} name="realEstateGrowthRate" label="부동산 연상승률 (%)" help={FIELD_HELP.realEstateGrowthRate} unit="percent" step={0.5} />
    </div>
  );
}
