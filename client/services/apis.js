const BASE_URL = import.meta.env.VITE_APP_BASE_URL || "http://localhost:4000/api/v1";

// ==================== CATEGORIES ====================
export const catagories = {
    CATAGORIES_API: `${BASE_URL}/course/showallcatagories`,
}

// ==================== COURSE ENDPOINTS ====================
export const courseEndpoints = {
    GET_ALL_COURSE_API: `${BASE_URL}/course/getallcourses`,
    GET_COURSE: `${BASE_URL}/course/getcourse`,
    CREATE_COURSE_API: `${BASE_URL}/course/createcourse`,
    CREATE_SECTION_API: `${BASE_URL}/course/createsection`,
    CREATE_SUBSECTION_API: `${BASE_URL}/course/createsubsection`,
    DELETE_COURSE_API: `${BASE_URL}/course/deletecourse`,
    EDIT_COURSE_API: `${BASE_URL}/course/editcourse`,
    GET_FULL_COURSE_DETAILS_AUTHENTICATED: `${BASE_URL}/course/getFullCourseDetails`,
    LECTURE_COMPLETION_API: `${BASE_URL}/course/updateCourseProgress`,
    UPDATE_SECTION_API: `${BASE_URL}/course/updatesection`,
    UPDATE_SUBSECTION_API: `${BASE_URL}/course/updatesubsection`,
    COURSE_QA_API: `${BASE_URL}/course/askcoursequestion`,
}

// ==================== INSTRUCTOR ENDPOINTS ====================
export const instructorEndpoints = {
    GET_INSTRUCTOR_STATS_API: `${BASE_URL}/course/instructor/stats`,
    GET_INSTRUCTOR_COURSES_API: `${BASE_URL}/course/instructor/courses`
}

// ==================== AUTH ENDPOINTS ====================
export const auth = {
    AUTH_API: `${BASE_URL}/user/login`,
    SIGNUP_API: `${BASE_URL}/user/signup`,
    SENDOTP_API: `${BASE_URL}/user/sendotp`,
    MAIL_SENDER_API: `${BASE_URL}/user/reset-password-token`,
    CHANGE_PASSWORD_API: `${BASE_URL}/user/reset-password`
}

// ==================== CONTACT ENDPOINTS ====================
export const contact = {
    CONTACT_API: `${BASE_URL}/contact/contactus`
}

// ==================== CATEGORY PAGE ====================
export const catagorypage = {
    CATAGORY_PAGE_API: `${BASE_URL}/course/getcatgorypagedetails/`
}

// ==================== PROFILE ENDPOINTS ====================
export const profile = {
    UPDATE_PROFILE_API: `${BASE_URL}/profile/updateprofile`,
    DELETE_ACCOUNT_API: `${BASE_URL}/profile/deleteaccount`,
    GET_ALL_USERS_API: `${BASE_URL}/profile/getallusers`,
    GET_ENROLLED_COURSES_API: `${BASE_URL}/profile/getenrolledcourses`,
    UPLOAD_PROFILE_PICTURE_API: `${BASE_URL}/profile/uploadprofilepicture`,
}

// ==================== SETTINGS ENDPOINTS ====================
export const settingsEndpoints = {
    UPDATE_DISPLAY_PICTURE_API: `${BASE_URL}/profile/uploadprofilepicture`,
    UPDATE_PROFILE_API: `${BASE_URL}/profile/updateprofile`,
    CHANGE_PASSWORD_API: `${BASE_URL}/user/changepassword`,
    DELETE_PROFILE_API: `${BASE_URL}/profile/deleteaccount`,
}

// ==================== PAYMENT ENDPOINTS ====================
export const paymentEndpoints = {
    CREATE_ORDER_API: `${BASE_URL}/payment/createorder`,
    VERIFY_PAYMENT_API: `${BASE_URL}/payment/verifyPayment`,
    CREATE_MULTI_ORDER_API: `${BASE_URL}/payment/createmultiorder`,
    VERIFY_MULTI_PAYMENT_API: `${BASE_URL}/payment/verifymultipayment`,
    GET_PAYMENT_HISTORY_API: `${BASE_URL}/payment/getPaymentHistory`,
}

// ==================== RATINGS ENDPOINTS ====================
export const ratingsEndpoints = {
    REVIEW_DETAILS_API: `${BASE_URL}/rating/getallratings`,
    CREATE_RATING_API: `${BASE_URL}/rating/createrating`,
}
