import { pinyin } from 'pinyin-pro';

export type Contact = {
  id: string;
  note: string;
  starred?: boolean;
  tag?: string;
} & ({ name: string; phone?: string } | { name?: never; phone: string });

export type ContactDirectory = {
  version: 1;
  contacts: Contact[];
  requests: Contact[];
};

export type ContactRequestItem = Contact & { requestId: number };

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#';

export function getContactLabel(contact: Contact) {
  return contact.name ?? contact.phone;
}

export function normalizeContactPhone(input: string) {
  const phone = input.normalize('NFKC').replace(/[\s()-]/g, '');
  return /^(?:\+[1-9]\d{6,14}|\d{7,15})$/.test(phone) ? phone : null;
}

function normalizeSearch(value: string) {
  return value.normalize('NFKD').replace(/\p{Mark}|[^\p{Letter}\p{Number}]/gu, '').toLowerCase();
}

export function indexName(name: string) {
  const syllables = pinyin(name, { type: 'array', toneType: 'none', surname: 'head', nonZh: 'consecutive' });
  const romanized = normalizeSearch(syllables.join(''));
  return {
    letter: /^[a-z]/.test(romanized) ? romanized[0].toUpperCase() : '#',
    romanized,
    initials: normalizeSearch(syllables.map(syllable => syllable.trim()[0] ?? '').join('')),
  };
}

export function organizeContacts(directory: ContactDirectory, query: string) {
  const search = normalizeSearch(query);
  const indexed = directory.contacts.map(contact => {
    const label = getContactLabel(contact);
    return { contact, label, ...indexName(label) };
  });
  const matching = indexed.filter(({ contact, label, romanized, initials }) => (
    normalizeSearch(`${label} ${contact.note}`).includes(search)
    || (contact.phone && normalizeSearch(contact.phone).includes(search))
    || romanized.includes(search) || initials.includes(search)
  ));
  matching.sort((a, b) => a.romanized.localeCompare(b.romanized) || a.label.localeCompare(b.label));

  const contacts = matching.map(({ contact }) => contact);
  const sections = Array.from(letters, letter => ({
    letter,
    contacts: matching.filter(entry => entry.letter === letter).map(({ contact }) => contact),
  })).filter(section => section.contacts.length > 0);

  return { contacts, sections, starred: contacts.filter(contact => contact.starred) };
}

export function createContactId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function initialContactDirectory(demo: boolean): ContactDirectory {
  if (!demo) return { version: 1, contacts: [], requests: [] };

  return {
    version: 1,
    contacts: [
      { id: 'demo-ann', name: '林若安 Ann', note: '设计总监 · 在克制中寻找诗意', starred: true },
      { id: 'demo-chen', name: '陈柏言', note: '专注前端与交互原型探索', starred: true },
      { id: 'demo-evan', name: '阿文 (Evan)', note: '移动架构 · 灰度发版中' },
      { id: 'demo-alex', name: 'Alex Zhang', note: '杭州 · 自由独立摄影师' },
      { id: 'demo-bai', name: '白羽', note: '咖啡豆烘焙研究员 ☕' },
      { id: 'demo-bob', name: 'Bob 运维支持', note: '有事请随时联系' },
      { id: 'demo-claire', name: '程曦 Claire', note: '周末只在美术馆' },
      { id: 'demo-li', name: '李明阳', note: '开源计划维护者' },
      { id: 'demo-lucas', name: 'Lucas', note: '知识产权与合规咨询' },
      { id: 'demo-wang', name: '王小猫', note: '猫咪和阳光不可辜负 🐾' },
      { id: 'demo-zhang', name: '张恒', note: '出差深圳中 · 暂缓回复' },
    ],
    requests: [
      { id: 'demo-tang', name: '唐可', note: '你好，想认识你。' },
      { id: 'demo-xu', name: '许舟', note: '很高兴认识你。' },
      { id: 'demo-zhou', name: '周晓', note: '喜欢记录生活里的声音。' },
    ],
  };
}
