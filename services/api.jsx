import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://www.hoshmandasra.edu.af/api';

class ApiService {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
  }

  // Initialize from storage
  async initialize() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token) this.token = token;
      if (userData) this.user = JSON.parse(userData);
      
      return { token: this.token, user: this.user };
    } catch (error) {
      console.error('Failed to initialize API:', error);
      return { token: null, user: null };
    }
  }

  // Save auth data
  async saveAuthData(token, user) {
    this.token = token;
    this.user = user;
    
    try {
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }

  // Clear auth data
  async clearAuthData() {
    this.token = null;
    this.user = null;
    
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  // Request wrapper
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'fa-IR',
      ...options.headers,
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        await this.clearAuthData();
        // You might want to navigate to login screen here
        throw new Error('Session expired. Please login again.');
      }
      
      // Handle 429 Too Many Requests
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      
      return data;
      
    } catch (error) {
      console.error('API Error:', {
        endpoint,
        error: error.message,
        config
      });
      
      // Check if it's a network error
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // --- AUTHENTICATION ---
  async login(email, password) {
    const response = await this.request('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.session?.token) {
      await this.saveAuthData(response.data.session.token, response.data.user);
    }
    
    return response;
  }

  async register(userData) {
    return this.request('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout.php', {
        method: 'POST',
      });
    } finally {
      await this.clearAuthData();
    }
  }

  // --- COURSES ---
  async getCourses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/courses/index.php?${queryString}`);
  }

  async getFeaturedCourses() {
    return this.request('/courses/index.php?path=featured');
  }

  async getCourseById(id) {
    return this.request(`/courses/index.php?path=${id}`);
  }

  async enrollInCourse(courseId) {
    return this.request(`/courses/index.php?path=enroll/${courseId}`, {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
  }

  // --- LESSONS ---
  async getLessonById(lessonId) {
    return this.request(`/courses/lessons.php?id=${lessonId}`);
  }

  async markLessonComplete(lessonId, courseId) {
    return this.request('/courses/lessons.php?action=complete', {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lessonId, course_id: courseId }),
    });
  }

  // --- VIDEO PROGRESS ---
  async saveVideoProgress(data) {
    return this.request('/videos/progress.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVideoProgress(lessonId) {
    return this.request(`/videos/progress.php?lesson_id=${lessonId}`);
  }

  // --- ASSIGNMENTS ---
  async getAssignments(courseId = null) {
    const query = courseId ? `?course_id=${courseId}` : '';
    return this.request(`/assignments/index.php${query}`);
  }

  async submitAssignment(assignmentId, fileUrl) {
    return this.request('/assignments/index.php?action=submit', {
      method: 'POST',
      body: JSON.stringify({
        assignment_id: assignmentId,
        file_url: fileUrl,
      }),
    });
  }

  // --- EXAMS ---
  async getExams(courseId = null) {
    const query = courseId ? `?course_id=${courseId}` : '';
    return this.request(`/exams/index.php${query}`);
  }

  async startExam(examId) {
    return this.request('/exams/index.php?action=start', {
      method: 'POST',
      body: JSON.stringify({ exam_id: examId }),
    });
  }

  async submitExam(data) {
    return this.request('/exams/index.php?action=submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- SEARCH ---
  async search(query, type = 'all', page = 1) {
    return this.request(`/search/index.php?q=${encodeURIComponent(query)}&type=${type}&page=${page}`);
  }

  // --- USER PROFILE ---
  async getProfile() {
    return this.request('/users/profile.php');
  }

  async updateProfile(data) {
    return this.request('/users/profile.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- DASHBOARDS ---
  async getAdminDashboard(timeframe = 'month') {
    return this.request(`/admin/dashboard.php?timeframe=${timeframe}`);
  }

  async getTeacherDashboard() {
    return this.request('/teacher/dashboard.php');
  }

  async getStudentDashboard() {
    return this.request('/student/dashboard.php');
  }

  // Get appropriate dashboard based on user role
  async getDashboard() {
    const role = this.user?.role;
    
    switch (role) {
      case 'admin':
        return this.getAdminDashboard();
      case 'teacher':
        return this.getTeacherDashboard();
      case 'student':
        return this.getStudentDashboard();
      default:
        throw new Error('Unknown user role');
    }
  }

  // --- ADMIN SPECIFIC ---
  async getAdminUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/users.php?${queryString}`);
  }

  async createAdminUser(userData) {
    return this.request('/admin/users.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateAdminUser(userId, userData) {
    return this.request('/admin/users.php', {
      method: 'PUT',
      body: JSON.stringify({ id: userId, ...userData }),
    });
  }

  async deleteAdminUser(userId) {
    return this.request(`/admin/users.php?id=${userId}`, {
      method: 'DELETE',
    });
  }

  // --- TEACHER SPECIFIC ---
  async getTeacherCourses() {
    return this.request('/teacher/courses.php');
  }

  async createTeacherCourse(courseData) {
    return this.request('/teacher/courses.php', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async getTeacherLessons(courseId) {
    return this.request(`/teacher/lessons.php?course_id=${courseId}`);
  }

  async createTeacherLesson(lessonData) {
    return this.request('/teacher/lessons.php', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  // --- STUDENT SPECIFIC ---
  async getStudentProgress(courseId = null) {
    const query = courseId ? `?course_id=${courseId}` : '';
    return this.request(`/courses/progress.php${query}`);
  }

  async updateStudentProgress(data) {
    return this.request('/courses/progress.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStudentAssignments() {
    return this.request('/assignments/index.php');
  }

  async submitStudentAssignment(data) {
    return this.request('/assignments/submissions.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

// Initialize on app start
apiService.initialize().catch(console.error);

export default apiService;