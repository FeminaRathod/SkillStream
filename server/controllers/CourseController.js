const User = require('../models/User');
const Course = require('../models/Course');
const Catagory = require('../models/Catagory');
const Section = require("../models/Section");
const imageUploder = require('../utils/imageUploader');
const CourseProgress = require("../models/CourseProgress");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const Subsection = require('../models/SubSection'); // Standardized to capital S
const { processCoursePdfUpload, answerCourseQuestion } = require('../utils/aiCourseEmbeddings');
const CreateCourse = async (req, resp) => {
    try {
        const { name, description, whatYouWillLearn, catagory, tag: _tag, price, status } = req.body;

        if (!name || !description || !whatYouWillLearn || !catagory || (price === undefined || price === null || price === "")) {
            return resp.status(422).json({
                message: "All fields are required for creating the course!",
                success: false,
            })
        }

        const thumbnail = req.files ? req.files.thumbnailImage : null;
        const coursePdf = req.files ? req.files.coursePdf : null;

        if (!thumbnail) {
            return resp.status(422).json({
                message: "Thumbnail image is required",
                success: false,
            })
        }

        let contentPdfUrl = null;
        let contentPdfName = null;
        if (coursePdf) {
            contentPdfName = coursePdf.name;
            const pdfUpload = await imageUploder(coursePdf.tempFilePath, process.env.COURSE_PDF_FOLDER_NAME || process.env.COURSE_THUMBNAIL_FOLDER_NAME);
            contentPdfUrl = pdfUpload.secure_url;
        }

        const validcatagory = await Catagory.findById(catagory);
        if (!validcatagory) {
            return resp.status(404).json({
                message: 'category does not exist',
                success: false,
            });
        }

        const instructorId = req.user.id || req.user._id;
        const thumbnailImage = await imageUploder(thumbnail.tempFilePath, process.env.COURSE_THUMBNAIL_FOLDER_NAME);

        let tag = _tag;
        if (typeof _tag === 'string') {
            try { tag = JSON.parse(_tag); } catch (e) { tag = [_tag]; }
        }

        const courseDoc = new Course({
            courseName: name,
            courseDescription: description,
            instructor: instructorId,
            whatYouWillLearn: whatYouWillLearn,
            catagory: validcatagory._id,
            tag: tag,
            thumbnail: thumbnailImage.secure_url,
            price: price,
            status: status || "Draft",
            contentPdfUrl,
            contentPdfName,
            embeddingStatus: 'Pending',
        });
        if (coursePdf) {
            courseDoc.contentVectorCollectionName = `course-${courseDoc._id}`;
        }
        const newCourse = await courseDoc.save();

        if (coursePdf) {
            try {
                await processCoursePdfUpload(newCourse._id.toString(), coursePdf.tempFilePath);
                newCourse.embeddingStatus = 'Processed';
                newCourse.embeddingProcessedAt = new Date();
                await newCourse.save();
            } catch (pdfError) {
                console.error('Course PDF embedding failed:', pdfError);
                newCourse.embeddingStatus = 'Failed';
                await newCourse.save();
            }
        }

        await User.findByIdAndUpdate(instructorId, {
            $push: { courses: newCourse._id }
        });

        validcatagory.courses.push(newCourse._id);
        await validcatagory.save();

        const populatedCourse = await Course.findById(newCourse._id)
            .populate("instructor")
            .populate("catagory")
            .populate({
                path: "courseContent",
                populate: { path: "subSection" }
            })
            .exec();

        return resp.status(200).json({
            message: 'New Course created successfully',
            success: true,
            data: populatedCourse,
        })
    } catch (error) {
        return resp.status(500).json({
            message: 'Error creating course',
            success: false,
            error: error.message,
        })
    }
}

