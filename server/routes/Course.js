//course 
//catagory 
//sections//
//subsections
//rating 

const express = require('express');
const router = express.Router();
const { isInstructor, auth, isStudent, isAdmin } = require('../middleware/auth');
const { CreateCourse, getAllCourses, GetOneCourseAllDetails, EditCourse, DeleteCourse, getFullCourseDetails, updateCourseProgress, AskCourseQuestion } = require('../controllers/CourseController');
const { CreateSection, DeleteSection, UpdateSection } = require('../controllers/SectionController');
const { CreateSubSection, DeleteSubSection, UpdateSubSection } = require('../controllers/SubSectionController');
const { CreateCatagory, getCatgoryPageDetails, ShowAllCatagory } = require('../controllers/Catagory');
const { getInstructorStats, getInstructorCourses } = require('../controllers/InstructorController');


router.post('/createcourse', auth, isInstructor, CreateCourse);
router.post('/createsection', auth, isInstructor, CreateSection);
router.post('/createsubsection', auth, isInstructor, CreateSubSection);


router.put('/updatesection/:sectionId', auth, isInstructor, UpdateSection);
router.put('/updatesubsection/:subSectionId', auth, isInstructor, UpdateSubSection);
// router.put('/updatesubsection/:subSectionId', auth, isInstructor, UpdateSubSection);
router.post('/editcourse', auth, isInstructor, EditCourse); // Added editCourse route
router.post('/getFullCourseDetails', auth, getFullCourseDetails);
router.post('/updateCourseProgress', auth, isStudent, updateCourseProgress);
router.post('/askcoursequestion', auth, isStudent, AskCourseQuestion);


router.delete('/deletesection', auth, isInstructor, DeleteSection);
router.delete('/deletesubsection', auth, isInstructor, DeleteSubSection);
router.delete('/deletecourse', auth, isInstructor, DeleteCourse); // Added deleteCourse route

router.get('/getcatgorypagedetails/:catalogId', getCatgoryPageDetails);
router.get('/showallcatagories', ShowAllCatagory);

// Instructor dashboard routes
router.get('/instructor/stats', auth, isInstructor, getInstructorStats);
router.get('/instructor/courses', auth, isInstructor, getInstructorCourses);

router.get('/getallcourses', getAllCourses);
router.get('/getcourse/:courseId', GetOneCourseAllDetails);

router.post('/enrollcourse/:courseId', auth, isStudent,);

module.exports = router;
