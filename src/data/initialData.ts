/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EducationalStage,
  Subject,
  Lesson,
  Question,
  Exam,
  StudentSubmission,
  UserAccount,
  SubscriptionPlan,
  PaymentSettings,
  AdminSecuritySettings,
  StudentReview,
  StudyBooklet
} from '../types/curriculum';

export const INITIAL_STAGES: EducationalStage[] = [
  {
    id: 'grade-1-intermediate',
    name: 'الصف الأول متوسط',
    shortName: 'الأول متوسط',
    tier: 'intermediate',
    badge: 'المنهج العراقي',
    description: 'تأسيس المفاهيم العلمية واللغوية لمقررات وزارة التربية العراقية'
  },
  {
    id: 'grade-2-intermediate',
    name: 'الصف الثاني متوسط',
    shortName: 'الثاني متوسط',
    tier: 'intermediate',
    badge: 'المنهج العراقي',
    description: 'تطوير المهارات الرياضية والفيزيائية والتحليل اللغوي'
  },
  {
    id: 'grade-3-intermediate',
    name: 'الصف الثالث متوسط (الوزاري)',
    shortName: 'الثالث متوسط (وزاري)',
    tier: 'intermediate',
    badge: 'امتحان البكالوريا الوزارية',
    description: 'المرحلة المنتهية للتعليم الأساسي في العراق - اختبارات وزارية شاملة ونماذج مركز الفحص'
  },
  {
    id: 'grade-4-prep-sci',
    name: 'الصف الرابع إعدادي (العلمي)',
    shortName: 'الرابع علمي',
    tier: 'preparatory',
    badge: 'المرحلة الإعدادية',
    description: 'المدخل للعلوم التخصصية: حساب المثلثات، الميكانيكا، الكيمياء العضوية'
  },
  {
    id: 'grade-4-prep-lit',
    name: 'الصف الرابع إعدادي (الأدبي)',
    shortName: 'الرابع أدبي',
    tier: 'preparatory',
    badge: 'المرحلة الإعدادية',
    description: 'العلوم الإنسانية والاجتماعية، البلاغة، تاريخ العراق والحضارة'
  },
  {
    id: 'grade-5-prep-sci',
    name: 'الصف الخامس إعدادي (العلمي)',
    shortName: 'الخامس علمي',
    tier: 'preparatory',
    badge: 'المرحلة الإعدادية',
    description: 'التفاضل والتكامل التمهيدي، الكهرومغناطيسية، والوراثة'
  },
  {
    id: 'grade-6-prep-sci',
    name: 'الصف السادس إعدادي (العلمي - الوزاري)',
    shortName: 'السادس علمي (وزاري)',
    tier: 'preparatory',
    badge: 'البكالوريا الوزارية العامة',
    description: 'سنة الحسم والقبول الجامعي العراقي - بنك الأسئلة الوزارية والحلول النموذجية المعتمدة'
  },
  {
    id: 'grade-6-prep-lit',
    name: 'الصف السادس إعدادي (الأدبي - الوزاري)',
    shortName: 'السادس أدبي (وزاري)',
    tier: 'preparatory',
    badge: 'البكالوريا الوزارية العامة',
    description: 'تاريخ العراق والوطن الحديث، الجغرافية البشرية، الاقتصاد، والنقد الأدبي'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  // الثالث متوسط
  {
    id: 'subj-g3-math',
    stageId: 'grade-3-intermediate',
    name: 'الرياضيات',
    iconName: 'Calculator',
    accentColor: 'indigo',
    description: 'الجذور التربيعية، التطبيقات، المتتابعات، المقادير الجبرية وحل المعادلات'
  },
  {
    id: 'subj-g3-physics',
    stageId: 'grade-3-intermediate',
    name: 'الفيزياء',
    iconName: 'Zap',
    accentColor: 'amber',
    description: 'الكهرباء الساكنة والمتحركة، قانون كولوم، المغناطيسية، والطاقة الكهربائية'
  },
  {
    id: 'subj-g3-chemistry',
    stageId: 'grade-3-intermediate',
    name: 'الكيمياء',
    iconName: 'FlaskConical',
    accentColor: 'emerald',
    description: 'التركيب الذري، الجدول الدوري، عناصر الزمرتين الأولى والثانية، والغازات'
  },
  {
    id: 'subj-g3-biology',
    stageId: 'grade-3-intermediate',
    name: 'الأحياء (جسم الإنسان وصحته)',
    iconName: 'HeartPulse',
    accentColor: 'rose',
    description: 'الجهاز الهيكلي، العضلي، الهضمي، الدوراني، المناعة والتغذية'
  },
  {
    id: 'subj-g3-arabic',
    stageId: 'grade-3-intermediate',
    name: 'قواعد اللغة العربية والأدب',
    iconName: 'BookOpen',
    accentColor: 'sky',
    description: 'الميزان الصرفي، أبواب الأفعال الثلاثية، اسم الفاعل ومبالغاته، والصفة المشبهة'
  },
  {
    id: 'subj-g3-english',
    stageId: 'grade-3-intermediate',
    name: 'اللغة الإنكليزية (English for Iraq)',
    iconName: 'Languages',
    accentColor: 'violet',
    description: 'Grammar, vocabulary, reading comprehension, story time and ministerial compositions'
  },

  // السادس إعدادي علمي
  {
    id: 'subj-g6-math',
    stageId: 'grade-6-prep-sci',
    name: 'الرياضيات المتقدمة',
    iconName: 'Calculator',
    accentColor: 'indigo',
    description: 'الأعداد المركبة (مبرهنة ديموافر)، التفاضل، التكامل المتقدم، والهندسة المجسمة'
  },
  {
    id: 'subj-g6-physics',
    stageId: 'grade-6-prep-sci',
    name: 'الفيزياء الحديثة',
    iconName: 'Atom',
    accentColor: 'amber',
    description: 'المتسعات، الحث الكهرومغناطيسي، دوائر التيار المتناوب، والفيزياء النووية'
  },
  {
    id: 'subj-g6-chemistry',
    stageId: 'grade-6-prep-sci',
    name: 'الكيمياء الوزارية',
    iconName: 'FlaskConical',
    accentColor: 'emerald',
    description: 'الثرموداينمك، الاتزان الكيميائي، الاتزان الأيوني (بفر)، والكيمياء الكهربائية'
  },
  {
    id: 'subj-g6-biology',
    stageId: 'grade-6-prep-sci',
    name: 'علم الأحياء والوراثة',
    iconName: 'Dna',
    accentColor: 'rose',
    description: 'الخلية، الأنسجة النباتية والحيوانية، التكاثر، والوراثة المندلية والجزيئية'
  },
  {
    id: 'subj-g6-arabic',
    stageId: 'grade-6-prep-sci',
    name: 'قواعد اللغة العربية (الوزاري)',
    iconName: 'BookMarked',
    accentColor: 'sky',
    description: 'أسلوب الاستفهام، أسلوب النفي، الاستثناء، التقديم والتأخير، والتوكيد'
  },

  // الأول متوسط
  {
    id: 'subj-g1-science',
    stageId: 'grade-1-intermediate',
    name: 'العلوم العامة',
    iconName: 'Microscope',
    accentColor: 'teal',
    description: 'خواص المادة، القوة والحركة، الذرات والمركبات، والخلية الحية'
  },
  {
    id: 'subj-g1-math',
    stageId: 'grade-1-intermediate',
    name: 'الرياضيات',
    iconName: 'Calculator',
    accentColor: 'indigo',
    description: 'الأعداد الصحيحة، القوى والأسس، الجذور، والمعادلات البسيطة'
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'les-g3-physics-coulomb',
    subjectId: 'subj-g3-physics',
    stageId: 'grade-3-intermediate',
    chapter: 'الفصل الأول: الكهربائية الساكنة',
    title: 'قانون كولوم والقوة الكهربائية المتبادلة',
    summary: 'ينص قانون كولوم على أن القوة الكهربائية المتبادلة بين شحنتين نقطيتين ساكنتين تتناسب طردياً مع حاصل ضرب مقدار الشحنتين وعكسياً مع مربع البعد بينهما. الصيغة الرياضية للقانون هي: F = k * (q1 * q2) / r^2، حيث k هو ثابت كولوم ويعتمد على نوع الوسط العازل، وقيمته في الفراغ أو الهواء تساوي تقريباً 9 × 10^9 N.m^2/C^2.',
    keyPoints: [
      'الشحنات المتشابهة تتنافر والشحنات المختلفة تتجاذب',
      'تتناسب القوة طردياً مع ضرب الشحنتين (q1 * q2)',
      'تتناسب القوة عكسياً مع مربع المسافة (r^2)',
      'وحدة قياس الشحنة هي الكولوم (C) ووحدة قياس القوة هي النيوتن (N)'
    ],
    youtubeVideoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    bookPages: 'كتاب فيزياء الثالث متوسط - وزارة التربية العراقية، ص 18 - 25'
  },
  {
    id: 'les-g3-chem-atom',
    subjectId: 'subj-g3-chemistry',
    stageId: 'grade-3-intermediate',
    chapter: 'الفصل الأول: التركيب الذري للمادة',
    title: 'تطور مفهوم البناء الذري ومبدأ أوفباو وقاعدة هوند',
    summary: 'تدرجت نظريات تركيب الذرة بدءاً من نموذج دالتون ثم نموذج ثومسون إلى نموذج رذرفورد الذي اكتشف النواة، ثم نموذج بور الذي حدد مستويات الطاقة. ينص مبدأ أوفباو على أن مستويات الطاقة الثانوية تملأ بالإلكترونات حسب تسلسل طاقتها من الأوطأ إلى الأعلى. بينما تنص قاعدة هوند على عدم حدوث ازدواج بين إلكترونين في مستوى طاقة ثانوي إلا بعد أن تشغل أوربيتالاته فرادى أولاً.',
    keyPoints: [
      'نموذج رذرفورد سمي بالنموذج الكوكبي',
      'مبدأ أوفباو: ملء مستويات الطاقة من الأوطأ إلى الأعلى',
      'قاعدة هوند: عدم الازدواج قبل إشغال الأوربيتالات فرادى',
      'الأوربيتال s يتسع لإلكترونين، و p يتسع لـ 6 إلكترونات'
    ],
    youtubeVideoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    bookPages: 'كتاب كيمياء الثالث متوسط العراقي، ص 12 - 20'
  },
  {
    id: 'les-g6-math-complex',
    subjectId: 'subj-g6-math',
    stageId: 'grade-6-prep-sci',
    chapter: 'الفصل الأول: الأعداد المركبة',
    title: 'الصيغة القطبية ومبرهنة ديموافر وتطبيقاتها الوزارية',
    summary: 'العدد المركب يكتب بالصيغة الجبرية z = a + bi أو الصيغة القطبية z = r(cos θ + i sin θ)، حيث r هو المقياس و θ هي القيمة الأساسية للسعة (arg z). تنص مبرهنة ديموافر على أنه لأي عدد حقيقي n ولأي زاوية θ يكون: [cos θ + i sin θ]^n = cos(nθ) + i sin(nθ). وتستخدم نتيجتها في إيجاد الجذور النونية للأعداد المركبة.',
    keyPoints: [
      'المقياس: r = √(x^2 + y^2)',
      'السعة الأساسية θ تحسب بدلالة cos θ = x/r و sin θ = y/r مع مراعاة الربع',
      'مبرهنة ديموافر للأسس الصحيحة الموجبة والسالبة',
      'نتيجة ديموافر لحساب الجذور النونية حيث k = 0, 1, ..., n-1'
    ],
    youtubeVideoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    bookPages: 'كتاب الرياضيات - السادس العلمي العراقي، ص 35 - 48'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-fb-coulomb-unit',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-physics',
    chapter: 'الفصل الأول: الكهربائية الساكنة',
    type: 'fill_blank',
    prompt: 'تقاس الشحنة الكهربائية في النظام الدولي للوحدات (SI) بوحدة تسمى:',
    acceptedAnswers: ['الكولوم', 'كولوم', 'كولم'],
    correctAnswer: 'الكولوم',
    explanation: 'الكولوم (Coulomb) هو الوحدة المعتمدة في منهج الفيزياء العراقي لقياس الشحنة الكهربائية ورمزه C.',
    hint: 'اسم عالم فيزيائي يبدأ بحرف الكاف ورمزه C',
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    isVip: false
  },
  {
    id: 'q-fb-chem-hund',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-chemistry',
    chapter: 'الفصل الأول: التركيب الذري للمادة',
    type: 'fill_blank',
    prompt: 'تنص قاعدة ________ على أنه لا يحدث ازدواج بين إلكترونين في مستوى الطاقة الثانوي إلا بعد أن تشغل أوربيتالاته فرادى أولاً.',
    acceptedAnswers: ['هوند', 'هوندز', 'قاعدة هوند'],
    correctAnswer: 'هوند',
    explanation: 'قاعدة هوند (Hund\'s Rule) من أهم القواعد المقررة في منهج الكيمياء لتقليل التنافر بين الإلكترونات.',
    hint: 'اسم القاعدة من أربعة أحرف (هـ - و - ن - د)',
    difficulty: 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    isVip: false
  },
  {
    id: 'q-fb-bio-heart',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-biology',
    chapter: 'الفصل الخامس: جهاز الدوران',
    type: 'fill_blank',
    prompt: 'العضو العضلي المخروطي المسؤول عن ضخ الدم إلى جميع أنحاء الجسم يسمى:',
    acceptedAnswers: ['القلب', 'قلب الإنسان', 'القلب البشري'],
    correctAnswer: 'القلب',
    explanation: 'القلب هو مضخة جهاز الدوران العضلي في جسم الإنسان.',
    hint: 'ينبض باستمرار ويقع في الصدر مائلاً لليسار',
    difficulty: 'easy',
    isVip: false
  },
  {
    id: 'q-fb-math6-demoivre',
    stageId: 'grade-6-prep-sci',
    subjectId: 'subj-g6-math',
    chapter: 'الفصل الأول: الأعداد المركبة',
    type: 'fill_blank',
    prompt: 'تسمى المبرهنة التي تنص على أن [cos θ + i sin θ]^n = cos(nθ) + i sin(nθ) بمبرهنة:',
    acceptedAnswers: ['ديموافر', 'دي موافر', 'ديموفر', 'مبرهنة ديموافر'],
    correctAnswer: 'ديموافر',
    explanation: 'مبرهنة ديموافر موضوع وزاري ثابت سنوياً في الدور الأول والثاني للسادس العلمي في العراق.',
    hint: 'تبدأ بـ ديموا...',
    difficulty: 'ministerial',
    isVip: true
  },
  {
    id: 'q-mcq-coulomb-force',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-physics',
    chapter: 'الفصل الأول: الكهربائية الساكنة',
    type: 'mcq',
    prompt: 'إذا تضاعف البعد بين شحنتين نقطيتين إلى الضعف (2r)، فإن القوة الكهربائية المتبادلة بينهما:',
    options: [
      'تقل إلى الربع (1/4 F)',
      'تقل إلى النصف (1/2 F)',
      'تزداد إلى الضعف (2F)',
      'تزداد إلى أربعة أمثالها (4F)'
    ],
    correctAnswer: 'تقل إلى الربع (1/4 F)',
    explanation: 'وفق قانون كولوم: F يتناسب عكسياً مع r^2، فمضاعفة البعد تقلل القوة إلى الربع.',
    difficulty: 'medium',
    isVip: false
  },
  {
    id: 'q-mcq-arabic-verb',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-arabic',
    chapter: 'الوحدة الأولى: الميزان الصرفي',
    type: 'mcq',
    prompt: 'ما هو الميزان الصرفي لكلمة «انتصر» في كتاب القواعد العراقي؟',
    options: [
      'افتعل',
      'استفعل',
      'انفعل',
      'تفاعل'
    ],
    correctAnswer: 'افتعل',
    explanation: 'أصل الفعل نصر (فعل)، وزيدت همزة الوصل والتاء، فيكون الوزن: افتعل.',
    difficulty: 'easy',
    isVip: false
  },
  {
    id: 'q-tf-chem-dalton',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-chemistry',
    chapter: 'الفصل الأول: التركيب الذري للمادة',
    type: 'true_false',
    prompt: 'افترض العالم ثومسون أن الذرة كرة دقيقة صلبة غير قابلة للانقسام.',
    options: ['صح', 'خطأ'],
    correctAnswer: 'خطأ',
    explanation: 'العالم دالتون هو من افترض أن الذرة كرة صلبة، بينما ثومسون افترض نموذج كرة مشحونة بإلكترونات سالبة.',
    difficulty: 'easy',
    isVip: false
  },
  {
    id: 'q-mat-biology-organs',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-biology',
    chapter: 'الفصل الرابع: الجهاز الهضمي والملحقات',
    type: 'matching',
    prompt: 'طابق كل عضو من أعضاء جسم الإنسان مع وظيفته في كتاب أحياء الثالث متوسط:',
    matchingPairs: [
      { id: 'm1', left: 'الكبد', right: 'إفراز المادة الصفراء وتنظيم السكر' },
      { id: 'm2', left: 'الرئتان', right: 'التبادل الغازي للأكسجين وثاني أكسيد الكربون' },
      { id: 'm3', left: 'الكليتان', right: 'تنقية الدم وطرح الفضلات البولية' },
      { id: 'm4', left: 'المعدة', right: 'إفراز حامض الهيدروكلوريك وإنزيم الببسين' }
    ],
    correctAnswer: 'الكبد: إفراز المادة الصفراء | الرئتان: التبادل الغازي | الكليتان: تنقية الدم | المعدة: إفراز حامض الهيدروكلوريك',
    explanation: 'تكامل وظائف الأجهزة الحيوية يحافظ على اتزان وصحة جسم الإنسان.',
    difficulty: 'medium',
    isVip: false
  },
  {
    id: 'q-mcq-chem6-thermo',
    stageId: 'grade-6-prep-sci',
    subjectId: 'subj-g6-chemistry',
    chapter: 'الفصل الأول: علم الثرموداينمك',
    type: 'mcq',
    prompt: 'في تفاعل باعث للحرارة، عندما تكون قيمة التغير في الإنثالبي (ΔH) سالبة والتغير في الإنتروبي (ΔS) موجبة، فإن طاقة غبس الحرة (ΔG) تكون:',
    options: [
      'سالبة وتلقائية دائماً عند جميع درجات الحرارة',
      'موجبة وغير تلقائية دائماً',
      'تلقائية فقط عند درجات الحرارة المنخفضة',
      'تلقائية فقط عند درجات الحرارة العالية'
    ],
    correctAnswer: 'سالبة وتلقائية دائماً عند جميع درجات الحرارة',
    explanation: 'وفق علاقة كبس الوزارية ΔG = ΔH - TΔS، يكون التفاعل تلقائياً في كافة الظروف.',
    difficulty: 'ministerial',
    isVip: true
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-g3-physics-ministerial',
    title: 'الامتحان الوزاري الشامل: الفيزياء (الدور الأول - محاكاة وزارية العراق)',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-physics',
    chapter: 'الفصل الأول: الكهربائية الساكنة',
    description: 'اختبار وزاري شامل يحاكي نمط أسئلة البكالوريا لفيزياء الثالث متوسط في العراق',
    durationMinutes: 20,
    questionIds: ['q-fb-coulomb-unit', 'q-mcq-coulomb-force'],
    isComprehensive: true,
    isMinisterial: true,
    isVip: false
  },
  {
    id: 'exam-g3-chem-midterm',
    title: 'امتحان نصف السنة: الكيمياء العامة والتركيب الذري',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-chemistry',
    chapter: 'الفصل الأول: التركيب الذري للمادة',
    description: 'أسئلة تفاعلية تقيس الفهم العميق لقواعد التوزيع الإلكتروني ونظريات بناء الذرة',
    durationMinutes: 15,
    questionIds: ['q-fb-chem-hund', 'q-tf-chem-dalton'],
    isComprehensive: false,
    isMinisterial: false,
    isVip: false
  },
  {
    id: 'exam-g3-bio-comprehensive',
    title: 'اختبار البكالوريا التجريبي: أحياء جسم الإنسان وصحته',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-biology',
    chapter: 'الفصل الرابع والخامس: الهضم والدوران',
    description: 'اختبار وزاري تفاعلي يجمع الفراغات والمطابقة والأسئلة التشخيصية',
    durationMinutes: 15,
    questionIds: ['q-fb-bio-heart', 'q-mat-biology-organs'],
    isComprehensive: true,
    isMinisterial: true,
    isVip: false
  },
  {
    id: 'exam-g6-ministerial-vip',
    title: 'البنك الذهبي للوزاريات: مبرهنة ديموافر وثرموداينمك (VIP)',
    stageId: 'grade-6-prep-sci',
    subjectId: 'subj-g6-math',
    chapter: 'الفصل الأول: الأعداد المركبة والثرموداينمك',
    description: 'مخصص لمشتركي VIP: مسائل وزارية مكررة للفرع العلمي مع سلم الدرجات المعتمد بمركز فحص الدراسة الإعدادية',
    durationMinutes: 30,
    questionIds: ['q-fb-math6-demoivre', 'q-mcq-chem6-thermo'],
    isComprehensive: true,
    isMinisterial: true,
    isVip: true
  }
];

export const INITIAL_BOOKLETS: StudyBooklet[] = [
  {
    id: 'bk-phys-g3-coulomb',
    title: 'ملزمة الفيزياء الوزارية الذهبية - الثالث متوسط (الفصل الأول)',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-physics',
    chapter: 'الفصل الأول: الكهربائية الساكنة',
    authorTeacher: 'أ. محمد السماوي (المشرف العام)',
    pageCount: 36,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    description: 'شاملة لكافة القوانين الرياضية لقانون كولوم مع حلول الأسئلة الوزارية من 2012 حتى 2026 للأدوار كافة.',
    isVipOnly: false,
    publishedAt: '2026-10-01T10:00:00Z',
    downloadCount: 1420
  },
  {
    id: 'bk-chem-g3-atomic',
    title: 'ملزمة الكيمياء المركزة والشاملة - الثالث متوسط',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-chemistry',
    chapter: 'الفصل الأول: التركيب الذري للمادة',
    authorTeacher: 'أ. محمد السماوي',
    pageCount: 28,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    description: 'توزيع إلكتروني، قاعدة هوند ومبدأ أوفباو، مع مقارنات دالتون وثومسون ورذرفورد في جداول ملونة ومبسطة.',
    isVipOnly: false,
    publishedAt: '2026-10-05T12:00:00Z',
    downloadCount: 980
  },
  {
    id: 'bk-math6-demoivre-vip',
    title: 'ملزمة الأعداد المركبة ومبرهنة ديموافر - السادس العلمي (VIP)',
    stageId: 'grade-6-prep-sci',
    subjectId: 'subj-g6-math',
    chapter: 'الفصل الأول: الأعداد المركبة',
    authorTeacher: 'نخبة أساتذة نبوغ الوزارية',
    pageCount: 64,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    description: 'مخصصة لمشتركي VIP: كافة الأفكار الوزارية الإثرائية وحلول الأسئلة التمهيدية والدور الأول والثاني ونماذج مركز الفحص.',
    isVipOnly: true,
    publishedAt: '2026-10-10T14:00:00Z',
    downloadCount: 2150
  },
  {
    id: 'bk-bio-g3-body',
    title: 'ملزمة أحياء جسم الإنسان وصحته - الثالث متوسط',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-biology',
    chapter: 'الفصل الرابع والخامس: الهضم والدوران',
    authorTeacher: 'أ. محمد السماوي',
    pageCount: 42,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80',
    description: 'الرسومات الوزارية المطلوبة للتأشير، الفروقات بين الشرايين والأوردة، وجداول وظائف الأعضاء بدقة عالية.',
    isVipOnly: false,
    publishedAt: '2026-10-12T09:00:00Z',
    downloadCount: 1670
  }
];

export const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-001',
    examId: 'exam-g3-physics-ministerial',
    examTitle: 'الامتحان الوزاري الشامل: الفيزياء (الدور الأول - محاكاة وزارية العراق)',
    studentEmail: 'ali.student@nobogh.iq',
    studentName: 'علي أحمد الكرخي',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-physics',
    score: 100,
    totalScore: 100,
    percentage: 100,
    completedAt: '2026-10-23T14:30:00Z',
    timeSpentSeconds: 412,
    results: [
      {
        questionId: 'q-fb-coulomb-unit',
        questionPrompt: 'تقاس الشحنة الكهربائية في النظام الدولي للوحدات (SI) بوحدة تسمى:',
        questionType: 'fill_blank',
        studentAnswer: 'كولوم',
        correctAnswer: 'الكولوم',
        isCorrect: true,
        hasTypoAlert: true,
        similarityPercent: 95,
        feedback: 'إجابة مقبولة وصحيحة، مع ملاحظة كتابة (ال) التعريف: «الكولوم».',
        explanation: 'الكولوم هو الوحدة المعتمدة لقياس الشحنة الكهربائية.'
      },
      {
        questionId: 'q-mcq-coulomb-force',
        questionPrompt: 'إذا تضاعف البعد بين شحنتين نقطيتين إلى الضعف (2r)، فإن القوة الكهربائية المتبادلة بينهما:',
        questionType: 'mcq',
        studentAnswer: 'تقل إلى الربع (1/4 F)',
        correctAnswer: 'تقل إلى الربع (1/4 F)',
        isCorrect: true,
        hasTypoAlert: false,
        similarityPercent: 100,
        feedback: 'إجابة دقيقة وصحيحة 100%! أحسنت.',
        explanation: 'القوة تتناسب عكسياً مع مربع البعد.'
      }
    ]
  },
  {
    id: 'sub-002',
    examId: 'exam-g3-chem-midterm',
    examTitle: 'امتحان نصف السنة: الكيمياء العامة والتركيب الذري',
    studentEmail: 'fatima.zahraa@nobogh.iq',
    studentName: 'فاطمة الزهراء حيدر',
    stageId: 'grade-3-intermediate',
    subjectId: 'subj-g3-chemistry',
    score: 100,
    totalScore: 100,
    percentage: 100,
    completedAt: '2026-10-22T11:15:00Z',
    timeSpentSeconds: 320,
    results: [
      {
        questionId: 'q-fb-chem-hund',
        questionPrompt: 'تنص قاعدة ________ على أنه لا يحدث ازدواج بين إلكترونين...',
        questionType: 'fill_blank',
        studentAnswer: 'هوند',
        correctAnswer: 'هوند',
        isCorrect: true,
        hasTypoAlert: false,
        similarityPercent: 100,
        feedback: 'إجابة نموذجية دقيقة!',
        explanation: 'قاعدة هوند أساسية في التوزيع الإلكتروني.'
      },
      {
        questionId: 'q-tf-chem-dalton',
        questionPrompt: 'افترض العالم ثومسون أن الذرة كرة دقيقة صلبة غير قابلة للانقسام.',
        questionType: 'true_false',
        studentAnswer: 'خطأ',
        correctAnswer: 'خطأ',
        isCorrect: true,
        hasTypoAlert: false,
        similarityPercent: 100,
        feedback: 'إجابة صحيحة، فالعالم دالتون هو صاحب هذا الفرض.',
        explanation: 'دالتون هو من افترض أن الذرة صلبة لا تنقسم.'
      }
    ]
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    email: 'mohamedsky1986@gmail.com',
    username: 'mohamed_admin',
    name: 'أ. محمد السماوي (المشرف العام)',
    role: 'teacher',
    isVip: true,
    governorate: 'بغداد - الرصافة',
    phoneNumber: '07801234567',
    registeredAt: '2026-09-01T08:00:00Z',
    lastActiveAt: '2026-10-24T12:00:00Z',
    customNotes: 'مدير المنصة والمشرف التربوي'
  },
  {
    email: 'ali.student@nobogh.iq',
    username: 'ali_karkh',
    name: 'علي أحمد الكرخي',
    role: 'student',
    isVip: true,
    targetStageId: 'grade-3-intermediate',
    governorate: 'بغداد - الكرخ',
    phoneNumber: '07712345678',
    registeredAt: '2026-10-01T10:15:00Z',
    lastActiveAt: '2026-10-24T11:45:00Z',
    customNotes: 'طالب متميز في مادة الفيزياء والكيمياء'
  },
  {
    email: 'fatima.zahraa@nobogh.iq',
    username: 'fatima_zahraa',
    name: 'فاطمة الزهراء حيدر',
    role: 'student',
    isVip: false,
    targetStageId: 'grade-3-intermediate',
    governorate: 'النجف الأشرف',
    phoneNumber: '07819876543',
    registeredAt: '2026-10-05T14:20:00Z',
    lastActiveAt: '2026-10-23T19:30:00Z',
    customNotes: 'تحتاج متابعة في مسائل الرياضيات'
  },
  {
    email: 'mustafa.basra@nobogh.iq',
    username: 'mustafa_iq',
    name: 'مصطفى حسين العبيدي',
    role: 'student',
    isVip: true,
    targetStageId: 'grade-6-prep-sci',
    governorate: 'البصرة',
    phoneNumber: '07705551234',
    registeredAt: '2026-10-10T16:00:00Z',
    lastActiveAt: '2026-10-24T09:10:00Z',
    customNotes: 'مشترك في الباقة الوزارية للسادس العلمي'
  }
];

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-ministerial-vip',
    name: 'باقة البكالوريا والامتحان الوزاري الشامل',
    priceIQD: 25000,
    durationText: 'طيلة العام الدراسي الوزاري',
    description: 'الخيار الأقوى لطلبة الثالث متوسط والسادس إعدادي لضمان التفوق والقبول المركزي',
    features: [
      'فتح كافة الامتحانات الوزارية ونماذج مركز الفحص لجميع الأدوار',
      'تحميل وتصفح كافة الملازم الدراسية الذهبية بصيغة PDF',
      'فحص ذكي متقدم للفراغات مع توضيح أدق الأخطاء الإملائية',
      'شروحات الفيديو المكثفة لأسئلة ومسائل الوزاري الصعبة',
      'شهادات تفوق رسمية صادرة باسم الطالب قابلة للطباعة والتوثيق'
    ],
    isPopular: true,
    isActive: true
  },
  {
    id: 'plan-semester',
    name: 'باقة الفصل الدراسي (نصف السنة)',
    priceIQD: 15000,
    durationText: 'فصل دراسي كامل (4 أشهر)',
    description: 'تغطية شاملة لامتحانات نصف السنة والامتحانات الشهرية لكافة مواد المرحلة',
    features: [
      'جميع اختبارات الفصول الشهرية ونصف السنة',
      'بنك الأسئلة المحدث مع التلميحات ونماذج الإجابة',
      'تقارير تفصيلية لمستوى التقدم ونقاط الضعف'
    ],
    isPopular: false,
    isActive: true
  },
  {
    id: 'plan-revision',
    name: 'باقة المراجعة المركزة السريعة',
    priceIQD: 10000,
    durationText: 'شهر واحد',
    description: 'مكثفة للأيام الأخيرة قبل الامتحانات النهائية لاختبار الجاهزية وسرعة الحل',
    features: [
      'امتحانات سريعة محددة بوقت قياسي',
      'ملخصات ومخططات الكتب المركزة'
    ],
    isPopular: false,
    isActive: true
  }
];

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  zainCashNumber: '07801234567',
  zainCashHolder: 'محفظة منصة نبوغ التعليمية المعتمدة',
  qiCardNumber: '6049 8812 3456 7890',
  asiaCellNumber: '07709876543 (تحويل رصيد كارتات)',
  whatsappContact: '07801234567',
  instructions: 'قم بتحويل مبلغ الاشتراك عبر محفظة زين كاش أو كي كارد للرقم أعلاه، ثم أرسل صورة الإشعار أو رقم المعاملة مع بريدك الإلكتروني واليوزرنيم عبر واتساب ليتم التفعيل الفوري لحسابك خلال أقل من 10 دقائق.',
  exchangeNote: 'الأسعار رسمية وثابتة بالدينار العراقي (IQD) لكافة طلبة محافظات العراق.'
};

