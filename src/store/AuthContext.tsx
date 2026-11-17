
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import * as SecureStore from 'expo-secure-store';
import type { LoginSession, User, UserRole } from '@/types/user';

export type { LoginSession, User, UserRole } from '@/types/user';

// ================================
// 1. 类型定义
// ================================

interface AuthContextType {
  // 初始化状态
  initialized: boolean;

  // 登录状态
  token: string | null;
  user: User | null;

  // 角色信息
  roles: UserRole[];
  currentRole: UserRole | null;

  // 登录
  login: (session: LoginSession) => Promise<void>;

  // 更新用户信息
  updateUser: (user: Partial<User>) => void;

  // 完成基础资料
  completeBasicInfo: (
    data: Partial<User>
  ) => void;

  // 完成兴趣标签
  completeInterests: (
    interests: string[]
  ) => void;

  // 选择角色
  selectRole: (role: UserRole) => void;

  // 退出登录
  logout: () => Promise<void>;
}

// ================================
// 2. 创建 Context
// ================================

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const TOKEN_KEY = 'access_token';
const SESSION_KEY = 'auth_session';

function normalizeUser(user?: Partial<User> | null): User | null {
  if (!user) return null;

  return {
    id: user.id ?? 'unknown-user',
    nickname: user.nickname ?? '新用户',
    avatar: user.avatar ?? '',
    gender: user.gender,
    birthday: user.birthday,
    interests: user.interests ?? [],
    profileCompleted: Boolean(user.profileCompleted),
    interestsCompleted: Boolean(user.interestsCompleted),
  };
}

// ================================
// 3. Provider
// ================================

interface AuthProviderProps {
  children: React.ReactNode;

  // 可接入后端会话恢复接口
  loadSession?: (token: string) => Promise<{
    user: User;
    roles: UserRole[];
  }>;
}

export function AuthProvider({
  children,
  loadSession,
}: AuthProviderProps) {
  const [initialized, setInitialized] = useState(false);

  const [token, setToken] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);

  const [roles, setRoles] = useState<UserRole[]>([]);

  const [currentRole, setCurrentRole] =
    useState<UserRole | null>(null);

  const persistSession = useCallback(
    async (
      nextToken: string | null,
      nextUser: User | null,
      nextRoles: UserRole[],
      nextCurrentRoleId?: string | null
    ) => {
      if (!nextToken || !nextUser) {
        return;
      }

      await SecureStore.setItemAsync(
        SESSION_KEY,
        JSON.stringify({
          token: nextToken,
          user: nextUser,
          roles: nextRoles,
          currentRoleId: nextCurrentRoleId ?? null,
        })
      );
    },
    []
  );

  // ================================
  // 4. 初始化：恢复登录状态
  // ================================

  const initialize = useCallback(async () => {
    try {
      const savedToken = await SecureStore.getItemAsync(
        TOKEN_KEY
      );

      const savedSession = await SecureStore.getItemAsync(
        SESSION_KEY
      );

      if (!savedToken && !savedSession) {
        return;
      }

      if (savedSession) {
        const parsedSession = JSON.parse(savedSession) as {
          token?: string;
          user?: Partial<User>;
          roles?: UserRole[];
          currentRoleId?: string | null;
        };

        const sessionToken = parsedSession.token ?? savedToken;
        const sessionUser = normalizeUser(parsedSession.user);
        const sessionRoles = parsedSession.roles ?? [];

        setToken(sessionToken ?? null);
        setUser(sessionUser);
        setRoles(sessionRoles);

        const restoredRole =
          sessionRoles.find(
            role => role.id === parsedSession.currentRoleId
          ) ??
          (sessionRoles.length === 1 ? sessionRoles[0] : null);

        setCurrentRole(restoredRole);

        if (sessionToken && sessionUser) {
          await persistSession(
            sessionToken,
            sessionUser,
            sessionRoles,
            restoredRole?.id ?? null
          );
        }

        return;
      }

      // 有 Token 时恢复用户会话
      if (loadSession) {
        const session = await loadSession(savedToken!);

        setToken(savedToken);
        setUser(normalizeUser(session.user));
        setRoles(session.roles);

        await SecureStore.setItemAsync(
          SESSION_KEY,
          JSON.stringify({
            token: savedToken,
            user: session.user,
            roles: session.roles,
          })
        );

        if (session.roles.length === 1) {
          setCurrentRole(session.roles[0]);
        }
      } else {
        // 未接入后端时，仅恢复 Token。
        // 正式项目应通过 loadSession 验证 Token 并获取用户资料。
        setToken(savedToken);
      }
    } catch (error) {
      console.error('初始化用户状态失败:', error);

      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(SESSION_KEY);

      setToken(null);
      setUser(null);
      setRoles([]);
      setCurrentRole(null);
    } finally {
      setInitialized(true);
    }
  }, [loadSession]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    SecureStore.setItemAsync(
      SESSION_KEY,
      JSON.stringify({
        token,
        user,
        roles,
        currentRoleId: currentRole?.id ?? null,
      })
    ).catch(error => {
      console.error('保存会话失败:', error);
    });
  }, [token, user, roles, currentRole]);

  // ================================
  // 5. 登录
  // ================================

  const login = async (session: LoginSession) => {
    const normalizedUser = normalizeUser(session.user);

    await SecureStore.setItemAsync(
      TOKEN_KEY,
      session.token
    );

    const initialRole =
      session.roles.length === 1 ? session.roles[0] : null;

    await persistSession(
      session.token,
      normalizedUser,
      session.roles,
      initialRole?.id ?? null
    );

    setToken(session.token);
    setUser(normalizedUser);
    setRoles(session.roles);
    setCurrentRole(initialRole);
  };

  // ================================
  // 6. 更新用户信息
  // ================================

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;

      const nextUser = normalizeUser({
        ...prev,
        ...data,
      });

      if (nextUser) {
        void persistSession(token, nextUser, roles);
      }

      return nextUser;
    });
  };

  // ================================
  // 7. 完成基础资料
  // ================================

  const completeBasicInfo = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;

      const nextUser = normalizeUser({
        ...prev,
        ...data,
        profileCompleted: true,
      });

      if (nextUser) {
        void persistSession(token, nextUser, roles);
      }

      return nextUser;
    });
  };

  // ================================
  // 8. 完成兴趣标签
  // ================================

  const completeInterests = (interests: string[]) => {
    setUser(prev => {
      if (!prev) return null;

      const nextUser = normalizeUser({
        ...prev,
        interests,
        interestsCompleted: true,
      });

      if (nextUser) {
        void persistSession(token, nextUser, roles);
      }

      return nextUser;
    });
  };

  // ================================
  // 9. 选择角色
  // ================================

  const selectRole = (role: UserRole) => {
    const exists = roles.some(item => item.id === role.id);

    if (!exists) {
      console.warn('无效的角色选择:', role.id);
      return;
    }

    setCurrentRole(role);

    if (token && user) {
      void persistSession(token, user, roles, role.id);
    }
  };

  // ================================
  // 10. 退出登录
  // ================================

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(SESSION_KEY);

    setToken(null);
    setUser(null);
    setRoles([]);
    setCurrentRole(null);
  };

  // ================================
  // 11. Context
  // ================================

  return (
    <AuthContext.Provider
      value={{
        initialized,
        token,
        user,
        roles,
        currentRole,

        login,
        updateUser,
        completeBasicInfo,
        completeInterests,
        selectRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ================================
// 12. 自定义 Hook
// ================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth 必须在 AuthProvider 内部使用'
    );
  }

  return context;
}
