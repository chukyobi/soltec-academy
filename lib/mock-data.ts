export interface Video {
  id: string;
  title: string;
  duration: string;
  isIntro?: boolean;
  description?: string;
  isAssessment?: boolean;
}

export interface Module {
  id: string;
  title: string;
  videos: Video[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor: {
    name: string;
    avatar: string;
    role: string;
  };
  thumbnail: string;
  price: string;
  level: string;
  duration: string;
  modules: Module[];
  assignments: Assignment[];
  previewVideosCount: number;
  isProgramming: boolean;
  color: string;
  buttonColor: string;
}

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Data Analysis',
    slug: 'data-analysis',
    description: 'Get a solid grasp on concepts needed to work with data to land your first job',
    instructor: {
      name: 'Sarah Drasner',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
      role: 'Senior Data Analyst'
    },
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000',
    price: 'NGN5,000',
    level: 'Intermediate',
    duration: '12 Weeks',
    previewVideosCount: 3,
    isProgramming: false,
    color: 'from-blue-900 to-blue-800',
    buttonColor: 'bg-white text-blue-900 hover:bg-blue-50',
    modules: [
      {
        id: 'm1',
        title: 'Basic Concepts',
        videos: [
          { id: 'v1', title: 'Welcome to Data Analysis', duration: '5:24', description: 'Introduction to data and concepts.' },
          { id: 'v2', title: 'Data Types', duration: '12:10', description: 'Explore categorical vs numerical data.' },
          { id: 'v3', title: 'First Quiz', duration: '15:00', isAssessment: true, description: 'Test your knowledge on data types.' },
          { id: 'v4', title: 'Data Cleaning', duration: '20:10', description: 'How to clean messy data.' },
        ]
      },
      {
        id: 'm2',
        title: 'Intermediate Analysis',
        videos: [
          { id: 'v5', title: 'Statistical Foundations', duration: '25:00', description: 'Learn basic statistics.' },
          { id: 'v6', title: 'Python for Data', duration: '30:15', description: 'Intro to Python libraries.' },
          { id: 'v7', title: 'Data Visualization Basics', duration: '22:10', description: 'Plotting with matplotlib.' }
        ]
      },
      {
        id: 'm3',
        title: 'Advanced Techniques',
        videos: [
          { id: 'v8', title: 'Machine Learning Models', duration: '45:00', description: 'Introduction to scikit-learn.' },
          { id: 'v9', title: 'Final Project Assessment', duration: '60:00', isAssessment: true, description: 'Build a full data workflow.' }
        ]
      }
    ],
    assignments: []
  },
  {
    id: 'c2',
    title: 'Product Design',
    slug: 'product-design',
    description: 'Get a solid grasp on concepts needed to work with design to land your first job',
    instructor: {
      name: 'Elena Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
      role: 'Lead Product Designer'
    },
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1000',
    price: 'NGN5,000',
    level: 'Basic',
    duration: '8 Weeks',
    previewVideosCount: 3,
    isProgramming: false,
    color: 'from-purple-600 to-purple-500',
    buttonColor: 'bg-white text-purple-600 hover:bg-purple-50',
    modules: [
      {
        id: 'm1',
        title: 'Foundations of Design',
        videos: [
          { id: 'v1', title: 'Course Trailer', duration: '3:45', description: 'What you will learn.' },
          { id: 'v2', title: 'Typography', duration: '22:10', description: 'Typography rules.' },
          { id: 'v3', title: 'Color Theory', duration: '15:20', description: 'How to pick colors.' },
          { id: 'v4', title: 'Design Assessment', duration: '10:00', isAssessment: true, description: 'Design a simple wireframe.' }
        ]
      },
      {
        id: 'm2',
        title: 'UX Principles',
        videos: [
          { id: 'v5', title: 'User Research', duration: '35:00', description: 'How to conduct interviews.' },
          { id: 'v6', title: 'User Personas', duration: '20:15', description: 'Creating accurate personas.' },
          { id: 'v7', title: 'Information Architecture', duration: '28:30', description: 'Structuring your app.' }
        ]
      },
      {
        id: 'm3',
        title: 'Prototyping',
        videos: [
          { id: 'v8', title: 'Figma Basics', duration: '40:00', description: 'Learn the Figma interface.' },
          { id: 'v9', title: 'Advanced Animations', duration: '30:00', description: 'Creating interactive prototypes.' },
          { id: 'v10', title: 'Final Review Assessment', duration: '45:00', isAssessment: true, description: 'Submit your interactive prototype.' }
        ]
      }
    ],
    assignments: []
  },
  {
    id: 'c3',
    title: 'Frontend Web Dev',
    slug: 'frontend-web-dev',
    description: 'Get a solid grasp on concepts needed for frontend development to land your first job',
    instructor: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
      role: 'Frontend Engineer'
    },
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000',
    price: 'NGN5,000',
    level: 'Advanced',
    duration: '10 Weeks',
    previewVideosCount: 2,
    isProgramming: true,
    color: 'from-cyan-500 to-teal-500',
    buttonColor: 'bg-white text-cyan-600 hover:bg-cyan-50',
    modules: [
      {
        id: 'm1',
        title: 'HTML & CSS Basics',
        videos: [
          { id: 'v1', title: 'HTML Skeleton', duration: '10:00', description: 'Learn the structure of a webpage.' },
          { id: 'v2', title: 'CSS Styling', duration: '15:00', description: 'Styling techniques.' },
          { id: 'v3', title: 'Build a layout', duration: '20:00', isAssessment: true, description: 'Write code to build a layout.' }
        ]
      },
      {
        id: 'm2',
        title: 'JavaScript Fundamentals',
        videos: [
          { id: 'v4', title: 'Variables & Types', duration: '18:00', description: 'Understanding variables.' },
          { id: 'v5', title: 'Functions & Scope', duration: '22:30', description: 'How functions work in JS.' },
          { id: 'v6', title: 'DOM Manipulation', duration: '35:00', description: 'Interacting with the browser.' },
          { id: 'v7', title: 'JS Logic Quiz', duration: '20:00', isAssessment: true, description: 'Solve JS puzzles.' }
        ]
      },
      {
        id: 'm3',
        title: 'React.js Introduction',
        videos: [
          { id: 'v8', title: 'What is React?', duration: '15:00', description: 'The virtual DOM.' },
          { id: 'v9', title: 'Components & Props', duration: '25:00', description: 'Building reusable UI.' },
          { id: 'v10', title: 'State & Effects', duration: '30:00', description: 'Managing local state.' }
        ]
      }
    ],
    assignments: []
  },
  {
    id: 'c4',
    title: 'Backend Web Dev',
    slug: 'backend-web-dev',
    description: 'Get a solid grasp on concepts needed for backend development to land your first job',
    instructor: {
      name: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
      role: 'Backend Architect'
    },
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000',
    price: 'NGN5,000',
    level: 'Intermediate',
    duration: '12 Weeks',
    previewVideosCount: 3,
    isProgramming: true,
    color: 'from-green-500 to-emerald-500',
    buttonColor: 'bg-white text-green-600 hover:bg-green-50',
    modules: [
      {
        id: 'm1',
        title: 'Server Foundations',
        videos: [
          { id: 'v1', title: 'Intro to Node.js', duration: '12:00', description: 'What is Node.js?' },
          { id: 'v2', title: 'Express.js Basics', duration: '25:00', description: 'Setup an express server.' }
        ]
      },
      {
        id: 'm2',
        title: 'Database Integrations',
        videos: [
          { id: 'v3', title: 'SQL vs NoSQL', duration: '20:00', description: 'Choosing the right database.' },
          { id: 'v4', title: 'Connecting to MongoDB', duration: '35:00', description: 'Using Mongoose.' },
          { id: 'v5', title: 'Database Schema Design', duration: '28:00', description: 'Structuring your tables/collections.' },
          { id: 'v6', title: 'Build an API', duration: '40:00', isAssessment: true, description: 'Create full CRUD routes.' }
        ]
      },
      {
        id: 'm3',
        title: 'Authentication & Security',
        videos: [
          { id: 'v7', title: 'JWT Basics', duration: '25:00', description: 'How JSON Web Tokens work.' },
          { id: 'v8', title: 'Password Hashing', duration: '18:00', description: 'Securing user data.' },
          { id: 'v9', title: 'Role-Based Access Control', duration: '30:00', description: 'Admin vs User permissions.' }
        ]
      }
    ],
    assignments: []
  }
];

