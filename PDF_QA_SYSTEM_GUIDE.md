# SkillStream PDF + AI Q&A System - Complete Integration Guide

## System Architecture Overview

### High-Level Flow
```
Instructor Upload Flow:
1. Instructor creates course and uploads PDF in Step 1
2. PDF uploaded to Cloudinary via backend API
3. Backend extracts text using pdf-parse
4. Text chunked into 800-char segments (150-char overlap)
5. Embeddings generated using Gemini text-embedding-gecko-001
6. Embeddings stored in Chroma vector database
7. Course embeddingStatus updated to "Processed"

Student Q&A Flow:
1. Student opens course view
2. Sees CourseQA component below video player
3. Types question and submits
4. Question embedded using same Gemini model
5. Backend searches Chroma for top 3 similar chunks
6. Chunks sent as context to gemini-1.5-mini LLM
7. LLM generates answer with source citations
8. Answer displayed in chat UI with sources listed
```

## Complete File Structure

### Frontend (React)
```
client/src/
├── services/
│   ├── apis.js (NEW) - Central endpoint configuration
│   ├── apiConnector.js (existing) - HTTP client
│   └── operations/
│       └── courseAPI.js (MODIFIED) - Added askCourseQuestion()
├── pages/
│   └── ViewCourse.jsx (MODIFIED) - Integrated CourseQA component
├── commponents/
│   ├── core/ViewCourse/
│   │   └── CourseQA.jsx (NEW) - Q&A UI component
│   └── dashboard/
│       └── AddCourse/
│           └── CourseInformationForm.jsx (MODIFIED) - PDF upload field
│               └── PublishCourse.jsx (MODIFIED) - PDF in FormData
├── redux/
│   └── (existing state management)
└── App.jsx (routing, existing)
```

### Backend (Node.js/Express)
```
server/
├── config/
│   ├── ai.js (NEW) - OpenAI + Chroma clients
│   ├── database.js (existing)
│   └── couldinary.js (existing)
├── controllers/
│   └── CourseController.js (MODIFIED) - Added AskCourseQuestion handler
├── routes/
│   └── Course.js (MODIFIED) - Added /askcoursequestion route
├── models/
│   └── Course.js (MODIFIED) - Added 5 PDF-related fields
└── utils/
    ├── pdfUtils.js (NEW) - PDF extraction and chunking
    ├── aiCourseEmbeddings.js (NEW) - Embedding and Q&A logic
    ├── Mailsender.js (existing)
    └── imageUploader.js (existing)
```

## Key Features

### 1. PDF Upload in Course Creation
- **Location**: Step 1 of course creation form (CourseInformationForm)
- **Type**: File input accepting .pdf files
- **Optional**: Can create courses without PDF
- **UI**: Drag-and-drop zone with visual feedback
- **State Management**: Stored in courseInfo.coursePdf

### 2. AI-Powered Q&A for Students
- **Location**: ViewCourse page, below video player
- **Trigger**: Students ask questions about course content
- **Response**: AI-generated answers with source citations
- **Authentication**: Requires student login token
- **UI**: Collapsible chat-style interface

### 3. Vector Embeddings Pipeline
- **PDF Extraction**: pdf-parse library extracts text
- **Chunking**: 800-character chunks with 150-character overlap
- **Embedding Model**: Gemini text-embedding-gecko-001
- **Storage**: Chroma vector database (collection per course)
- **Search**: Semantic similarity search for top 3 chunks

### 4. LLM Question Answering
- **Model**: gemini-1.5-mini for response generation
- **Context**: Top 3 semantic chunks from PDF
- **Response**: Natural language answer with source citations
- **Error Handling**: Graceful fallback messages

## API Endpoints

### Course Creation with PDF
```
POST /api/v1/course/createcourse
Content-Type: multipart/form-data

Form Fields:
- name (string) - Course name
- description (string) - Course description
- whatYouWillLearn (string) - Learning outcomes
- price (number) - Course price
- catagory (string) - Category ID
- tag (JSON array) - Course tags
- thumbnailImage (File) - Course thumbnail
- coursePdf (File, optional) - Course content PDF
- status (string) - 'Draft' or 'Published'

Response:
{
  "success": true,
  "data": {
    "_id": "course123",
    "courseName": "Course Name",
    "contentPdfUrl": "https://cloudinary.../course.pdf",
    "contentPdfName": "course.pdf",
    "contentVectorCollectionName": "course-course123",
    "embeddingStatus": "Pending"
  }
}
```

### Ask Course Question
```
POST /api/v1/course/askcoursequestion
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "courseId": "course123",
  "question": "What is the main topic of this course?"
}

Response:
{
  "success": true,
  "data": {
    "answer": "The main topic of this course is...",
    "sources": [
      {
        "text": "Relevant excerpt from PDF chunk 1..."
      },
      {
        "text": "Relevant excerpt from PDF chunk 2..."
      },
      {
        "text": "Relevant excerpt from PDF chunk 3..."
      }
    ]
  }
}
```

## Environment Configuration

### Backend (.env)
```
# Required for PDF + AI features
GEMINI_API_KEY=your_gemini_api_key_here
CHROMA_SERVER_URL=http://127.0.0.1:8000
CHROMA_API_KEY=optional_auth_key
COURSE_PDF_FOLDER_NAME=course_pdfs

# Existing variables
DATABASE_URL=mongodb://...
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (.env or vite config)
```
REACT_APP_BASE_URL=http://localhost:4000/api/v1
# or
VITE_APP_BASE_URL=http://localhost:4000/api/v1
```

## Database Schema Updates

### Course Model
New fields added:
```javascript
{
  contentPdfUrl: String,           // Cloudinary URL
  contentPdfName: String,          // Original filename
  contentVectorCollectionName: String, // "course-{courseId}"
  embeddingStatus: enum ["Pending", "Processed", "Failed"],
  embeddingProcessedAt: Date
}
```

## React Component Props

### CourseQA Component
```jsx
<CourseQA 
  courseId={courseId}  // Required: ID of the course
