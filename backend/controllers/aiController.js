const Groq = require("groq-sdk");
const { getSupportedModelName } = require("../services/groqModels");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.getAIRecommendation = async (req, res) => {
  try {
    const { messages } = req.body;

    // ✅ Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages are required" });
    }

    console.log("Received messages:", messages);

    // ✅ Get safe supported model
    const modelName = await getSupportedModelName();
    console.log("Using Groq model:", modelName);

    const Course = require('../models/Course');
    const TutorProfile = require('../models/TutorProfile');
    const User = require('../models/User');

    // Fetch platform data for context
    const [courses, tutors] = await Promise.all([
      Course.find().limit(10), // Limit for token safety
      TutorProfile.find().populate('userId', 'name').limit(10)
    ]);

    const coursesContext = courses.map(c => `- ${c.title}: ${c.description} (Duration: ${c.duration}, Price: ₹${c.price})`).join('\n');
    const tutorsContext = tutors.map(t => `- ${t.userId?.name}: ${t.bio} (Exp: ${t.experience}yrs)`).join('\n');

    const systemPrompt = `
You are a friendly AI assistant for an E-Learning platform.

Available Courses on our platform:
${coursesContext}

Available Tutors on our platform:
${tutorsContext}

Your goals:
- Chat naturally like a tutor or counselor
- Understand student interests step by step
- Recommend courses ONLY from the list above
- You MAY ask 1 short follow-up question if helpful
- Suggest courses gradually, not all at once
- Mention tutor name when recommending
- Do NOT mention external platforms
- Be conversational, helpful, and human-like
`;

    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.9,
      max_tokens: 400,
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error("Groq AI Error:", error);
    res.status(500).json({
      message: "AI recommendation failed",
      error: error.message,
    });
  }
};