# AI Meeting Summarizer & Task Manager

A full-stack MERN application that uses AI to summarize meeting transcripts and extract actionable tasks.

## 🚀 Features

- **AI-Powered Summarization**: Automatically generates meeting summaries using Hugging Face AI
- **Task Extraction**: Extracts actionable tasks from meeting transcripts
- **Task Management**: Full CRUD operations for tasks with priority, deadlines, and assignments
- **Dashboard**: Organized view of overdue, today's, and upcoming tasks
- **Calendar View**: Visual calendar showing tasks on their due dates
- **Search**: Find tasks by keyword, assignee, or tags
- **Notifications**: Browser notifications for due tasks
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons
- Date-fns for date handling
- React DatePicker for date selection

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- Gemini Inference API for AI processing
- CORS enabled for cross-origin requests

### AI Integration
- Gemini model for text summarization
- Custom task extraction logic with AI fallback

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Gemini API key (free tier available)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/ai-meeting-summarizer
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 🔑 Getting a Hugging Face API Key

1. Go to Google AI Studio
2. Create an account or sign in
3. Navigate to API Keys from the left menu
4. Click Create API Key and select a project (or create a new one)
5. Copy the token and add it to your `.env` file

## 📱 Usage

1. **Create a New Meeting Summary**:
   - Navigate to "New Meeting"
   - Paste your meeting transcript
   - Click "Generate Summary"
   - AI will create a summary and extract tasks

2. **Manage Tasks**:
   - View tasks on the Dashboard
   - Edit task details, deadlines, and priorities
   - Mark tasks as complete
   - Search for specific tasks

3. **Calendar View**:
   - Switch to Calendar tab
   - See tasks organized by due dates
   - Click on tasks to edit them

4. **Notifications**:
   - Allow browser notifications when prompted
   - Get notified when tasks are due today

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Set environment variables if needed

### Backend (Render/Heroku)
1. Connect your GitHub repository
2. Set environment variables:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `PORT`
3. Deploy

### Database (MongoDB Atlas)
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your environment variables

## 📁 Project Structure

```
project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── app.js            # Express app setup
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Summarize
- `POST /api/summarize` - Generate meeting summary and extract tasks

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/dashboard` - Get tasks grouped by status
- `GET /api/tasks/calendar` - Get tasks for calendar view
- `GET /api/tasks/search` - Search tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🎨 Customization

- Modify colors in `tailwind.config.js`
- Add new task fields in the Task model
- Customize AI prompts in the summarize route
- Add new notification types in the notifications utility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your environment variables
3. Ensure MongoDB is running
4. Check your Gemini Face API key

## 🔮 Future Enhancements

- [ ] PDF export for meeting summaries
- [ ] Team collaboration features
- [ ] Integration with calendar apps
- [ ] Voice-to-text transcription
- [ ] Advanced AI models
- [ ] Task templates
- [ ] Analytics dashboard
