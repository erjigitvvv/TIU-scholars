'use client';

import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

export default function FacultyFilterSelect({ activeCode, options, placeholder }) {
  const router = useRouter();

  return (
    <div className="w-full sm:w-80">
      <CustomSelect
        value={activeCode || ''}
        onChange={(code) => {
          if (code) {
            router.push(`/faculties?code=${encodeURIComponent(code)}`);
          } else {
            router.push('/faculties');
          }
        }}
        options={options}
        placeholder={placeholder}
        icon={Building2}
      />
    </div>
  );
}