export const INITIAL_ADMIN_SECURITY: AdminSecuritySettings = {
  passcode: '1986', // الرمز السري الافتراضي للوحة التحكم
  instituteName: 'منصة نبوغ التعليمية - جمهورية العراق',
  supportPhone: '07801234567',
  fuzzyToleranceEnabled: true,
  allowPublicReviews: true
};

export const INITIAL_STUDENT_REVIEWS: StudentReview[] = [
  {
    id: 'rev-001',
    studentName: 'علي أحمد الكرخي',
    username: 'ali_karkh',
    studentEmail: 'ali.student@nobogh.iq',
    governorate: 'بغداد - الكرخ',
    gradeName: 'الثالث متوسط (الوزاري)',
    rating: 5,
    comment: 'المنصة ممتازة جداً وساعدتني في فهم قانون كولوم والفيزياء الوزارية، والتصحيح الذكي للفراغات نبهني على همزات كنت أخطئ بها دائماً وملازم الـ PDF مرتبة!',
    createdAt: '2026-10-23T16:00:00Z',
    isApproved: true,
    isFeatured: true
  },
  {
    id: 'rev-002',
    studentName: 'مصطفى حسين العبيدي',
    username: 'mustafa_iq',
    studentEmail: 'mustafa.basra@nobogh.iq',
    governorate: 'البصرة',
    gradeName: 'السادس إعدادي (العلمي)',
    rating: 5,
    comment: 'أفضل بنك أسئلة وزارية وملازم PDF للسادس العلمي في العراق، مبرهنة ديموافر وثرموداينمك مشروحة باحترافية والامتحانات الشاملة تعطي رهبة الامتحان الحقيقي.',
    createdAt: '2026-10-24T08:30:00Z',
    isApproved: true,
    isFeatured: true
  },
  {
    id: 'rev-003',
    studentName: 'فاطمة الزهراء حيدر',
    username: 'fatima_zahraa',
    studentEmail: 'fatima.zahraa@nobogh.iq',
    governorate: 'النجف الأشرف',
    gradeName: 'الثالث متوسط',
    rating: 5,
    comment: 'شروحات الكتب المدرسية والملازم والربط مع يوتيوب منظم بشكل رائع، أنصح كل طالب في العراق بالاشتراك والاستفادة منها.',
    createdAt: '2026-10-22T19:00:00Z',
    isApproved: true,
    isFeatured: true
  }
];
