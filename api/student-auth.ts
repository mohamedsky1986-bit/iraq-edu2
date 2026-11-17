
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountText =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountText) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing');
  }

  const serviceAccount = JSON.parse(serviceAccountText);

  return initializeApp({
    credential: cert(serviceAccount)
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'الطريقة غير مسموحة'
    });
  }

  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: 'أدخل اسم المستخدم وكلمة المرور.'
      });
    }

    if (username.length > 100 || password.length > 200) {
      return res.status(400).json({
        error: 'بيانات تسجيل الدخول غير صالحة.'
      });
    }

    const app = getAdminApp();
    const db = getFirestore(app);

    const snapshot = await db
      .collection('students')
      .where('username', '==', username.trim())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة.'
      });
    }

    const studentDoc = snapshot.docs[0];
    const student = studentDoc.data();

    if (student.pass !== password) {
      return res.status(401).json({
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة.'
      });
    }

    const customToken = await getAuth(app).createCustomToken(
      studentDoc.id,
      { role: 'student' }
    );

    const safeStudent = {
      id: studentDoc.id,
      name: student.name || '',
      username: student.username || '',
      stage: student.stage || '',
      isVip: student.isVip === true,
      vipStatus: student.vipStatus || '',
      status: student.status || ''
    };

    return res.status(200).json({
      token: customToken,
      student: safeStudent
    });

  } catch (error: any) {
    console.error(
      'Student authentication error:',
      error?.message || error
    );

    return res.status(500).json({
      error: 'تعذر تسجيل الدخول حالياً. حاول مرة ثانية.'
    });
  }
}
