const express = require('express');
const axios = require('axios');
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const router = express.Router();

// Function to convert relative dates to actual Date objects
const convertRelativeDate = (deadline) => {
  if (!deadline || deadline === 'Not specified' || deadline === null) {
    return null;
  }

  const today = new Date();
  const deadlineStr = deadline.toLowerCase().trim();

  // Handle specific days of the week
  if (deadlineStr.includes('friday')) {
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
    friday.setHours(17, 0, 0, 0); // 5 PM
    return friday;
  }
  
  if (deadlineStr.includes('thursday')) {
    const daysUntilThursday = (4 - today.getDay() + 7) % 7;
    const thursday = new Date(today);
    thursday.setDate(today.getDate() + (daysUntilThursday === 0 ? 7 : daysUntilThursday));
    thursday.setHours(17, 0, 0, 0); // 5 PM
    return thursday;
  }
  
  if (deadlineStr.includes('tuesday')) {
    const daysUntilTuesday = (2 - today.getDay() + 7) % 7;
    const tuesday = new Date(today);
    tuesday.setDate(today.getDate() + (daysUntilTuesday === 0 ? 7 : daysUntilTuesday));
    tuesday.setHours(17, 0, 0, 0); // 5 PM
    return tuesday;
  }
  
  if (deadlineStr.includes('monday')) {
    const daysUntilMonday = (1 - today.getDay() + 7) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday));
    monday.setHours(17, 0, 0, 0); // 5 PM
    return monday;
  }
  
  if (deadlineStr.includes('wednesday')) {
    const daysUntilWednesday = (3 - today.getDay() + 7) % 7;
    const wednesday = new Date(today);
    wednesday.setDate(today.getDate() + (daysUntilWednesday === 0 ? 7 : daysUntilWednesday));
    wednesday.setHours(17, 0, 0, 0); // 5 PM
    return wednesday;
  }

  // Handle "next week"
  if (deadlineStr.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(17, 0, 0, 0); // 5 PM
    return nextWeek;
  }

  // Handle "tomorrow"
  if (deadlineStr.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0); // 5 PM
    return tomorrow;
  }

  // Handle "next tuesday", "next friday", etc.
  if (deadlineStr.includes('next')) {
    if (deadlineStr.includes('tuesday')) {
      const daysUntilTuesday = (2 - today.getDay() + 7) % 7;
      const nextTuesday = new Date(today);
      nextTuesday.setDate(today.getDate() + daysUntilTuesday + 7);
      nextTuesday.setHours(17, 0, 0, 0);
      return nextTuesday;
    }
    if (deadlineStr.includes('friday')) {
      const daysUntilFriday = (5 - today.getDay() + 7) % 7;
      const nextFriday = new Date(today);
      nextFriday.setDate(today.getDate() + daysUntilFriday + 7);
      nextFriday.setHours(17, 0, 0, 0);
      return nextFriday;
    }
  }

  // If we can't parse it, return null
  console.log('Could not parse deadline:', deadline);
  return null;
};

// Function to extract tasks from summary using AI
const extractTasksFromSummary = async (summary, transcript) => {
  // Check if Google Gemini API key is available
  if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
    console.log('No Google Gemini API key found, using fallback task extraction');
    return extractTasksWithRegex(summary);
  }

  try {
    // Using Google Gemini API for task extraction
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Extract actionable tasks from this meeting summary: ${summary.join(' ')}. Return only a JSON array of tasks with this exact format: [{"task": "task description", "assignee": "person name or Not specified", "deadline": "relative date like Friday, Thursday, Next Tuesday, or null if no deadline", "priority": "low/medium/high", "status": "pending"}]. Use relative dates like "Friday", "Thursday", "Next Tuesday", "Next week" for deadlines. Do not include any other text, just the JSON array.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
      const taskText = response.data.candidates[0].content.parts[0].text;
      
      try {
        // Clean up the response to extract JSON
        const jsonMatch = taskText.match(/\[.*\]/s);
        if (jsonMatch) {
          const tasks = JSON.parse(jsonMatch[0]);
          if (Array.isArray(tasks)) {
            // Convert relative dates to actual Date objects
            return tasks.map(task => ({
              ...task,
              deadline: convertRelativeDate(task.deadline)
            }));
          }
          return extractTasksWithRegex(summary);
        }
      } catch (parseError) {
        console.error('Failed to parse AI task extraction:', parseError);
        return extractTasksWithRegex(summary);
      }
    }
  } catch (error) {
    console.error('AI task extraction failed:', error.message);
    return extractTasksWithRegex(summary);
  }

  return extractTasksWithRegex(summary);
};

