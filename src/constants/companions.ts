import type { ImageSource } from 'expo-image';

export type CompanionTopic = '应用心理' | '数码达人' | '生活纪实';
export type CompanionAvailability = '今日可约' | '可约明天' | '可约本周';

export type CompanionFeedback = {
  author: string;
  context: string;
  message: string;
};

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
  message: string;
  profile?: {
    portrait: ImageSource | number;
    hours: string;
    reviews: string;
    skills: string[];
    feedback: CompanionFeedback[];
  };
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
    message: '我喜欢听大家讲过去的故事。我们可以从一张老照片聊起，把记得的片段慢慢整理下来。',
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
    message: '特别期待听爷爷奶奶讲讲当年的故事，向您请教人生经历；手机使用或生活琐事有任何需要，我都耐心帮您解决。愿做您身边最贴心、最可靠的青年伙伴！',
    profile: {
      portrait: require('@/assets/images/companions/chen-zhe-profile.jpg'),
      hours: '3,800+h',
      reviews: '216 条反馈',
      skills: ['情绪压力疏导', '前沿资讯科普', '智能手机教学', '陪伴倾听唠嗑', '生活节律调适'],
      feedback: [
        {
          author: '张爷爷',
          context: '已畅聊 5 次 · 3 天前',
          message: '小陈这孩子特别有耐心！手把手教我怎么用智能手机挂号和用微信看报纸，一遍遍教从不嫌我慢。还给我讲了现在年轻人聊的人工智能和大模型，让我这老头子也跟上了时代，太舒心了！',
        },
        {
          author: '李奶奶',
          context: '72 岁 · 1 周前',
          message: '平时孩子们工作忙，小陈上门陪我翻着旧相册唠当年的往事，听得可认真了，还帮我把老花镜和手机字体都调得大大的。和他聊完一上午，心里热乎乎的，下周还要约他一起唠唠。',
        },
      ],
    },
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
    message: '您可以用习惯的方言慢慢说。我愿意听您聊日常，也陪您一起梳理心里放不下的事情。',
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
    message: '想给照片调调颜色，或者把几张老照片做成一组相册？我们可以一起动手。',
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
    message: '我喜欢读书，也喜欢听不同地方的生活故事。有想读的书或想聊的地方，欢迎告诉我。',
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
    message: '我愿意陪您聊聊日常，也可以一起把想做的小事列出来，从容易的一件开始。',
  },
];

export type { Companion };