const getAllCourses = async (req, resp) => {
    try {
        const allCourses = await Course.find({ status: "Published" })
            .populate('instructor')
            .populate('catagory')
            .populate('ratingAndReviews')
            .populate({
                path: 'courseContent',
                populate: { path: 'subSection' }
            })
            .exec();
        return resp.status(200).json({
            success: true,
            data: allCourses,
        })
    } catch (error) {
        return resp.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

const GetOneCourseAllDetails = async (req, resp) => {
    try {
        const { courseId } = req.params;
        const allCourseDetails = await Course.findById(courseId)
            .populate("instructor")
            .populate("catagory")
            .populate({
                path: "ratingAndReviews",
                populate: {
                    path: "user",
                    select: "firstName lastName image email",
                },
            })
            .populate({
                path: "courseContent",
                populate: { path: "subSection" },
            })
            .exec()

        if (!allCourseDetails) {
            return resp.status(403).json({
                message: "Course not found",
                success: false,
            })
        }

        return resp.status(200).json({
            success: true,
            data: allCourseDetails,
        })
    } catch (error) {
        return resp.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

const EditCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if (!course) return res.status(404).json({ error: "Course not found" })

        if (req.files && req.files.thumbnailImage) {
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await imageUploder(thumbnail.tempFilePath, process.env.COURSE_THUMBNAIL_FOLDER_NAME)
            course.thumbnail = thumbnailImage.secure_url
        }

        if (req.files && req.files.coursePdf) {
            const coursePdf = req.files.coursePdf;
            const pdfUpload = await imageUploder(coursePdf.tempFilePath, process.env.COURSE_PDF_FOLDER_NAME || process.env.COURSE_THUMBNAIL_FOLDER_NAME);
            course.contentPdfUrl = pdfUpload.secure_url;
            course.contentPdfName = coursePdf.name;
            course.contentVectorCollectionName = `course-${course._id}`;
            
            try {
                await processCoursePdfUpload(course._id.toString(), coursePdf.tempFilePath);
                course.embeddingStatus = 'Processed';
                course.embeddingProcessedAt = new Date();
            } catch (pdfError) {
                console.error('Course PDF embedding failed during edit:', pdfError);
                course.embeddingStatus = 'Failed';
            }
        }

        for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
                if (key === "courseId" || key === "instructor") continue;
                if (key === "tag" || key === "instructions") {
                    try { course[key] = JSON.parse(updates[key]) } catch (e) { course[key] = updates[key] }
                } else {
                    course[key] = updates[key]
                }
            }
        }
        await course.save();

        const updatedCourse = await Course.findById(courseId)
            .populate({
                path: "instructor",
                populate: { path: "additionalDetails" },
            })
            .populate("catagory")
            .populate({
                path: "courseContent",
                populate: { path: "subSection" },
            })
            .exec()

        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
}

const DeleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const course = await Course.findById(courseId)
        if (!course) return res.status(404).json({ message: "Course not found" })

        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, { $pull: { courses: courseId } })
        }

        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            const section = await Section.findById(sectionId)
            if (section) {
                for (const subSectionId of section.subSection) {
                    await Subsection.findByIdAndDelete(subSectionId)
                }
            }
            await Section.findByIdAndDelete(sectionId)
        }

        await Catagory.findByIdAndUpdate(course.catagory, { $pull: { courses: courseId } });
        await User.findByIdAndUpdate(course.instructor, { $pull: { courses: courseId } });
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })
    }
}

const getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        const courseDetails = await Course.findById(courseId)
            .populate({
                path: "instructor",
                populate: { path: "additionalDetails" },
            })
            .populate("catagory")
            .populate({
                path: "courseContent",
                populate: { path: "subSection" },
            })
            .exec()

        const userProgress = await User.findById(userId).populate({
            path: "courseProgress",
            match: { courseID: courseId }
        });

        let courseProgressCount = userProgress?.courseProgress?.[0];

        if (!courseDetails) {
            return res.status(400).json({ success: false, message: "Course not found" })
        }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                totalDurationInSeconds += parseInt(subSection.timeDuration) || 0
            })
        })

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration: convertSecondsToDuration(totalDurationInSeconds),
                completedVideos: courseProgressCount?.completedVideos || [],
            },
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user.id
        const instructorCourses = await Course.find({ instructor: instructorId }).sort({ createdAt: -1 })
        res.status(200).json({ success: true, data: instructorCourses })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
}

const updateCourseProgress = async (req, res) => {
    const { courseId, subsectionId } = req.body
    const userId = req.user.id
    try {
        const subsection = await Subsection.findById(subsectionId);
        if (!subsection) return res.status(404).json({ error: "Invalid subsection" });

        const user = await User.findById(userId).populate("courseProgress");
        let courseProgress = user.courseProgress.find((cp) => cp.courseID.toString() === courseId);

        if (!courseProgress) {
            courseProgress = await CourseProgress.create({ courseID: courseId, completedVideos: [] });
            user.courseProgress.push(courseProgress._id);
            await user.save();
        }

        if (courseProgress.completedVideos.includes(subsectionId)) {
            courseProgress.completedVideos.pull(subsectionId);
        } else {
            courseProgress.completedVideos.push(subsectionId);
        }
        await courseProgress.save();
        return res.status(200).json({ message: "Course progress updated" })
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" })
    }
}

const AskCourseQuestion = async (req, res) => {
    console.log("AskCourseQuestion controller hit. Body:", req.body);
    try {
        const { courseId, question } = req.body;
        if (!courseId || !question) {
            return res.status(422).json({ success: false, message: 'courseId and question are required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        if (!course.contentPdfUrl) {
            return res.status(400).json({ success: false, message: 'No course PDF content is available for this course.' });
        }

        const aiResponse = await answerCourseQuestion(course, question);
        return res.status(200).json({ success: true, data: aiResponse });
    } catch (error) {
        console.error('AskCourseQuestion ERROR:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { CreateCourse, getAllCourses, GetOneCourseAllDetails, EditCourse, DeleteCourse, getFullCourseDetails, updateCourseProgress, getInstructorCourses, AskCourseQuestion };