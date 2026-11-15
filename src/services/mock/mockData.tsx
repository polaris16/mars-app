import {
    LoginSession,
    User,
    UserRole,
} from '@/store/AuthContext';

// 模拟登录账号
export const MOCK_ACCOUNT = {
  username: 'admin',
  password: '123456',
};

// 模拟用户
export const MOCK_USER: User = {
  id: '10001',
  nickname: '测试用户',
  avatar: '',
  profileCompleted: false,
  interestsCompleted: false,
  interests: [],
};

// 模拟角色
export const MOCK_ROLES: UserRole[] = [
  {
    id: 'role_001',
    name: '管理员',
    description: '系统管理与用户管理',
  },
  {
    id: 'role_002',
    name: '普通用户',
    description: '使用应用的基础功能',
  },
];

// 模拟登录接口
export async function mockLogin(
  username: string,
  password: string
): Promise<LoginSession> {
  // 模拟网络请求延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  if (
    username !== MOCK_ACCOUNT.username ||
    password !== MOCK_ACCOUNT.password
  ) {
    throw new Error('用户名或密码错误');
  }

  return {
    token: 'mock-access-token-10001',
    user: { ...MOCK_USER },
    roles: MOCK_ROLES,
  };
}

// 模拟恢复用户会话接口
export async function mockLoadSession(token: string) {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (token !== 'mock-access-token-10001') {
    throw new Error('Token 无效');
  }

  return {
    user: { ...MOCK_USER },
    roles: MOCK_ROLES,
  };
}