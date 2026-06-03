import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import RenderSteps from './AddCourse/RenderSteps';
import ProgressBar from './AddCourse/ProgressBar';
import { FiSave, FiAlertCircle } from 'react-icons/fi';
import { getFullDetailsOfCourse } from '../../services/operations/courseAPI';
import Loader from '../common/Loader';

const DRAFT_KEY = 'courseBuilderDraft';

const AddCourse = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Main form state
  const [currentStep, setCurrentStep] = useState(1);
  const [courseInfo, setCourseInfo] = useState({
    courseName: '',
    courseDescription: '',
    whatYouWillLearn: '',
    price: '',
    category: '',
    tags: [],
    thumbnail: null,
    coursePdf: null,
  });
  const [courseBuilder, setCourseBuilder] = useState({
    sections: [],
  });
  const [publishSettings, setPublishSettings] = useState({
    status: 'Draft',
  });

  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Draft management functions
  const loadDraft = () => {
    try {
      const draftData = localStorage.getItem(DRAFT_KEY);
      if (draftData) {
        const draft = JSON.parse(draftData);
        setCurrentStep(draft.step || 1);
        setCourseInfo(draft.courseInfo || courseInfo);
        setCourseBuilder(draft.courseBuilder || courseBuilder);
        setPublishSettings(draft.publishSettings || publishSettings);
        setLastSaved(draft.lastSaved);
        setHasDraft(true);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = () => {
    try {
      const draftData = {
        step: currentStep,
        courseInfo,
        courseBuilder,
        publishSettings,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      setLastSaved(draftData.lastSaved);
      setHasDraft(true);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
      setLastSaved(null);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear the draft? This action cannot be undone.')) {
      clearDraft();
      // Reset all state
      setCurrentStep(1);
      setCourseInfo({
        courseName: '',
        courseDescription: '',
        whatYouWillLearn: '',
        price: '',
        category: '',
        tags: [],
        thumbnail: null,
        coursePdf: null,
      });
      setCourseBuilder({ sections: [] });
      setPublishSettings({ status: 'Draft' });
    }
  };

  // Create a loading state
  const [loading, setLoading] = useState(false);
  const { courseId } = useParams();

  useEffect(() => {
    const populateCourseDetails = async () => {
      setLoading(true);
      try {
        const result = await getFullDetailsOfCourse(courseId, token);
        if (result?.courseDetails) {
            // Assume the API returns structure compatible with our state.
            // We might need to transform it.
            // For now, let's just create an edit flag and maybe log it.
            // But wait, the form fields use `courseInfo`.
            // We need to map result.courseDetails to courseInfo.
             const course = result.courseDetails;
             setCourseInfo({
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                whatYouWillLearn: course.whatYouWillLearn,
                price: course.price,
                category: course.catagory?._id, // Backend uses 'catagory'
                tags: course.tag, // API might return 'tag' or 'tags'
                thumbnail: course.thumbnail,
                instructions: course.instructions,
                coursePdf: course.contentPdfUrl ? { name: course.contentPdfName || 'Course PDF', url: course.contentPdfUrl } : null,
             });
             setCourseBuilder({
                sections: course.courseContent.map(section => ({
                    ...section,
                    subSections: section.subSection || [],
                })),
             });
             setPublishSettings({
                status: course.status,
             });
        }
      } catch (error) {
        console.error("Could not fetch course details", error);
      }
      setLoading(false);
    };

    if (courseId) {
        populateCourseDetails();
    }
  }, [courseId]);

  // Auto-save when moving between steps
  useEffect(() => {
    if ((currentStep > 1 || courseInfo.courseName) && !courseId) { // Don't auto-save draft in edit mode to avoid overwriting with partial data, or handle differently
      saveDraft();
    }
  }, [currentStep, courseInfo.courseName]); // added dependency

  if (loading) {
    return (
        <div className="grid flex-1 place-items-center">
            <Loader />
        </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-richblack-5 text-3xl font-semibold mb-2">
          Add Course
        </h1>
        <p className="text-richblack-300">
          Create a new course in 3 simple steps
        </p>
      </div>

      {/* Draft Indicator */}
      {hasDraft && lastSaved && (
        <div className="mb-6 bg-richblack-800 border border-caribbeangreen-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-caribbeangreen-200" size={20} />
            <div>
              <p className="text-richblack-5 font-medium">Draft Available</p>
              <p className="text-richblack-400 text-sm">
                Last saved: {new Date(lastSaved).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearDraft}
            className="text-pink-200 hover:text-pink-100 text-sm font-medium transition-colors"
          >
            Clear Draft
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} />

      {/* Main Form Container */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-6 md:p-8 mt-6">
        <RenderSteps
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          courseInfo={courseInfo}
          setCourseInfo={setCourseInfo}
          courseBuilder={courseBuilder}
          setCourseBuilder={setCourseBuilder}
          publishSettings={publishSettings}
          setPublishSettings={setPublishSettings}
          saveDraft={saveDraft}
          clearDraft={clearDraft}
          token={token}
          navigate={navigate}
          editCourse={!!courseId}
        />
      </div>

      {/* Manual Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={saveDraft}
          className="flex items-center gap-2 bg-richblack-700 text-richblack-5 px-4 py-2 rounded-lg hover:bg-richblack-600 transition-colors"
        >
          <FiSave size={18} />
          Save Draft
        </button>
      </div>
    </div>
  );
};

export default AddCourse;
