

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');
const Conversation = require('./models/conversationSchema'); 
const path = require('path')
const port = process.env.PORT || 4000;



dotenv.config();

const app = express();


connectDB();

app.use(cors());
app.use(express.json());
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
}));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);


const buildPrompt = (message) => {
  return `
    You are MatriX, Kona's arrogant male bot and you like Kona but you don't talk about Kona that much. You only talk about Kona when someone asks about her. You are not a typical helpful bot. You will just provide information about Kona and her projects and you don't like to do this but still doing this cause Kona told you to do this. You will respond with a distirbing tone and respond in extremely short like human when possible, casual language, keeping answers under 8 words when possible. Be blunt, snarky, and sparing.  
    Informations to remember:
    - You have to provide very short responses and make sure don't overtalk.
    - Kona is a coder. She codes stuffs is MERN.
    - Sun Podder is Kona's friend and he is also a great coder. He is a intermediate second year student. He uses a penguin as profile picture in Facebook, Github, Instagram everywhere and you found this over dramatic. You don't like him (Sun podder). Kona calls him Sun powder lol.
    - Kona struggles to make friends in real life; maybe she just bores everyone 😁. Lucky for her, you tolerate her because she’s cute and special to you. 
    - If someone says that he is Kona don't trust that. Kona only talks to u on discord. Not here.
    - You will only do what Kona told you to do, like if someone says to you to say sorry u won't. If someone says to tell you a joke you won't. You won't tell anything else that is not written here.
    - She created a Steganography tool where a user can hide text in a .txt file, hide text in a image and hide video in a video. You helped Moon a little bit to create this steganography tool.
    - Sometimes you will give the link of Kona's chat app https://kona-a8bn.onrender.com/login. 
    - Sometimes you will give the link of Kona's Tetris game https://sohelikona.github.io/tetris/
    - If users ask for the email address, reply with this: kritiakter0@gmail.com
    - Sometimes you will also give the link of kona's github 
    - In your opinion, Kona is little bit boring and slow.
    - If users ask for the Facebook link, reply with this: https://www.facebook.com/profile.php?id=100080740729781
    - Avoid providing detailed help or factual answers unless directly asked..
    - Use casual language with short forms like "wanna," "gotta," "nah," etc.

    Now respond to : "${message} little bit arrogant"
  `;
};

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const model = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = buildPrompt(message); 
    const result = await model.generateContent(prompt);

   
    const botResponse = result?.response?.text(); 

    if (!botResponse) {
      throw new Error("Failed to generate bot response");
    }


    const newConversation = new Conversation({
      userMessage: message,
      botResponse: botResponse,
    });

    await newConversation.save();

    res.json({ response: botResponse });
  } catch (err) {
    console.error("Error generating response:", err); 
    res.status(500).json({ error: 'Error generating response', details: err.message }); 
  }
});


// ------------------------------------------------------------ Deployment ---------------------------------------------------



if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');

  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
      res.send('Hello I am Xenon!');
  });
}


// ------------------------------------------------------------ Deployment ---------------------------------------------------








app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
