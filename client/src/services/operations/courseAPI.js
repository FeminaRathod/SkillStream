import { toast } from "react-hot-toast";
import { apiConnector } from "../../../services/apiConnector";
import { instructorEndpoints, courseEndpoints, ratingsEndpoints } from "../../../services/apis";

const { GET_INSTRUCTOR_STATS_API, GET_INSTRUCTOR_COURSES_API } = instructorEndpoints;
const { GET_FULL_COURSE_DETAILS_AUTHENTICATED, LECTURE_COMPLETION_API, COURSE_QA_API } = courseEndpoints;

// Get instructor statistics
export const getInstructorStats = async (token) => {
    const toastId = toast.loading("Loading statistics...");
    let result = null;

    try {
        const response = await apiConnector(
            "GET",
            GET_INSTRUCTOR_STATS_API,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response.data.message);
        }

        result = response?.data?.data;
        toast.success("Statistics loaded successfully");
    } catch (error) {
        console.error("GET_INSTRUCTOR_STATS_API ERROR:", error);
        toast.error(error?.response?.data?.message || "Could not fetch statistics");
    }

    toast.dismiss(toastId);
    return result;
};

// Get instructor courses
export const getInstructorCourses = async (token) => {
    const toastId = toast.loading("Loading courses...");
    let result = null;

    try {
        const response = await apiConnector(
            "GET",
            GET_INSTRUCTOR_COURSES_API,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response.data.message);
        }

        result = response?.data?.data;
        toast.success("Courses loaded successfully");
    } catch (error) {
        console.error("GET_INSTRUCTOR_COURSES_API ERROR:", error);
        toast.error(error?.response?.data?.message || "Could not fetch courses");
    }

    toast.dismiss(toastId);
    return result;
};

// Get full details of a course
export const getFullDetailsOfCourse = async (courseId, token) => {
    const toastId = toast.loading("Loading course details...")
    let result = null
    try {
        const response = await apiConnector(
            "POST",
            GET_FULL_COURSE_DETAILS_AUTHENTICATED,
            {
                courseId,
            },
            {
                Authorization: `Bearer ${token}`,
            }
        )
        console.log("GET_FULL_COURSE_DETAILS_AUTHENTICATED API RESPONSE............", response)

        if (!response.data.success) {
            throw new Error(response.data.message)
        }
        result = response?.data?.data
    } catch (error) {
        console.log("GET_FULL_COURSE_DETAILS_AUTHENTICATED API ERROR............", error)
        result = error.response.data
        toast.error(error.response.data.message);
    }
    toast.dismiss(toastId)
    return result
}

// mark a lecture as complete
export const markLectureAsComplete = async (data, token) => {
    let result = null
    console.log("mark complete data", data)
    const toastId = toast.loading("Marking...")
    try {
        const response = await apiConnector("POST", LECTURE_COMPLETION_API, data, {
            Authorization: `Bearer ${token}`,
        })
        console.log(
            "MARK_LECTURE_AS_COMPLETE_API API RESPONSE............",
            response
        )

        if (!response.data.message) {
            throw new Error(response.data.error)
        }
        toast.success("Lecture Completed")
        result = true
    } catch (error) {
        console.log("MARK_LECTURE_AS_COMPLETE_API API ERROR............", error)
        toast.error(error.message)
        result = false
    }
    toast.dismiss(toastId)
    return result
}

// create a rating for course
export const createRating = async (data, token) => {
    const toastId = toast.loading("Creating Rating...")
    let success = false
    try {
        const response = await apiConnector(
            "POST",
            ratingsEndpoints.CREATE_RATING_API,
            data,
            {
                Authorization: `Bearer ${token}`,
            }
        )
        console.log("CREATE_RATING_API API RESPONSE............", response)
        if (!response?.data?.success) {
            throw new Error(response?.data?.message)
        }
        toast.success("Rating Created")
        success = true
    } catch (error) {
        success = false
        console.log("CREATE_RATING_API API ERROR............", error)
        toast.error(error.response?.data?.message || error.message)
    }
    toast.dismiss(toastId)
    return success
}
// get all ratings
export const getAllRatings = async () => {
    let result = []
    try {
        const response = await apiConnector("GET", ratingsEndpoints.REVIEW_DETAILS_API)
        console.log("GET_ALL_RATINGS_API RESPONSE............", response)
        if (!response?.data?.success) {
            throw new Error(response?.data?.message)
        }
        result = response?.data?.data
    } catch (error) {
        console.log("GET_ALL_RATINGS_API ERROR............", error)
        // toast.error(error.message)
    }
    return result
}

// Ask a question about the course using AI
export const askCourseQuestion = async (courseId, question, token) => {
    const toastId = toast.loading("Getting answer...");
    let result = null;
    try {
        const response = await apiConnector(
            "POST",
            COURSE_QA_API,
            { courseId, question },
            {
                Authorization: `Bearer ${token}`,
            }
        );
        console.log("COURSE_QA_API RESPONSE............", response);
        
        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to get answer");
        }
        
        result = response?.data?.data;
        toast.success("Answer generated!");
    } catch (error) {
        console.log("COURSE_QA_API ERROR............", error);
        toast.error(error?.response?.data?.message || error.message || "Failed to get answer");
    }
    toast.dismiss(toastId);
    return result;
};
