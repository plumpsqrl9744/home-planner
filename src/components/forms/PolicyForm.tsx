import { useFormContext, useWatch } from 'react-hook-form';
import type { ScenarioConfig } from '../../types/domain';
import { FormSelect } from '../ui/form/FormSelect';
import { FormCheckbox } from '../ui/form/FormCheckbox';
import { Badge } from '../ui/Badge';
import { DISTRICTS, getDistrict } from '../../config/districts.config';
import { POLICY } from '../../config/policy.config';
import { FIELD_HELP } from '../../config/fieldHelp.config';
import { formatPercent } from '../../lib/format';

const DISTRICT_OPTIONS = DISTRICTS.map((d) => ({ value: d.code, label: d.name }));

export function PolicyForm() {
  const { control } = useFormContext<ScenarioConfig>();
  const housingType = useWatch({ control, name: 'housing.type' });
  const districtCode = useWatch({ control, name: 'policy.districtCode' });
  const district = getDistrict(districtCode);
  const stressAdd = formatPercent(POLICY.stressRateAdd);

  return (
    <div className="space-y-4">
      <FormSelect control={control} name="policy.districtCode" label="자치구" help={FIELD_HELP.district} options={DISTRICT_OPTIONS} />
      <div className="flex flex-wrap gap-2">
        <Badge tone={district.regulated ? 'danger' : 'success'}>
          {district.regulated ? '규제지역' : '비규제지역'}
        </Badge>
        {district.landTransactionPermit && <Badge tone="danger">토지거래허가구역</Badge>}
      </div>
      {housingType === 'purchase' && (
        <div className="space-y-3 pt-1">
          <FormCheckbox
            control={control}
            name="policy.isFirstHome"
            label="생애최초 주택구매"
            help={FIELD_HELP.isFirstHome}
            description="체크 시 비규제 LTV 80% 적용(규제지역은 한도 별도)"
          />
          <FormCheckbox
            control={control}
            name="policy.stressDsr"
            label="스트레스 DSR 적용"
            help={FIELD_HELP.stressDsr}
            description={`심사 금리 +${stressAdd} 가산하여 대출 한도 축소`}
          />
        </div>
      )}
    </div>
  );
}
