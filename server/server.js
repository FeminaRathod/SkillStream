const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const path = require('path');
const app = express();
const dbConnect = require('./config/database');
const userRoute = require('./routes/User')
const contactRoute = require('./routes/Contact')
const paymentRoute = require('./routes/Payment')
const courseRoute = require('./routes/Course')
const profileRoute = require('./routes/Profile')
const ratingRoute = require('./routes/Rating');
const { cloudinaryConnect } = require('./config/couldinary');
const fileUpload = require('express-fileupload');
const cors = require('cors');

app.use(express.json());
app.use(require('cookie-parser')());

app.use(
    cors({
        origin: [
            "http://localhost:5175",
            "http://localhost:5173",
            "https://skill-stream-37gd-2rvc37gw6-feminaarathod-3418s-projects.vercel.app"
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
)
dbConnect();
cloudinaryConnect();

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));
app.use('/api/v1/user', userRoute);
app.use('/api/v1/contact', contactRoute);
app.use('/api/v1/payment', paymentRoute);
app.use('/api/v1/course', courseRoute);
app.use('/api/v1/profile', profileRoute);
app.use('/api/v1/rating', ratingRoute);


// Serve static files from the client/dist directory
app.use(express.static(path.resolve(__dirname, '..', 'client', 'dist')));

// Fallback route for SPA - serves index.html for any unknown requests
// Using app.use() instead of app.get('*') to avoid Express 5 path-to-regexp parsing issues
app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
});

const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`app listening to port number ${port}`);
})

 