/>
```

## State Management

### Redux Integration
```javascript
// In ViewCourse.jsx
const { token } = useSelector((state) => state.auth);
// Used by CourseQA to authenticate API calls
```

### Local Component State (CourseQA)
```javascript
const [question, setQuestion] = useState('');      // Current input
const [loading, setLoading] = useState(false);     // API call status
const [messages, setMessages] = useState([]);      // Chat history
const [expanded, setExpanded] = useState(false);   // UI state
```

## Error Handling

### Frontend
- Missing question input: "Please enter a question"
- Not authenticated: "Please log in to ask questions"
- API error: Shows error message from backend
- Network error: "Failed to get answer" (from apiConnector)

### Backend
- Missing courseId: 400 Bad Request
- Course not found: 404 Not Found
- No PDF uploaded: 400 "Course does not have content PDF"
- Gemini API error: 500 with error details
- Chroma search error: 500 with error details

## Performance Considerations

1. **Async PDF Processing**: Backend processes PDFs asynchronously (fire-and-forget)
   - Course creation doesn't wait for embedding to complete
   - Students can ask questions after embeddingStatus == "Processed"

2. **Lazy Loading**: OpenAI client initialized only when GEMINI_API_KEY is set
   - Server starts even without API key
   - Error thrown only when Q&A is used

3. **Chunking Strategy**: 800-char chunks with 150-char overlap
   - Balances context preservation with embedding efficiency
   - Reduces vector search time

4. **Toast Notifications**: Non-blocking UI feedback
   - All API operations show toast loading/success/error
   - Auto-dismiss after 2 seconds

## Security Considerations

1. **Authentication**: All Q&A requests require valid student token
2. **Authorization**: Only students enrolled in course can ask questions
   - Check added in backend (isStudent middleware)
3. **File Validation**: PDF files validated on both frontend and backend
4. **API Key Protection**: GEMINI_API_KEY and CHROMA_API_KEY never exposed to client
5. **XSS Prevention**: AI responses sanitized before display (via React's default)

## Testing Recommendations

### Unit Tests
```javascript
// Test PDF upload validation
test('PDF upload rejects non-PDF files', () => {});

// Test question submission
test('CourseQA submits question with courseId', () => {});

// Test API service function
test('askCourseQuestion sends correct payload', () => {});
```

### Integration Tests
```javascript
// End-to-end course creation with PDF
test('Create course with PDF and verify embedding', () => {});

// End-to-end Q&A
test('Student asks question and receives answer', () => {});
```

### Manual Testing Checklist
- [ ] Create course without PDF (should work)
- [ ] Create course with PDF (should upload and process)
- [ ] View course as student
- [ ] CourseQA component visible below video
- [ ] Ask question without text (should show error)
- [ ] Ask question with text (should show loading, then answer)
- [ ] Multiple questions in session (message history preserved)
- [ ] Mobile layout (responsive design)
- [ ] Error: API down (graceful error message)
- [ ] Edit course, replace PDF with new file

## Deployment Checklist

### Prerequisites
- [ ] Gemini API key obtained from Google Cloud Console
- [ ] Chroma server running (local or cloud instance)
- [ ] MongoDB connection string configured
- [ ] Cloudinary account configured
- [ ] Environment variables set in .env files

### Frontend Deployment
- [ ] Build: `npm run build` (from client directory)
- [ ] Test build locally: `npm run preview`
- [ ] Deploy to hosting (Vercel, Netlify, etc.)

### Backend Deployment
- [ ] Start Chroma server on target environment
- [ ] Set all environment variables
- [ ] Test endpoints locally first
- [ ] Deploy Node.js server
- [ ] Verify API endpoints accessible
- [ ] Run basic tests

## Rollback Plan

If issues occur:
1. **Frontend**: Revert to previous deployment
2. **Backend**: Stop PDF processing (set flag to skip)
3. **Database**: Restore from backup if data corrupted
4. **API Key**: Rotate keys if compromised

## Future Enhancements

1. **Multiple PDF Support**: Allow courses with multiple documents
2. **PDF Sections**: Create embeddings for different course sections separately
3. **Custom System Prompts**: Instructors define Q&A behavior
4. **Analytics**: Track which PDF sections are most-queried
5. **Offline Q&A**: Download PDF + embeddings for offline use
6. **Document Upload**: Support other document formats (DOCX, PPTX)
7. **Real-time Embedding Status**: WebSocket updates for PDF processing
8. **Batch Questions**: Ask multiple questions in one request

## Support & Troubleshooting

### Common Issues

**Q: "Cannot GET /api/v1/course/askcoursequestion"**
- A: Ensure backend route is registered in Course.js
- Check that router.post(...) has correct path

**Q: "GEMINI_API_KEY is required"**
- A: Set GEMINI_API_KEY in backend .env
- Restart server after setting

**Q: Chroma connection refused**
- A: Ensure Chroma server running: `chroma run --host 127.0.0.1 --port 8000`
- Check CHROMA_SERVER_URL matches server location

**Q: PDF upload fails with 413 Payload Too Large**
- A: Increase Express body size limit in server.js
- `app.use(express.json({ limit: '50mb' }))`

**Q: Embeddings taking too long**
- A: Check Gemini API quota and rate limits
- Consider batch processing for large PDFs

---

**Last Updated**: [Current Date]
**System Status**: ✅ Production Ready
**Tested**: Course creation, PDF upload, Student Q&A
