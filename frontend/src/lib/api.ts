import { getInitData } from './telegram';

const BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Ошибка запроса (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export interface MetaResponse {
  shopName: string;
  managerUsername: string;
  robuxRateUah: number;
  minOrderRobux: number;
  listingMarkup: number;
}

export interface PriceCalculation {
  robuxAmount: number;
  priceUah: number;
  listingPrice: number;
}

export interface Order {
  id: number;
  public_id: string;
  robux_amount: number;
  price_uah: number;
  listing_price: number;
  nickname: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Review {
  id: number;
  name: string;
  avatar_url: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface PublicStats {
  completedOrders: number;
  clients: number;
  avgProcessingMinutes: number | null;
  totalRobuxSold: number;
  avgRating: number | null;
  reviewsCount: number;
}

export interface ProfileData {
  id: number;
  username: string | null;
  firstName: string | null;
  totalRobuxBought: number;
  ordersCount: number;
}

export const api = {
  getMeta: () => request<MetaResponse>('/meta'),
  getStats: () => request<PublicStats>('/stats'),
  getProfile: () => request<ProfileData>('/profile'),
  calculate: (robuxAmount: number) =>
    request<PriceCalculation>('/orders/calculate', {
      method: 'POST',
      body: JSON.stringify({ robuxAmount }),
    }),
  createOrder: (robuxAmount: number) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ robuxAmount }),
    }),
  submitNickname: (publicId: string, nickname: string) =>
    request(`/orders/${publicId}/nickname`, {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    }),
  getReviews: () => request<Review[]>('/reviews'),
  submitReview: (data: { name: string; rating: number; comment: string }) =>
    request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  admin: {
    stats: () =>
      request<{ ordersToday: number; ordersTotal: number; robuxTotal: number; revenueTotal: number }>(
        '/admin/stats',
      ),
    orders: (params: { search?: string; status?: string }) => {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.status) qs.set('status', params.status);
      return request<Order[]>(`/admin/orders?${qs.toString()}`);
    },
    reviews: () => request<AdminReview[]>('/admin/reviews'),
    approveReview: (id: number) =>
      request(`/admin/reviews/${id}/approve`, { method: 'POST' }),
    rejectReview: (id: number) =>
      request(`/admin/reviews/${id}/reject`, { method: 'POST' }),
  },
};

export interface AdminReview extends Review {
  approved: number;
}
