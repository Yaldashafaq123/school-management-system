// constants/mockData.ts
import { Course, Class, Subject, User, FeaturedCourse, 
  ClassCategory, 
  ProgressItem, 
  Announcement  } from '../types';


export const mockUser: User = {
  id: 3,
  name: 'علی رضایی',
  email: 'ali@example.com',
  role: 'admin',
  profile_image: 'https://i.pravatar.cc/300',
};


export const mockClasses: Class[] = [
  { id: 1, class_name: 'کلاس هفتم', description: 'دروس عمومی کلاس هفتم', student_count: 150 },
  { id: 2, class_name: 'کلاس هشتم', description: 'دروس عمومی کلاس هشتم', student_count: 140 },
  { id: 3, class_name: 'کلاس نهم', description: 'دروس عمومی کلاس نهم', student_count: 130 },
  { id: 4, class_name: 'کلاس دهم', description: 'دروس عمومی کلاس دهم', student_count: 120 },
];

export const mockSubjects: Subject[] = [
  { id: 1, subject_name: 'ریاضی', class_id: 1 },
  { id: 2, subject_name: 'علوم', class_id: 1 },
  { id: 3, subject_name: 'ادبیات فارسی', class_id: 1 },
  { id: 4, subject_name: 'ریاضی', class_id: 2 },
  { id: 5, subject_name: 'زیست‌شناسی', class_id: 3 },
];

export const mockCourses: Course[] = [
  {
    id: 1,
    title: 'ریاضی پایه هفتم',
    slug: 'basic-math',
    description: 'یادگیری مفاهیم پایه ریاضی برای کلاس هفتم',
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500',
    teacher_id: 2,
    teacher_name: 'آقای محمدی',
    class_id: 1,
    subject_id: 1,
    is_general: false,
    progress: 45,
    enrolled: true,
  },
  {
    id: 2,
    title: 'علوم تجربی هفتم',
    slug: 'science-basics',
    description: 'آشنایی با مفاهیم علوم تجربی',
    thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w-500',
    teacher_id: 1,
    teacher_name: 'خانم رحیمی',
    class_id: 1,
    subject_id: 2,
    is_general: false,
    progress: 30,
    enrolled: true,
  },
  {
    id: 3,
    title: 'آموزش زبان انگلیسی',
    slug: 'english-basics',
    description: 'یادگیری مکالمه انگلیسی مقدماتی',
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w-500',
    teacher_id: 3,
    teacher_name: 'آقای کریمی',
    class_id: null,
    subject_id: null,
    is_general: true,
    progress: 0,
    enrolled: false,
  },
  {
    id: 4,
    title: 'برنامه‌نویسی مقدماتی',
    slug: 'programming-basics',
    description: 'آموزش مفاهیم اولیه برنامه‌نویسی',
    thumbnail_url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500',
    teacher_id: 4,
    teacher_name: 'آقای احمدی',
    class_id: null,
    subject_id: null,
    is_general: true,
    progress: 0,
    enrolled: false,
  },
];
export const featuredCourses: FeaturedCourse[] = [
  {
    id: 1,
    title: 'ریاضی پیشرفته پایه هفتم',
    description: 'آموزش کامل ریاضی هفتم با مثال‌های عملی و تمرین‌های متنوع',
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500',
    teacher_name: 'دکتر احمدی',
    rating: 4.8,
    student_count: 1245,
    is_free: false,
  },
  {
    id: 2,
    title: 'آموزش برنامه‌نویسی پایتون',
    description: 'یادگیری برنامه‌نویسی از صفر تا صد با پایتون',
    thumbnail_url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500',
    teacher_name: 'مهندس کریمی',
    rating: 4.9,
    student_count: 2543,
    is_free: true,
  },
  {
    id: 3,
    title: 'آموزش زبان انگلیسی تجاری',
    description: 'مکالمه انگلیسی در محیط کار و کسب‌وکار',
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
    teacher_name: 'خانم رضایی',
    rating: 4.7,
    student_count: 1876,
    is_free: false,
  },
];

export const classCategories: ClassCategory[] = [
  {
    id: 1,
    name: 'کلاس هفتم',
    icon: 'school',
    color: '#3b82f6',
    course_count: 12,
  },
  {
    id: 2,
    name: 'کلاس هشتم',
    icon: 'library',
    color: '#8b5cf6',
    course_count: 10,
  },
  {
    id: 3,
    name: 'کلاس نهم',
    icon: 'book',
    color: '#10b981',
    course_count: 15,
  },
  {
    id: 4,
    name: 'کلاس دهم',
    icon: 'calculator',
    color: '#f59e0b',
    course_count: 8,
  },
  {
    id: 5,
    name: 'کلاس یازدهم',
    icon: 'flask',
    color: '#ef4444',
    course_count: 14,
  },
  {
    id: 6,
    name: 'کلاس دوازدهم',
    icon: 'rocket',
    color: '#06b6d4',
    course_count: 16,
  },
];

export const progressItems: ProgressItem[] = [
  {
    course_id: 1,
    course_title: 'ریاضی پایه هفتم',
    progress_percentage: 65,
    next_lesson_title: 'فصل ۳: جبر و معادلات',
    last_accessed: 'دیروز',
  },
  {
    course_id: 2,
    course_title: 'علوم تجربی هفتم',
    progress_percentage: 42,
    next_lesson_title: 'آزمایش فصل ۲',
    last_accessed: '۲ روز پیش',
  },
  {
    course_id: 3,
    course_title: 'ادبیات فارسی',
    progress_percentage: 88,
    next_lesson_title: 'شعر معاصر',
    last_accessed: 'امروز',
  },
];

export const announcements: Announcement[] = [
  {
    id: 1,
    title: 'آزمون میان ترم ریاضی',
    content: 'آزمون میان ترم ریاضی پایه هفتم در تاریخ ۱۴۰۳/۱۰/۲۰ برگزار خواهد شد.',
    date: '۱۴۰۳/۱۰/۱۰',
    course_name: 'ریاضی پایه هفتم',
  },
  {
    id: 2,
    title: 'اضافه شدن دوره جدید',
    content: 'دوره آموزش برنامه‌نویسی پایتون به صورت رایگان اضافه شد.',
    date: '۱۴۰۳/۱۰/۰۵',
  },
  {
    id: 3,
    title: 'تعمیرات سامانه',
    content: 'سامانه در تاریخ ۱۴۰۳/۱۰/۱۲ از ساعت ۲ تا ۴ صبح جهت تعمیرات در دسترس نخواهد بود.',
    date: '۱۴۰۳/۱۰/۰۸',
  },
];

export const latestCourses = mockCourses.slice(0, 4);
export const generalCourses = mockCourses.filter(course => course.is_general);
export const classCourses = mockCourses.filter(course => !course.is_general);