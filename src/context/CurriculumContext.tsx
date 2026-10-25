import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { initialStages } from '../data/initialData';

interface CurriculumContextType {
  stages: any[];
  addSubject: (stageId: string, subjectData: any) => Promise<void>;
  updateSubject: (stageId: string, subjectId: string, subjectData: any) => Promise<void>;
  deleteSubject: (stageId: string, subjectId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

export const CurriculumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stages, setStages] = useState<any[]>(initialStages);
  const [loading, setLoading] = useState(true);

  // جلب البيانات من فايربيس عند فتح التطبيق
  const fetchCurriculum = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'stages'));
      if (!querySnapshot.empty) {
        const loadedStages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStages(loadedStages);
      } else {
        // إذا كانت القاعدة فارغة، قم برفع البيانات الافتتاحية لأول مرة تلقائياً
        for (const stage of initialStages) {
          await setDoc(doc(db, 'stages', stage.id.toString()), stage);
        }
        setStages(initialStages);
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات من قاعدة البيانات:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, []);

  // إضافة مادة أو منهج جديد وحفظه في فايربيس بشكل دائم
  const addSubject = async (stageId: string, subjectData: any) => {
    try {
      const stageRef = doc(db, 'stages', stageId.toString());
      const stageIndex = stages.findIndex(s => s.id.toString() === stageId.toString());
      
      if (stageIndex === -1) return;

      const currentStage = stages[stageIndex];
      const newSubjects = [...(currentStage.subjects || []), { ...subjectData, id: Date.now().toString() }];
      
      await updateDoc(stageRef, { subjects: newSubjects });

      const updatedStages = [...stages];
      updatedStages[stageIndex] = { ...currentStage, subjects: newSubjects };
      setStages(updatedStages);
    } catch (error) {
      console.error("خطأ أثناء إضافة المنهج:", error);
      alert("فشل الحفظ في قاعدة البيانات.");
    }
  };

  // تعديل مادة
  const updateSubject = async (stageId: string, subjectId: string, subjectData: any) => {
    try {
      const stageRef = doc(db, 'stages', stageId.toString());
      const stageIndex = stages.findIndex(s => s.id.toString() === stageId.toString());
      
      if (stageIndex === -1) return;

      const currentStage = stages[stageIndex];
      const newSubjects = (currentStage.subjects || []).map((sub: any) => 
        sub.id === subjectId ? { ...sub, ...subjectData } : sub
      );
      
      await updateDoc(stageRef, { subjects: newSubjects });

      const updatedStages = [...stages];
      updatedStages[stageIndex] = { ...currentStage, subjects: newSubjects };
      setStages(updatedStages);
    } catch (error) {
      console.error("خطأ أثناء التعديل:", error);
    }
  };

  // حذف مادة
  const deleteSubject = async (stageId: string, subjectId: string) => {
    try {
      const stageRef = doc(db, 'stages', stageId.toString());
      const stageIndex = stages.findIndex(s => s.id.toString() === stageId.toString());
      
      if (stageIndex === -1) return;

      const currentStage = stages[stageIndex];
      const newSubjects = (currentStage.subjects || []).filter((sub: any) => sub.id !== subjectId);
      
      await updateDoc(stageRef, { subjects: newSubjects });

      const updatedStages = [...stages];
      updatedStages[stageIndex] = { ...currentStage, subjects: newSubjects };
      setStages(updatedStages);
    } catch (error) {
      console.error("خطأ أثناء الحذف:", error);
    }
  };

  return (
    <CurriculumContext.Provider value={{ stages, addSubject, updateSubject, deleteSubject, refreshData: fetchCurriculum }}>
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = () => {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
};