// Fallback regex-based task extraction
const extractTasksWithRegex = (summary) => {
  console.log('Using fallback task extraction for summary:', summary);
  const tasks = [];
  const taskKeywords = ['need to', 'should', 'must', 'have to', 'action item', 'todo', 'task', 'will', 'going to', 'plan to'];
  
  summary.forEach(point => {
    console.log('Checking point for tasks:', point);
    if (taskKeywords.some(keyword => point.toLowerCase().includes(keyword))) {
      console.log('Found task keyword in:', point);
      // Clean up the task description
      let taskDescription = point.trim();
      
      // Remove common prefixes
      taskDescription = taskDescription.replace(/^(we need to|i need to|you need to|they need to|we should|i should|you should|they should|we must|i must|you must|they must|we will|i will|you will|they will|we're going to|i'm going to|you're going to|they're going to|we plan to|i plan to|you plan to|they plan to)/i, '');
      
      // Capitalize first letter
      taskDescription = taskDescription.charAt(0).toUpperCase() + taskDescription.slice(1);
      
      tasks.push({
        task: taskDescription,
        assignee: 'Not specified',
        deadline: null,
        priority: 'medium',
        status: 'pending'
      });
    }
  });

  // If no tasks found, create a default one
  if (tasks.length === 0) {
    console.log('No tasks found, creating default task');
    tasks.push({
      task: 'Review meeting notes and create action items',
      assignee: 'Not specified',
      deadline: null,
      priority: 'medium',
      status: 'pending'
    });
  }

  console.log('Final extracted tasks:', tasks);
  return tasks;
};

// Function to generate summary using AI
const generateSummary = async (transcript) => {
  // Check if Google Gemini API key is available
  console.log('Checking Gemini API key:', process.env.GOOGLE_GEMINI_API_KEY ? 'Found' : 'Not found');
  if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
    console.log('No Google Gemini API key found, using fallback summarization');
    return fallbackSummarization(transcript);
  }

  try {
    // Using Google Gemini API for summarization
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Please summarize this meeting transcript in 3-5 key bullet points:\n\n${transcript}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
      const summaryText = response.data.candidates[0].content.parts[0].text;
      // Split summary into bullet points
      const points = summaryText.split('\n').filter(point => point.trim().length > 0);
      return points.map(point => point.trim().replace(/^[-•*]\s*/, '') + '.');
    }
  } catch (error) {
    console.error('AI summarization failed:', error.message);
  }

  // Fallback: Simple text summarization
  return fallbackSummarization(transcript);
};

// Fallback summarization
const fallbackSummarization = (transcript) => {
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Take the first few sentences and some key sentences
  const firstSentences = sentences.slice(0, 2);
  const middleSentences = sentences.slice(Math.floor(sentences.length / 2), Math.floor(sentences.length / 2) + 2);
  const lastSentences = sentences.slice(-2);
  
  // Combine and deduplicate
  const allSentences = [...firstSentences, ...middleSentences, ...lastSentences];
  const uniqueSentences = [...new Set(allSentences)];
  
  const summary = uniqueSentences.slice(0, Math.min(5, uniqueSentences.length));
  return summary.map(s => s.trim() + '.');
};

// POST /summarize
router.post('/', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Generate summary
    const summary = await generateSummary(transcript);

    // Extract tasks
    const tasks = await extractTasksFromSummary(summary, transcript);
    console.log('Extracted tasks:', tasks);

    let meetingId = null;
    let savedTasks = [];

    // Try to save to database, but don't fail if it doesn't work
    try {
      // Save meeting
      const meeting = new Meeting({
        transcript,
        summary
      });
      const savedMeeting = await meeting.save();
      meetingId = savedMeeting._id;

      // Save tasks
      savedTasks = await Promise.all(
        tasks.map(taskData => {
          const task = new Task({
            ...taskData,
            meetingId: meetingId
          });
          return task.save();
        })
      );
    } catch (dbError) {
      console.error('Database save failed, returning data without saving:', dbError.message);
      // If database save fails, just return the data without saving
      savedTasks = tasks.map(taskData => ({
        ...taskData,
        _id: `temp_${Date.now()}_${Math.random()}`,
        meetingId: `temp_meeting_${Date.now()}`
      }));
    }

    res.json({
      meetingId: meetingId || `temp_meeting_${Date.now()}`,
      summary,
      tasks: savedTasks
    });
  } catch (error) {
    console.error('Error in summarize route:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

module.exports = router;
