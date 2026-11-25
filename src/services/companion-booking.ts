import type { CompanionAvailability } from '@/constants/companions';

export type BookingAddress = {
  name?: string;
  detail: string;
};

export type CompanionBooking = {
  start: number;
  end: number;
  address: BookingAddress;
  note: string;
};

export type BookingSlot = {
  start: number;
  end: number;
  period: '上午时段' | '下午时段' | '晚间深度倾听';
  unavailableReason?: string;
};

const firstAvailableDay = { 今日可约: 0, 可约明天: 1, 可约本周: 2 };
const timeZone = 'Asia/Shanghai';
const beijingOffset = 8 * 60 * 60 * 1000;
const dayFormat = new Intl.DateTimeFormat('zh-CN', { timeZone, month: 'long', day: 'numeric', weekday: 'short' });
const weekdayFormat = new Intl.DateTimeFormat('zh-CN', { timeZone, weekday: 'short' });
const timeFormat = new Intl.DateTimeFormat('zh-CN', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

const slotTemplates = [
  { hour: 10, minute: 0, period: '上午时段', reserved: false },
  { hour: 11, minute: 10, period: '上午时段', reserved: true },
  { hour: 14, minute: 30, period: '下午时段', reserved: false },
  { hour: 16, minute: 0, period: '下午时段', reserved: false },
  { hour: 20, minute: 0, period: '晚间深度倾听', reserved: false },
] as const;

export const serviceAddress: BookingAddress = {
  name: '中国建设银行和平支行业务部',
  detail: '沈阳市和平区南京北街158号中国建设银行和平支行业务部一楼“银发温暖驿站”',
};

export function getBookingDays(availability: CompanionAvailability, now = Date.now()) {
  const beijingDate = new Date(now + beijingOffset);
  const beijingMidnight = Date.UTC(beijingDate.getUTCFullYear(), beijingDate.getUTCMonth(), beijingDate.getUTCDate());

  return Array.from({ length: 5 }, (_, index) => {
    const day = new Date(beijingMidnight);
    day.setUTCDate(day.getUTCDate() + index);
    const dateKey = day.getTime() - beijingOffset;
    const slots: BookingSlot[] = slotTemplates.map(template => {
      const start = dateKey + (template.hour * 60 + template.minute) * 60_000;
      let unavailableReason: string | undefined;
      if (start <= now) unavailableReason = '时段已过';
      else if (index < firstAvailableDay[availability]) unavailableReason = '不可约';
      else if (template.reserved) unavailableReason = '已被预约';
      return { start, end: start + 50 * 60_000, period: template.period, unavailableReason };
    });

    return {
      dateKey,
      title: ['今天', '明天', '后天'][index] ?? weekdayFormat.format(dateKey),
      dateLabel: `${String(day.getUTCMonth() + 1).padStart(2, '0')}/${String(day.getUTCDate()).padStart(2, '0')}`,
      slots,
      availableCount: slots.filter(slot => !slot.unavailableReason).length,
    };
  });
}

export function formatSlotTime(start: number, end: number) {
  return `${timeFormat.format(start)}–${timeFormat.format(end)}`;
}

export function formatBookingTime(booking: CompanionBooking) {
  return `${dayFormat.format(booking.start)} ${formatSlotTime(booking.start, booking.end)}`;
}