const EXTRA_IMAGES = [
  '1550751827-4bd374c3f58b', '1522071820081-009f0129c71c', '1517694712202-14dd9538aa97',
  '1498050108023-c5249f4df085', '1451187580459-43490279c0fa', '1531297172864-0771156feeb5',
  '1461749280684-dccba630e2f6', '1550439062-609e1531270e', '1488590528505-98d2b5dba041',
  '1504639725590-34d0984388bd', '1518770660439-4636190af475', '1460925895917-afdab827c52f',
  '1526374965328-7f61d4dc18c5', '1504384308090-c894fdcc538d', '1516321318423-f06f85e504b3'
];

const EXTRA_COURSES: Course[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `c-extra-${i}`,
  title: `Modern Tech Concept ${i + 1}`,
  slug: `modern-tech-concept-${i + 1}`,
  description: `An in-depth exploration into the modern paradigms of technology and design principles for building scalable solutions.`,
  instructor: {
    name: ['Alex Rivera', 'Jordan Lee', 'Taylor Wong', 'Morgan Smith'][i % 4],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
    role: 'Senior Engineer'
  },
  thumbnail: `https://images.unsplash.com/photo-${EXTRA_IMAGES[i]}?auto=format&fit=crop&q=80&w=1000`, 
  price: 'NGN10,000',
  level: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
  duration: `${4 + (i % 8)} Weeks`,
  previewVideosCount: 3,
  isProgramming: i % 2 === 0,
  color: 'from-blue-600 to-indigo-600',
  buttonColor: 'bg-white text-blue-600',
  modules: [
    {
      id: `m-extra-${i}-1`,
      title: 'Introduction & Setup',
      videos: [
        { id: `v-extra-${i}-1`, title: 'Course Trailer', duration: '5:00', description: 'What you will learn.' },
        { id: `v-extra-${i}-2`, title: 'Core Fundamentals', duration: '15:00', description: 'Understanding the basics.' },
        { id: `v-extra-${i}-3`, title: 'First Steps', duration: '20:00', description: 'Setting up the environment.' },
        { id: `v-extra-${i}-4`, title: 'Quick Assessment', duration: '10:00', isAssessment: true, description: 'Test the basics' }
      ]
    },
    {
      id: `m-extra-${i}-2`,
      title: 'Deep Dive',
      videos: [
        { id: `v-extra-${i}-5`, title: 'Advanced Theory', duration: '35:00', description: 'Exploring complex patterns.' },
        { id: `v-extra-${i}-6`, title: 'Practical Application', duration: '45:00', description: 'Building the project.' }
      ]
    }
  ],
  assignments: []
}));

MOCK_COURSES.push(...EXTRA_COURSES);

// Helper for simulating user state since we don't have a backend yet
export const getEnrolledCourses = () => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem('enrolled_courses');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const enrollInCourse = (courseId: string) => {
    if (typeof window === 'undefined') return;
    const enrolled = getEnrolledCourses();
    if (!enrolled.includes(courseId)) {
        localStorage.setItem('enrolled_courses', JSON.stringify([...enrolled, courseId]));
    }
};

export const isCourseEnrolled = (courseId: string) => {
    return getEnrolledCourses().includes(courseId);
};
