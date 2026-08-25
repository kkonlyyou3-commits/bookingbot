import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { RobuxButton } from '../components/RobuxButton';
import { api, Order } from '../lib/api';

export default function NicknameStep() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = (location.state as { order?: Order } | null)?.order;
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!order) {
    return (
      <div className="p-5">
        <p className="text-white/60">Заказ не найден. Начните заново.</p>
        <div className="mt-4">
          <RobuxButton onClick={() => navigate('/buy')}>Вернуться к покупке</RobuxButton>
        </div>
      </div>
    );
  }

  async function handleSubmit() {
    if (!order) return;
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('Введите ваш ник');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.submitNickname(order.public_id, trimmed);
      navigate('/buy/success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отправить заказ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Ваш ник" subtitle="Шаг 2 из 2" />

      <div className="px-5 space-y-4">
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-white/50">К оплате</p>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-3 text-4xl font-black robux-text"
          >
            {order.robux_amount} Robux
          </motion.p>
          <p className="mt-2 text-xs text-white/30">Заказ №{order.public_id}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <label className="text-xs uppercase tracking-wide text-white/40">
            Введите ваш ник
          </label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ваш ник"
            className="mt-2 w-full bg-transparent text-2xl font-bold outline-none placeholder:text-white/20"
          />
        </GlassCard>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <RobuxButton onClick={handleSubmit} disabled={!nickname.trim() || submitting}>
          {submitting ? 'Отправка…' : 'Отправить'}
        </RobuxButton>
      </div>
    </div>
  );
}
