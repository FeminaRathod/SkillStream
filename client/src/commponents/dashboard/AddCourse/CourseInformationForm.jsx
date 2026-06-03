import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import { apiConnector } from '../../../../services/apiConnector';
import { catagories } from '../../../../services/apis';
import { FiChevronRight } from 'react-icons/fi';
import ChipInput from '../../common/ChipInput';
import RequirementsField from './RequirementsField';

const CourseInformationForm = ({ courseInfo, setCourseInfo, setCurrentStep, saveDraft, editCourse }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { setValue, getValues } = useForm({
    defaultValues: {
      tags: courseInfo.tags || [],
      whatYouWillLearn: courseInfo.whatYouWillLearn || ''
    }
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiConnector('GET', catagories.CATAGORIES_API);
        if (response.data.success) {
          setCategories(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };



  const handleSetValue = React.useCallback(
    (name, value) => {
      setValue(name, value);
      setCourseInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [setValue, setCourseInfo]
  );

  const handlePdfChange = (file) => {
    setCourseInfo((prev) => ({
      ...prev,
      coursePdf: file,
    }));
    if (errors.coursePdf) {
      setErrors((prev) => ({ ...prev, coursePdf: '' }));
    }
  };

  const handleThumbnailChange = (file) => {
    setCourseInfo((prev) => ({
      ...prev,
      thumbnail: file,
    }));
    if (errors.thumbnail) {
      setErrors((prev) => ({ ...prev, thumbnail: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!courseInfo.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }

    if (!courseInfo.courseDescription.trim()) {
      newErrors.courseDescription = 'Course description is required';
    }

    if (!courseInfo.whatYouWillLearn.trim()) {
      newErrors.whatYouWillLearn = 'Learning outcomes are required';
    }

    if (!courseInfo.price || courseInfo.price <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!courseInfo.category) {
      newErrors.category = 'Please select a category';
    }

    if (courseInfo.tags.length === 0) {
      newErrors.tags = 'Please add at least one tag';
    }

    if (!courseInfo.thumbnail) {
      newErrors.thumbnail = 'Course thumbnail is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      saveDraft();
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please fill all required fields');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-richblack-5 text-2xl font-semibold mb-6">
        Course Information
      </h2>

      {/* Course Name */}
      <div>
        <label htmlFor="courseName" className="block text-richblack-5 text-sm font-medium mb-2">
          Course Title <span className="text-pink-200">*</span>
        </label>
        <input
          type="text"
          id="courseName"
          name="courseName"
          value={courseInfo.courseName}
          onChange={handleInputChange}
          placeholder="Enter course title"
          className={`w-full bg-richblack-700 text-richblack-5 border ${
            errors.courseName ? 'border-pink-200' : 'border-richblack-600'
          } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-caribbeangreen-300 transition-all`}
        />
        {errors.courseName && (
          <p className="text-pink-200 text-sm mt-1">{errors.courseName}</p>
        )}
      </div>

      {/* Course Description */}
      <div>
        <label htmlFor="courseDescription" className="block text-richblack-5 text-sm font-medium mb-2">
          Course Description <span className="text-pink-200">*</span>
        </label>
        <textarea
          id="courseDescription"
          name="courseDescription"
          value={courseInfo.courseDescription}
          onChange={handleInputChange}
          placeholder="Enter course description"
          rows={5}
          className={`w-full bg-richblack-700 text-richblack-5 border ${
            errors.courseDescription ? 'border-pink-200' : 'border-richblack-600'
          } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-caribbeangreen-300 transition-all resize-none`}
        />
        {errors.courseDescription && (
          <p className="text-pink-200 text-sm mt-1">{errors.courseDescription}</p>
        )}
      </div>

      {/* What You Will Learn */}
      <RequirementsField
        label="What You Will Learn"
        name="whatYouWillLearn"
        placeholder="Enter a learning outcome"
        errors={errors}
        setValue={handleSetValue}
        getValues={getValues}
      />

      {/* Price and Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-richblack-5 text-sm font-medium mb-2">
            Price (₹) <span className="text-pink-200">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={courseInfo.price}
            onChange={handleInputChange}
            placeholder="Enter price"
            min="0"
            className={`w-full bg-richblack-700 text-richblack-5 border ${
              errors.price ? 'border-pink-200' : 'border-richblack-600'
            } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-caribbeangreen-300 transition-all`}
          />
          {errors.price && (
            <p className="text-pink-200 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-richblack-5 text-sm font-medium mb-2">
            Category <span className="text-pink-200">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={courseInfo.category}
            onChange={handleInputChange}
            className={`w-full bg-richblack-700 text-richblack-5 border ${
              errors.category ? 'border-pink-200' : 'border-richblack-600'
            } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-caribbeangreen-300 transition-all`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-pink-200 text-sm mt-1">{errors.category}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <ChipInput
        label="Tags"
        name="tags"
        placeholder="Enter a tag and press Enter"
        register={() => {}}
        errors={errors}
        setValue={handleSetValue}
        getValues={getValues}
      />

      {/* PDF Upload (Optional) */}
      <div>
        <label className="block text-richblack-5 text-sm font-medium mb-2">
          Course Content PDF <span className="text-caribbeangreen-300">(Optional)</span>
        </label>
        <div className="border-2 border-dashed border-richblack-600 rounded-lg p-8 text-center hover:border-caribbeangreen-300 transition-colors cursor-pointer bg-richblack-700/20"
          onClick={() => document.getElementById('pdf-input').click()}
        >
          <input
            type="file"
            id="pdf-input"
            accept=".pdf"
            onChange={(e) => handlePdfChange(e.target.files?.[0] || null)}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-richblack-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-richblack-5 font-medium">
              {courseInfo.coursePdf ? courseInfo.coursePdf.name : 'Upload PDF'}
            </p>
            <p className="text-richblack-400 text-sm">
              {courseInfo.coursePdf ? 'Click to change' : 'Click to upload or drag & drop'}
            </p>
          </div>
        </div>
        <p className="text-richblack-400 text-xs mt-2">PDF files will be used to create an AI knowledge base for student Q&A</p>
      </div>

      {/* Thumbnail Upload */}
      <div>
        <label htmlFor="thumbnail" className="block text-richblack-5 text-sm font-medium mb-2">
          Course Thumbnail <span className="text-pink-200">*</span>
        </label>
        <ImageUpload
          thumbnail={courseInfo.thumbnail}
          setThumbnail={handleThumbnailChange}
        />
        {errors.thumbnail && (
          <p className="text-pink-200 text-sm -mt-4">{errors.thumbnail}</p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end pt-6 border-t border-richblack-700">
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-100 transition-all duration-200 hover:scale-105"
        >
          {editCourse ? "Save Changes" : "Next"}
          <FiChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default CourseInformationForm;
