import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export type Benefit = {
  id: string;
  title: string;
  description: string;
  used?: boolean;
};

export type BenefitManager = {
  name: string;
  role: string;
  description: string;
};

export type BenefitPlan = {
  id: string;
  institution: string;
  title: string;
  benefits: Benefit[];
  managers: BenefitManager[];
};

export const demoBenefitPlans: readonly BenefitPlan[] = [
  {
    id: 'taikang', institution: '泰康之家', title: '康养尊享计划',
    benefits: [
      { id: 'memoir-1', title: '回忆录整理', description: '整理过往美好回忆 · 智能语音采写' },
      { id: 'memoir-2', title: '回忆录整理', description: '人生故事撰编与排版精修', used: true },
    ],
    managers: [
      { name: '顾清池', role: '客户总监', description: '5 年企业康养规划经验' },
      { name: '苏曼琳', role: '家庭顾问', description: '4 年长者身心陪护服务' },
    ],
  },
  {
    id: 'citic', institution: '中信信托', title: '家庭传承计划',
    benefits: [
      { id: 'family-story', title: '家庭故事采集', description: '用语音记录家人的故事' },
    ],
    managers: [],
  },
  {
    id: 'crland', institution: '华润置地', title: '生活留声计划',
    benefits: [
      { id: 'community-story', title: '社区故事采集', description: '记录邻里故事与日常片段' },
      { id: 'life-story', title: '生活回忆整理', description: '用声音留住印象深刻的时刻' },
    ],
    managers: [],
  },
];

export const demoServiceCode = 'MEIKE-DEMO';
export const demoCodePlan: BenefitPlan = {
  id: 'meike-demo', institution: '美刻体验', title: '声音记录体验计划',
  benefits: [
    { id: 'voice-demo', title: '声音记录体验', description: '录下一个想留住的故事' },
  ],
  managers: [],
};

function bindingKey(accountId: string) {
  const suffix = Array.from(accountId, character => character.codePointAt(0)?.toString(16)).join('-');
  return `mars-benefits-demo-${suffix}`;
}

export async function loadDemoBinding(accountId: string): Promise<boolean> {
  const key = bindingKey(accountId);
  if (Platform.OS === 'web') return globalThis.localStorage.getItem(key) === '1';

  const file = new File(Paths.document, `${key}.txt`);
  return file.exists && await file.text() === '1';
}

export function saveDemoBinding(accountId: string) {
  const key = bindingKey(accountId);
  if (Platform.OS === 'web') {
    globalThis.localStorage.setItem(key, '1');
    return;
  }

  const file = new File(Paths.document, `${key}.txt`);
  if (!file.exists) file.create();
  file.write('1');
}
