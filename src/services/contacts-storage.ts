import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { initialContactDirectory, type ContactDirectory } from './contacts';

function storageName(accountId: string) {
  const suffix = Array.from(accountId, character => character.codePointAt(0)?.toString(16)).join('-');
  return `mars-contacts-${suffix}`;
}

export async function loadContactDirectory(accountId: string): Promise<ContactDirectory> {
  const key = storageName(accountId);
  let stored: string | null;
  if (Platform.OS === 'web') {
    stored = globalThis.localStorage.getItem(key);
  } else {
    const file = new File(Paths.document, `${key}.json`);
    stored = file.exists ? await file.text() : null;
  }

  if (stored === null) return initialContactDirectory(__DEV__);

  const directory: ContactDirectory = JSON.parse(stored);
  if (directory?.version !== 1 || !Array.isArray(directory.contacts) || !Array.isArray(directory.requests)) {
    throw new Error('联系人数据格式无效。');
  }
  return directory;
}

export function saveContactDirectory(accountId: string, directory: ContactDirectory) {
  const key = storageName(accountId);
  const contents = JSON.stringify(directory);
  if (Platform.OS === 'web') {
    globalThis.localStorage.setItem(key, contents);
    return;
  }
  const file = new File(Paths.document, `${key}.json`);
  if (!file.exists) file.create();
  file.write(contents);
}
