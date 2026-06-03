import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiChevronLeft, FiUpload, FiCheckCircle } from 'react-icons/fi';
import { apiConnector } from '../../../../services/apiConnector';
import { courseEndpoints } from '../../../../services/apis';

const PublishCourse = ({
  courseInfo,
  courseBuilder,
  publishSettings,
  setPublishSettings,
  setCurrentStep,
  clearDraft,
  token,
  navigate,
  editCourse,
}) => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublish = async () => {
    try {
      // 1. Validation for Thumbnail
      if (!courseInfo.thumbnail && !editCourse) {
        toast.error('Thumbnail is required');
        return;
      }
      if ((courseInfo.thumbnail && !(courseInfo.thumbnail instanceof File || courseInfo.thumbnail instanceof Blob)) && !editCourse) {
           toast.error('Thumbnail must be a valid file for new courses');
           return;
      }

      // 2. Validation for Sections/Subsections
      if (courseBuilder.sections.length === 0) {
          toast.error("Please add at least one section");
          return;
      }
      
      let missingVideo = false;
      for (const section of courseBuilder.sections) {
        for (const subSection of section.subSections) {
           const hasVideoFile = subSection.video instanceof File || subSection.video instanceof Blob;
           const hasVideoUrl = subSection.videoUrl; // Assuming AddCourse maps this or it exists on object
           
           if (!hasVideoFile && (!editCourse || !hasVideoUrl)) {
             missingVideo = true;
             break;
           }
        }
        if (missingVideo) break;
      }

      if (missingVideo) {
        toast.error('Some lecture videos are missing.');
        setCurrentStep(2);
        return;
      }

      setLoading(true);
      const toastId = toast.loading(editCourse ? 'Updating course...' : 'Creating your course...');

      let courseIdToUse = courseId;

      // --- EDIT MODE ---
      if (editCourse) {
          // 1. Update Course Details
          const formData = new FormData();
          formData.append('courseId', courseId);
          formData.append('name', courseInfo.courseName);
          formData.append('description', courseInfo.courseDescription);
          formData.append('whatYouWillLearn', courseInfo.whatYouWillLearn);
          formData.append('price', courseInfo.price);
          formData.append('catagory', courseInfo.category);
          formData.append('tag', JSON.stringify(courseInfo.tags));
          formData.append('status', publishSettings.status);
          
          if (courseInfo.thumbnail instanceof File) {
              formData.append('thumbnailImage', courseInfo.thumbnail);
          }
          
          // Add PDF if provided and is a new file
          if (courseInfo.coursePdf instanceof File) {
            formData.append('coursePdf', courseInfo.coursePdf);
          }

          const courseResponse = await apiConnector(
            'POST', 
            courseEndpoints.EDIT_COURSE_API, 
            formData, 
            {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            }
          );
          
          if (!courseResponse.data.success) {
             throw new Error("Failed to update course details");
          }
          toast.success("Course details updated");

          // 2. Update/Create Sections & Subsections
           for (const section of courseBuilder.sections) {
               let sectionId = section._id;
               // If it's a new section (temp id), create it
               if (!sectionId || sectionId.toString().startsWith("temp-")) { 
                   const sectionRes = await apiConnector(
                       "POST", 
                       courseEndpoints.CREATE_SECTION_API,
                       { sectionName: section.sectionName, courseId },
                       { Authorization: `Bearer ${token}` }
                   );
                   sectionId = sectionRes.data.data._id;
               } else {
                   // Update existing section
                   await apiConnector(
                       "PUT",
                       `${courseEndpoints.UPDATE_SECTION_API}/${sectionId}`,
                       { sectionName: section.sectionName, sectionId },
                       { Authorization: `Bearer ${token}` }
                   );
               }

               // Subsections
               for (const sub of section.subSections) {
                   const subData = new FormData();
                   subData.append('title', sub.title);
                   subData.append('description', sub.description);
                   subData.append('timeDuration', sub.duration || '0');
                   
                   if (sub.video instanceof File) {
                       subData.append('videoUpload', sub.video);
                   }

                   let subId = sub._id;
                   if (!subId || subId.toString().startsWith("temp-")) {
                       // Create SubSection
                       subData.append('sectionId', sectionId);
                       await apiConnector(
                           "POST",
                           courseEndpoints.CREATE_SUBSECTION_API,
                           subData,
                           { Authorization: `Bearer ${token}` } // multipart handled by axios based on formData? apiConnector sets it?
                       );
                   } else {
                       // Update SubSection
                       subData.append('subSectionId', subId);
                       // We need to pass subId in body AND URL? Controller checks body.
                       await apiConnector(
                           "PUT",
                           `${courseEndpoints.UPDATE_SUBSECTION_API}/${subId}`,
                           subData,
                           { Authorization: `Bearer ${token}` }
                       );
                   }
               }
           }
           toast.success("Course updated successfully!", { id: toastId });

      } else {
          // --- CREATE MODE ---
          // Step 1: Create the course
          const formData = new FormData();
          formData.append('name', courseInfo.courseName);
          formData.append('description', courseInfo.courseDescription);
          formData.append('whatYouWillLearn', courseInfo.whatYouWillLearn);
          formData.append('price', courseInfo.price);
          formData.append('catagory', courseInfo.category);
          formData.append('tag', JSON.stringify(courseInfo.tags));
          formData.append('thumbnailImage', courseInfo.thumbnail);
          formData.append('status', publishSettings.status);
          
          // Add PDF if provided
          if (courseInfo.coursePdf instanceof File) {
            formData.append('coursePdf', courseInfo.coursePdf);
          }

          const courseResponse = await apiConnector(
            'POST',
            courseEndpoints.CREATE_COURSE_API,
            formData,
            {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            }
          );

          if (!courseResponse.data.success) {
            throw new Error(courseResponse.data.message || 'Failed to create course');
          }

          const createdCourse = courseResponse.data.data;
          courseIdToUse = createdCourse._id; 
          toast.success('Course created successfully!', { id: toastId });

          // Step 2: Create sections and subsections
          if (courseBuilder.sections.length > 0) {
            toast.loading('Adding sections and lectures...', { id: toastId });

            for (const section of courseBuilder.sections) {
              // Create section
              const sectionResponse = await apiConnector(
                'POST',
                courseEndpoints.CREATE_SECTION_API,
                {
                  sectionName: section.sectionName,
                  courseId: createdCourse._id,
                },
                {
                  Authorization: `Bearer ${token}`,
                }
              );

              if (!sectionResponse.data.success) {
                console.error('Failed to create section:', section.sectionName);
                continue;
              }

              const createdSection = sectionResponse.data.data;

              // Create subsections for this section
              if (section.subSections.length > 0) {
                for (const subSection of section.subSections) {
                  try {
                    const subSectionData = new FormData();
                    subSectionData.append('sectionId', createdSection._id);
                    subSectionData.append('title', subSection.title);
                    subSectionData.append('description', subSection.description);
                    // Allow backend to calculate duration if frontend doesn't provide one
                    subSectionData.append('timeDuration', subSection.duration || '0'); 

                    if (subSection.video instanceof File) {
                      subSectionData.append('videoUpload', subSection.video);
                    }

                    await apiConnector(
                      'POST',
                      courseEndpoints.CREATE_SUBSECTION_API,
                      subSectionData,
                      {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                      }
                    );
                  } catch (error) {
                    console.error('Failed to create subsection:', subSection.title, error);
                  }
                }
              }
            }
          }
           toast.success('Course published successfully!', { id: toastId });
      }

      // Clear draft and redirect
      clearDraft();
      setTimeout(() => {
        navigate('/dashboard/my-courses');
      }, 1500);
    } catch (error) {
      console.error('Error publishing course:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to publish course. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-richblack-5 text-2xl font-semibold mb-6">
        Review & Publish
      </h2>

      {/* Course Information Summary */}
      <div className="bg-richblack-700 border border-richblack-600 rounded-xl p-6">
        <h3 className="text-richblack-5 text-lg font-semibold mb-4 flex items-center gap-2">
          <FiCheckCircle className="text-caribbeangreen-200" />
          Course Information
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-richblack-400 text-sm">Course Title</p>
            <p className="text-richblack-5 font-medium">{courseInfo.courseName}</p>
          </div>
          <div>
            <p className="text-richblack-400 text-sm">Description</p>
            <p className="text-richblack-5">{courseInfo.courseDescription}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-richblack-400 text-sm">Price</p>
              <p className="text-richblack-5 font-medium">₹{courseInfo.price}</p>
            </div>
            <div>
              <p className="text-richblack-400 text-sm">Tags</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {courseInfo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-caribbeangreen-700 text-caribbeangreen-50 px-2 py-1 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {courseInfo.thumbnail && (
            <div>
              <p className="text-richblack-400 text-sm mb-2">Thumbnail</p>
              {courseInfo.thumbnail instanceof File || courseInfo.thumbnail instanceof Blob ? (
                <img
                  src={URL.createObjectURL(courseInfo.thumbnail)}
                  alt="Course thumbnail"
                  className="w-48 h-27 object-cover rounded-lg border border-richblack-600"
                />
              ) : (
                <div className="w-48 h-27 flex items-center justify-center bg-richblack-800 rounded-lg border border-richblack-600">
                  <p className="text-richblack-400 text-xs text-center px-2">
                    Thumbnail saved (Re-upload might be needed if preview is missing)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Builder Summary */}
      <div className="bg-richblack-700 border border-richblack-600 rounded-xl p-6">
        <h3 className="text-richblack-5 text-lg font-semibold mb-4 flex items-center gap-2">
          <FiCheckCircle className="text-caribbeangreen-200" />
          Course Content
        </h3>
        {courseBuilder.sections.length === 0 ? (
          <p className="text-richblack-400">No sections added</p>
        ) : (
          <div className="space-y-4">
            {courseBuilder.sections.map((section, sectionIndex) => (
              <div key={section.id} className="bg-richblack-800 rounded-lg p-4">
                <h4 className="text-richblack-5 font-medium mb-2">
                  Section {sectionIndex + 1}: {section.sectionName}
                </h4>
                {section.subSections.length === 0 ? (
                  <p className="text-richblack-400 text-sm ml-4">No lectures</p>
                ) : (
                  <ul className="ml-4 space-y-1">
                    {section.subSections.map((sub, subIndex) => (
                      <li key={sub.id} className="text-richblack-300 text-sm">
                        • Lecture {subIndex + 1}: {sub.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-richblack-600">
          <p className="text-richblack-400 text-sm">
            Total: {courseBuilder.sections.length} sections,{' '}
            {courseBuilder.sections.reduce((acc, section) => acc + section.subSections.length, 0)} lectures
          </p>
        </div>
      </div>

      {/* Publish Settings */}
      <div className="bg-richblack-700 border border-richblack-600 rounded-xl p-6">
        <h3 className="text-richblack-5 text-lg font-semibold mb-4">
          Publish Settings
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="Draft"
              checked={publishSettings.status === 'Draft'}
              onChange={(e) => setPublishSettings({ status: e.target.value })}
              className="w-4 h-4 text-caribbeangreen-700 focus:ring-caribbeangreen-300"
            />
            <span className="text-richblack-5">Save as Draft</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="Published"
              checked={publishSettings.status === 'Published'}
              onChange={(e) => setPublishSettings({ status: e.target.value })}
              className="w-4 h-4 text-caribbeangreen-700 focus:ring-caribbeangreen-300"
            />
            <span className="text-richblack-5">Publish Now</span>
          </label>
        </div>
        <p className="text-richblack-400 text-sm mt-2">
          {publishSettings.status === 'Draft'
            ? 'Course will be saved but not visible to students'
            : 'Course will be immediately available to students'}
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-richblack-700">
        <button
          type="button"
          onClick={handleBack}
          disabled={loading}
          className="flex items-center gap-2 bg-richblack-700 text-richblack-5 px-6 py-3 rounded-lg font-semibold hover:bg-richblack-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiChevronLeft size={20} />
          Back
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={loading}
          className="flex items-center gap-2 bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-richblack-900"></div>
              Publishing...
            </>
          ) : (
            <>
              <FiUpload size={20} />
              {publishSettings.status === 'Draft' ? 'Save as Draft' : 'Publish Course'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PublishCourse;
