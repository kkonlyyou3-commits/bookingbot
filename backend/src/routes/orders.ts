import { Router } from 'express';
import { z } from 'zod';
import { calculatePrice, getMinOrderRobux } from '../utils/pricing';
import { upsertUser } from '../db/users';
import { createOrder, setNickname, getOrderByPublicId } from '../db/orders';
import { notifyAdminNewOrder } from '../bot';

export const ordersRouter = Router();

const calculateSchema = z.object({
  robuxAmount: z.number().positive(),
});

ordersRouter.post('/calculate', (req, res) => {
  const parsed = calculateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректное количество Robux' });
    return;
  }

  const { robuxAmount } = parsed.data;
  const minOrder = getMinOrderRobux();
  if (robuxAmount < minOrder) {
    res.status(400).json({ error: `Минимальный заказ — ${minOrder} Robux` });
    return;
  }

  res.json(calculatePrice(robuxAmount));
});

const createOrderSchema = z.object({
  robuxAmount: z.number().positive(),
});

ordersRouter.post('/', (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные данные заказа' });
    return;
  }

  const telegramUser = req.telegramUser;
  if (!telegramUser) {
    res.status(401).json({ error: 'Не удалось определить пользователя Telegram' });
    return;
  }

  const { robuxAmount } = parsed.data;
  const minOrder = getMinOrderRobux();
  if (robuxAmount < minOrder) {
    res.status(400).json({ error: `Минимальный заказ — ${minOrder} Robux` });
    return;
  }

  const user = upsertUser({
    telegramId: telegramUser.id,
    username: telegramUser.username,
    firstName: telegramUser.first_name,
  });

  const { priceUah, listingPrice } = calculatePrice(robuxAmount);

  const order = createOrder({
    userId: user.id,
    telegramId: user.telegram_id,
    username: user.username,
    robuxAmount,
    priceUah,
    listingPrice,
  });

  res.status(201).json(order);
});

const nicknameSchema = z.object({
  nickname: z.string().trim().min(1).max(64),
});

ordersRouter.post('/:publicId/nickname', async (req, res) => {
  const order = getOrderByPublicId(req.params.publicId);
  if (!order) {
    res.status(404).json({ error: 'Заказ не найден' });
    return;
  }

  const parsed = nicknameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Введите корректный ник' });
    return;
  }

  setNickname(order.id, parsed.data.nickname);

  try {
    await notifyAdminNewOrder({
      publicId: order.public_id,
      username: order.username,
      telegramId: order.telegram_id,
      robuxAmount: order.robux_amount,
      priceUah: order.price_uah,
      listingPrice: order.listing_price,
      nickname: parsed.data.nickname,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Не удалось уведомить админа:', err);
  }

  res.json({ ok: true });
});

ordersRouter.get('/:publicId', (req, res) => {
  const order = getOrderByPublicId(req.params.publicId);
  if (!order) {
    res.status(404).json({ error: 'Заказ не найден' });
    return;
  }
  res.json(order);
});
