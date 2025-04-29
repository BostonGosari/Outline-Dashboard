import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { Course, Category, HotSpot } from '../types';

// Firebase 초기화
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY as string,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.REACT_APP_FIREBASE_APP_ID as string
};

console.log('Firebase Config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? '***' : undefined,
  appId: firebaseConfig.appId ? '***' : undefined
});

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

console.log('Firebase initialized successfully');

// 카테고리 관련 API
export const getCategories = async (): Promise<Category[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
  } catch (error) {
    console.error('카테고리 가져오기 실패:', error);
    throw error;
  }
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), category);
    return docRef.id;
  } catch (error) {
    console.error('카테고리 추가 실패:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
  try {
    const docRef = doc(db, 'categories', id);
    await updateDoc(docRef, category);
  } catch (error) {
    console.error('카테고리 수정 실패:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'categories', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('카테고리 삭제 실패:', error);
    throw error;
  }
};

// 강의 관련 API
export const getCourses = async (): Promise<Course[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'courses'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];
  } catch (error) {
    console.error('강의 가져오기 실패:', error);
    throw error;
  }
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
    const docRef = doc(db, 'courses', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Course;
    }
    return null;
  } catch (error) {
    console.error('강의 상세 정보 가져오기 실패:', error);
    throw error;
  }
};

export const addCourse = async (course: Omit<Course, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'courses'), course);
    return docRef.id;
  } catch (error) {
    console.error('강의 추가 실패:', error);
    throw error;
  }
};

export const updateCourse = async (id: string, course: Partial<Course>): Promise<void> => {
  try {
    const docRef = doc(db, 'courses', id);
    await updateDoc(docRef, course);
  } catch (error) {
    console.error('강의 수정 실패:', error);
    throw error;
  }
};

export const deleteCourse = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'courses', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('강의 삭제 실패:', error);
    throw error;
  }
};

export const getHotSpots = async (courseId: string): Promise<HotSpot[]> => {
  try {
    const q = query(collection(db, 'hotSpots'), where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HotSpot[];
  } catch (error) {
    console.error('핫스팟 가져오기 실패:', error);
    throw error;
  }
};

export const addHotSpot = async (courseId: string, hotSpot: Omit<HotSpot, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'hotSpots'), {
      ...hotSpot,
      courseId
    });
    return docRef.id;
  } catch (error) {
    console.error('핫스팟 추가 실패:', error);
    throw error;
  }
};

export const updateHotSpot = async (id: string, hotSpot: Partial<HotSpot>): Promise<void> => {
  try {
    const docRef = doc(db, 'hotSpots', id);
    await updateDoc(docRef, hotSpot);
  } catch (error) {
    console.error('핫스팟 수정 실패:', error);
    throw error;
  }
};

export const deleteHotSpot = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'hotSpots', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('핫스팟 삭제 실패:', error);
    throw error;
  }
};

// 카테고리와 코스 데이터 가져오기
export const fetchCategoriesAndCourses = async () => {
  try {
    // 코스 데이터 먼저 가져오기
    const coursesSnapshot = await getDocs(collection(db, "allGPSArtCourses"));
    const coursesData = coursesSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        courseName: doc.data().courseName as string,
        ...doc.data(),
      }))
      .sort((a, b) => a.courseName.localeCompare(b.courseName)) as Course[];

    // 카테고리 데이터 가져오기
    const categoriesSnapshot = await getDocs(collection(db, "artCategories"));
    const categoriesData = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];

    return {
      courses: coursesData,
      categories: categoriesData
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}; 