const mongoose = require('mongoose');
const Catagory = require('./Catagory');

const CourseSchema = new mongoose.Schema({
    courseName: {
        type: String,
    },
    courseDescription: {
        type: String,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    whatYouWillLearn: {
        type: String,
    },
    courseContent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    }],
    ratingAndReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReviews",
    }],
    catagory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catagory',
    },
    tag: {
        type: [String],
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    contentPdfUrl: {
        type: String,
    },
    contentPdfName: {
        type: String,
    },
    contentVectorCollectionName: {
        type: String,
    },
    embeddingStatus: {
        type: String,
        enum: ["Pending", "Processed", "Failed"],
        default: "Pending",
    },
    embeddingProcessedAt: {
        type: Date,
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Draft", "Published"]
    },
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true })

module.exports = mongoose.model('Course', CourseSchema);
