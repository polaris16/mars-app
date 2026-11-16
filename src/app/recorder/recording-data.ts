export interface SavedRecording {
  id: string;
  title: string;
  time: string;
  duration: string;
  quality: string;
  uri: string;
}

// Mock response shape for the future recordings API.
let recordings: SavedRecording[] = [
  { id: 'mock-1', title: '未命名', time: '今天 14:20', duration: '01:42', quality: '48 kHz', uri: '' },
  { id: 'mock-2', title: '生活碎片 · 街角咖啡馆偶遇', time: '今天 09:30', duration: '00:58', quality: '48 kHz', uri: '' },
  { id: 'mock-3', title: '阅读笔记 · 《设计心理学》读后感', time: '5月12日', duration: '03:20', quality: '48 kHz', uri: '' },
];

export const getRecordings = () => recordings;

export const saveRecording = (recording: SavedRecording) => {
  recordings = [recording, ...recordings.filter(item => item.id !== recording.id)];
};

export const renameRecording = (id: string, title: string) => {
  recordings = recordings.map(item => item.id === id ? { ...item, title } : item);
};
