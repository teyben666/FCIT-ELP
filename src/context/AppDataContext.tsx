import React from 'react';
import {Assignment, Course, Notification, User} from '../types';
import {MOCK_ASSIGNMENTS, MOCK_COURSES, MOCK_NOTIFICATIONS, MOCK_USER} from '../mockData';
import {
  createAssignmentForCourse,
  createCourse as createCourseApi,
  deleteCourse as deleteCourseApi,
  deleteAssignment as deleteAssignmentApi,
  getBootstrapData,
  getDiscoverCourses,
  joinCourse,
  leaveCourse,
  markNotificationRead,
  updateAssignment as updateAssignmentApi,
  updateCourse as updateCourseApi,
} from '../lib/api';

type AppDataValue = {
  user: User;
  courses: Course[];
  assignments: Assignment[];
  notifications: Notification[];
  usingMockData: boolean;
  discoverCourses: Course[];
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  joinByCode: (joinCode: string) => Promise<void>;
  leaveFromCourse: (courseId: string) => Promise<void>;
  createCourse: (payload: {name: string; code: string; semester: string; description?: string}) => Promise<void>;
  updateCourse: (courseId: string, payload: {name?: string; code?: string; semester?: string; description?: string}) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  createAssignment: (
    courseId: string,
    payload: {title: string; description?: string; due_date: string; max_file_size_mb?: number; upload_tier?: string},
  ) => Promise<void>;
  updateAssignment: (
    assignmentId: string,
    payload: {title?: string; description?: string; due_date?: string; max_file_size_mb?: number; upload_tier?: string},
  ) => Promise<void>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
};

const AppDataContext = React.createContext<AppDataValue>({
  user: MOCK_USER,
  courses: MOCK_COURSES,
  assignments: MOCK_ASSIGNMENTS,
  notifications: MOCK_NOTIFICATIONS,
  usingMockData: true,
  discoverCourses: [],
  refresh: async () => {},
  markAsRead: async () => {},
  joinByCode: async () => {},
  leaveFromCourse: async () => {},
  createCourse: async () => {},
  updateCourse: async () => {},
  deleteCourse: async () => {},
  createAssignment: async () => {},
  updateAssignment: async () => {},
  deleteAssignment: async () => {},
});

export function useAppData() {
  return React.useContext(AppDataContext);
}

export function AppDataProvider({children}: {children: React.ReactNode}) {
  const [state, setState] = React.useState<AppDataValue>({
    user: MOCK_USER,
    courses: MOCK_COURSES,
    assignments: MOCK_ASSIGNMENTS,
    notifications: MOCK_NOTIFICATIONS,
    usingMockData: true,
    discoverCourses: [],
    refresh: async () => {},
    markAsRead: async () => {},
    joinByCode: async () => {},
    leaveFromCourse: async () => {},
    createCourse: async () => {},
    updateCourse: async () => {},
    deleteCourse: async () => {},
    createAssignment: async () => {},
    updateAssignment: async () => {},
    deleteAssignment: async () => {},
  });

  const loadData = React.useCallback(async () => {
    try {
      const bootstrap = await getBootstrapData();
      const discover = await getDiscoverCourses().catch(() => []);
      setState((current) => ({
        ...current,
        user: bootstrap.user,
        courses: bootstrap.courses,
        assignments: bootstrap.assignments,
        notifications: bootstrap.notifications,
        discoverCourses: discover,
        usingMockData: false,
      }));
    } catch {
      setState((current) => ({...current, usingMockData: true}));
    }
  }, []);

  const handleMarkAsRead = React.useCallback(async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      setState((current) => ({
        ...current,
        notifications: current.notifications.map((item) =>
          item.id === notificationId ? {...item, is_read: true} : item,
        ),
      }));
    } catch {
      // Keep optimistic UI simple for this MVP.
    }
  }, []);

  const handleJoinByCode = React.useCallback(
    async (joinCode: string) => {
      await joinCourse(joinCode);
      await loadData();
    },
    [loadData],
  );

  const handleLeaveFromCourse = React.useCallback(
    async (courseId: string) => {
      await leaveCourse(courseId);
      await loadData();
    },
    [loadData],
  );

  const handleCreateCourse = React.useCallback(
    async (payload: {name: string; code: string; semester: string; description?: string}) => {
      await createCourseApi(payload);
      await loadData();
    },
    [loadData],
  );

  const handleUpdateCourse = React.useCallback(
    async (courseId: string, payload: {name?: string; code?: string; semester?: string; description?: string}) => {
      await updateCourseApi(courseId, payload);
      await loadData();
    },
    [loadData],
  );

  const handleCreateAssignment = React.useCallback(
    async (
      courseId: string,
      payload: {title: string; description?: string; due_date: string; max_file_size_mb?: number; upload_tier?: string},
    ) => {
      await createAssignmentForCourse(courseId, payload);
      await loadData();
    },
    [loadData],
  );

  const handleDeleteCourse = React.useCallback(
    async (courseId: string) => {
      await deleteCourseApi(courseId);
      await loadData();
    },
    [loadData],
  );

  const handleUpdateAssignment = React.useCallback(
    async (
      assignmentId: string,
      payload: {title?: string; description?: string; due_date?: string; max_file_size_mb?: number; upload_tier?: string},
    ) => {
      await updateAssignmentApi(assignmentId, payload);
      await loadData();
    },
    [loadData],
  );

  const handleDeleteAssignment = React.useCallback(
    async (assignmentId: string) => {
      await deleteAssignmentApi(assignmentId);
      await loadData();
    },
    [loadData],
  );

  React.useEffect(() => {
    let active = true;
    async function run() {
      try {
        const bootstrap = await getBootstrapData();
        if (!active) {
          return;
        }
        setState((current) => ({
          ...current,
          user: bootstrap.user,
          courses: bootstrap.courses,
          assignments: bootstrap.assignments,
          notifications: bootstrap.notifications,
          usingMockData: false,
        }));
      } catch {
        if (!active) {
          return;
        }
        setState((current) => ({...current, usingMockData: true}));
      }
    }

    run();
    return () => {
      active = false;
    };
  }, []);

  const value = React.useMemo(
    () => ({
      ...state,
      refresh: loadData,
      markAsRead: handleMarkAsRead,
      joinByCode: handleJoinByCode,
      leaveFromCourse: handleLeaveFromCourse,
      createCourse: handleCreateCourse,
      updateCourse: handleUpdateCourse,
      deleteCourse: handleDeleteCourse,
      createAssignment: handleCreateAssignment,
      updateAssignment: handleUpdateAssignment,
      deleteAssignment: handleDeleteAssignment,
    }),
    [
      state,
      loadData,
      handleMarkAsRead,
      handleJoinByCode,
      handleLeaveFromCourse,
      handleCreateCourse,
      handleUpdateCourse,
      handleDeleteCourse,
      handleCreateAssignment,
      handleUpdateAssignment,
      handleDeleteAssignment,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
