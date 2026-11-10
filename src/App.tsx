import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, getDoc, Timestamp, where } from 'firebase/firestore';
import { 
  GraduationCap, ShieldCheck, MapPin, BookOpen, Video, FileText, 
  Award, ArrowRight, UserCheck, Users, ChevronDown, CheckCircle2, 
  Sparkles, PlusCircle, Trash2, Crown, Lock, Unlock, Settings, Play, Download, CheckSquare, Edit3, Image as ImageIcon, Eye, X, Key, User, Clock, CheckCircle, AlertCircle, FileText as NoteIcon, MessageCircle, CreditCard, Smartphone, ExternalLink, ArrowUp, ArrowDown, Flame, Send, MessageSquare, Globe, Search, RotateCcw, Unlock as UnlockIcon, Laptop, Upload
} from 'lucide-react';

const MY_TELEGRAM_LINK = 'https://t.me/YourUsername'; 

// مخزن محلي IndexedDB لحفظ المناهج كاملة على الجهاز للعمل دون إنترنت
const OFFLINE_DB_NAME = 'nabigha-offline-v1';
const OFFLINE_STORE_NAME = 'app-cache';
const openOfflineDB = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB غير متاح'));
  const request = indexedDB.open(OFFLINE_DB_NAME, 1);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(OFFLINE_STORE_NAME)) database.createObjectStore(OFFLINE_STORE_NAME);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('تعذر فتح التخزين المحلي'));
});
const saveSubjectsOffline = async (subjectsToSave: any[]) => {
  try {
    const database = await openOfflineDB();
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(OFFLINE_STORE_NAME, 'readwrite');
      tx.objectStore(OFFLINE_STORE_NAME).put(subjectsToSave, 'subjects');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    database.close();
  } catch (error) { console.warn('تعذر حفظ المناهج دون إنترنت:', error); }
};
const readSubjectsOffline = async (): Promise<any[]> => {
  try {
    const database = await openOfflineDB();
    const value = await new Promise<any>((resolve, reject) => {
      const request = database.transaction(OFFLINE_STORE_NAME, 'readonly').objectStore(OFFLINE_STORE_NAME).get('subjects');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return Array.isArray(value) ? value : [];
  } catch (error) { return []; }
};

const safeGetStorage = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch (e) {
    return fallback;
  }
};

export function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator === 'undefined' ? true : navigator.onLine);

  // إظهار حالة الاتصال فوراً، دون التأثير على عمل المنصة أو بيانات Firebase
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // تهيئة PWA: ملف manifest ثابت + Service Worker
  useEffect(() => {
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = '/manifest.webmanifest';

    let iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    iconLink.href = '/icons/icon-192.png';
