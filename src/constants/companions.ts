import type { ImageSource } from 'expo-image';

export type CompanionTopic = '应用心理' | '数码达人' | '生活纪实';
export type CompanionAvailability = '今日可约' | '可约明天' | '可约本周';

type Companion = {
  id: string;
  name: string;
  portrait: ImageSource | number;
  role: string;
  description: string;
  skills: string[];
  topics: CompanionTopic[];
  availability: CompanionAvailability;
  rating: number;
  reviews: string;
};

export const companions: readonly Companion[] = [
  {
    id: 'lin-siqi',
    name: '林思齐',
    portrait: require('@/assets/images/companions/lin-siqi.jpg'),
    role: '硕士在读',
    description: '应用心理学 · 人形小太阳',
    skills: ['前沿资讯', '回忆录整理'],
    topics: ['应用心理', '生活纪实'],
    availability: '今日可约',
    rating: 5,
    reviews: '120+',
  },
  {
    id: 'chen-zhe',
    name: '陈哲',
    portrait: require('@/assets/images/companions/chen-zhe.jpg'),
    role: '硕士在读',
    description: '社会学系',
    skills: ['手机教学', '日常陪伴'],
    topics: ['数码达人'],
    availability: '可约明天',
    rating: 5,
    reviews: '120+',
  },
  {
    id: 'wen-wan',
    name: '温婉',
    portrait: require('@/assets/images/companions/wen-wan.jpg'),
    role: '教育学本科',
    description: '擅长倾听与陪伴',
    skills: ['方言倾听', '心事疏导'],
    topics: ['应用心理'],
    availability: '今日可约',
    rating: 4.9,
    reviews: '98次',
  },
  {
    id: 'su-jian',
    name: '苏简',
    portrait: require('@/assets/images/companions/su-jian.jpg'),
    role: '数媒艺术',
    description: '数字媒体艺术 · 创意生活家',
    skills: ['时尚热梗', '手机修图'],
    topics: ['数码达人'],
    availability: '可约本周',
    rating: 5,
    reviews: '120+',
  },
  {
    id: 'han-yi',
    name: '韩逸',
    portrait: require('@/assets/images/companions/han-yi.jpg'),
    role: '国贸专业',
    description: '国际贸易专业 · 阅历分享官',
    skills: ['世界风土', '深度阅读'],
    topics: ['生活纪实'],
    availability: '今日可约',
    rating: 4.9,
    reviews: '85次',
  },
  {
    id: 'zhang-mengyao',
    name: '张梦瑶',
    portrait: require('@/assets/images/companions/zhang-mengyao.jpg'),
    role: '健康管理',
    description: '健康管理与心理 · 贴心陪伴',
    skills: ['健康常识', '日常杂谈'],
    topics: ['应用心理', '生活纪实'],
    availability: '可约明天',
    rating: 4.9,
    reviews: '62次',
  },
];

export type { Companion };
