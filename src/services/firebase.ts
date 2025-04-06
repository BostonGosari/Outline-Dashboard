import { 
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
import { db } from '../firebase';
import { Course, Category, HotSpot } from '../types';

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

// 핫스팟 관련 API
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