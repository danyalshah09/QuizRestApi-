const fs = require('fs');
const http = require('http');

// Path to the quiz file
const QUIZ_FILE_PATH = 'input_file.txt';

// Response codes for the API
const RESPONSE_CODES = {
  SUCCESS: 0,
  FILE_NOT_FOUND: 1,
  NOT_ENOUGH_QUESTIONS: 2,
};

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Parse the request URL to get the number of questions to return
  const urlParams = new URLSearchParams(req.url.substring(1));
  const numQuestions = parseInt(urlParams.get('questions'));

  // Read the quiz file
  fs.readFile(QUIZ_FILE_PATH, 'utf-8', (err, data) => {

    // If the file doesn't exist, return an error response
    if (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        code: RESPONSE_CODES.FILE_NOT_FOUND,
        message: 'Quiz file not found',
      }));
      return;
    }

    // Split the file contents into an array of questions
    const quizData = data.trim().split('\n\n');

    // If there are not enough questions, return an error response
    if (quizData.length < numQuestions) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        code: RESPONSE_CODES.NOT_ENOUGH_QUESTIONS,
        message: 'Not enough questions found in the quiz file',
      }));
      return;
    }

    // Select the specified number of random questions
    const selectedQuestions = [];
    while (selectedQuestions.length < numQuestions) {
      const randomIndex = Math.floor(Math.random() * quizData.length);
      const questionData = quizData[randomIndex].split('\n');
      const question = questionData[0].trim();
      const options = questionData.slice(1).map(option => option.trim());

      selectedQuestions.push({
        question: question,
        correct_answer: options[0],
        incorrect_answers: options.slice(1),
      });
    }

    // Send the selected questions as a JSON response
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      response_code: RESPONSE_CODES.SUCCESS,
      results: selectedQuestions,
    }));
  });
});

// Start the HTTP server
server.listen(3000, () => {
  console.log('Server started on port 3000');
});
