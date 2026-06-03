const BASE_URL = import.meta.env.VITE_APP_BASE_URL || "http://localhost:4000/api/v1";

// ==================== AUTH ENDPOINTS ====================
export const authEndpoints = {
  SENDOTP_API: `${BASE_URL}/user/sendotp`,
  SIGNUP_API: `${BASE_URL}/user/signup`,
  LOGIN_API: `${BASE_URL}/user/login`,
  RESETPASSWORD_API: `${BASE_URL}/user/reset-password`,
  RESETPASSWORDTOKEN_API: `${BASE_URL}/user/reset-password-token`,
};

// ==================== COURSE ENDPOINTS ====================
export const courseEndpoints = {
  GET_ALL_COURSE_API: `${BASE_URL}/course/getallcourses`,
  COURSE_DETAILS_API: `${BASE_URL}/course/getcourse`,
  EDIT_COURSE_API: `${BASE_URL}/course/editcourse`,
  CREATE_COURSE_API: `${BASE_URL}/course/createcourse`,
  DELETE_COURSE_API: `${BASE_URL}/course/deletecourse`,
  GET_FULL_COURSE_DETAILS_AUTHENTICATED: `${BASE_URL}/course/getFullCourseDetails`,
  LECTURE_COMPLETION_API: `${BASE_URL}/course/updateCourseProgress`,
  COURSE_QA_API: `${BASE_URL}/course/askcoursequestion`,
};

// ==================== SECTIONS & SUBSECTIONS ====================
export const courseSectionEndpoints = {
  CREATE_SECTION_API: `${BASE_URL}/course/createsection`,
  UPDATE_SECTION_API: `${BASE_URL}/course/updatesection`,
  DELETE_SECTION_API: `${BASE_URL}/course/deletesection`,
  CREATE_SUBSECTION_API: `${BASE_URL}/course/createsubsection`,
  UPDATE_SUBSECTION_API: `${BASE_URL}/course/updatesubsection`,
  DELETE_SUBSECTION_API: `${BASE_URL}/course/deletesubsection`,
};

// ==================== CATEGORY ENDPOINTS ====================
export const catagories = {
  CATAGORIES_API: `${BASE_URL}/course/showcatgory`,
  CATAGORY_PAGE_DETAILS_API: `${BASE_URL}/course/getcatgorypagedetails`,
};

// ==================== STUDENT ENDPOINTS ====================
export const studentEndpoints = {
  GET_ENROLLED_COURSES_API: `${BASE_URL}/profile/getEnrolledCourses`,
};

// ==================== RATINGS ENDPOINTS ====================
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: `${BASE_URL}/rating/getReviews`,
  CREATE_RATING_API: `${BASE_URL}/rating/createRating`,
};

// ==================== PAYMENTS ENDPOINTS ====================
export const paymentEndpoints = {
  COURSE_PAYMENT_API: `${BASE_URL}/payment/capturePayment`,
  COURSE_VERIFY_API: `${BASE_URL}/payment/verifyPayment`,
  SEND_PAYMENT_SUCCESS_EMAIL_API: `${BASE_URL}/payment/sendPaymentSuccessEmail`,
  GET_PAYMENT_STATUS_API: `${BASE_URL}/payment/paymentStatus`,
  BUY_COURSE_API: `${BASE_URL}/payment/buy`,
};

// ==================== INSTRUCTOR ENDPOINTS ====================
export const instructorEndpoints = {
  GET_INSTRUCTOR_STATS_API: `${BASE_URL}/course/instructor/stats`,
  GET_INSTRUCTOR_COURSES_API: `${BASE_URL}/course/instructor/courses`,
};

// ==================== PROFILE ENDPOINTS ====================
export const profileEndpoints = {
  GET_USER_DETAILS_API: `${BASE_URL}/profile/getUserDetails`,
  GET_USER_ENROLLED_COURSES_API: `${BASE_URL}/profile/getEnrolledCourses`,
  GET_INSTRUCTOR_DATA_API: `${BASE_URL}/profile/instructorDashboard`,
  EDIT_PROFILE_API: `${BASE_URL}/profile/updateProfile`,
  CHANGE_PASSWORD_API: `${BASE_URL}/auth/changepassword`,
  DELETE_PROFILE_API: `${BASE_URL}/profile/deleteProfile`,
  GET_ALL_USER_DETAILS_API: `${BASE_URL}/profile/getAllUserDetails`,
  UPDATE_DISPLAY_PICTURE_API: `${BASE_URL}/profile/updateDisplayPicture`,
};

// ==================== CONTACT ENDPOINTS ====================
export const contactEndpoints = {
  CONTACT_US_API: `${BASE_URL}/contact/contactUsEmail`,
};
