import { MessageCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { RobuxButton } from '../components/RobuxButton';
import { useEffect, useState } from 'react';
import { api, MetaResponse } from '../lib/api';

export default function Support() {
  const [meta, setMeta] = useState<MetaResponse | null>(null);

  useEffect(() => {
    api.getMeta().then(setMeta).catch(() => undefined);
  }, []);

  const username = meta?.managerUsername ?? 'expshopgold';

  return (
    <div>
      <PageHeader title="Поддержка" />

      <div className="px-5">
        <GlassCard className="flex flex-col items-center p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-robux-gradient text-base-950">
            <MessageCircle size={28} />
          </div>
          <p className="mt-4 text-sm text-white/50">Менеджер</p>
          <p className="text-xl font-bold robux-text">@{username}</p>

          <div className="mt-6 w-full">
            <RobuxButton onClick={() => window.open(`https://t.me/${username}`, '_blank')}>
              Написать менеджеру
            </RobuxButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
