var currentQuestion = 1;
var totalQuestions = 1;
var savedPresets = loadPresetsFromLocalStorage();
var currentPresetIndex = -1;
function updateProgressBar() {
  var progress = (currentQuestion - 1) / totalQuestions * 100;
  var progressBar = document.getElementById('progressBar');
  progressBar.style.width = `${progress}%`;
}
document.getElementById('questionRangeForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const startQuestion = parseInt(document.getElementById('startQuestion').value);
  const endQuestion = parseInt(document.getElementById('endQuestion').value);
  
  if (startQuestion <= 0 || endQuestion < startQuestion) {
    alert('Please enter a valid range.');
    return;
  }

  startQuiz(startQuestion, endQuestion);
});
function startQuiz(start, end) {
  totalQuestions = end - start
  currentQuestion = start-1; // Reset current question index
  var questionContainer = document.getElementById("questionContainer");
  questionContainer.innerHTML = "";

  for (var i = start-1; i <= totalQuestions; i++) {
    questionContainer.innerHTML += `
      <div class="card" id="question${i}" style="display: ${i === 1 ? 'block' : 'none'};">
        <h3>Question ${i}</h3>
        <div class="options-container">
          <button type="button" class="option" onclick="chooseOption('أ', ${i})" data-option="أ">أ</button>
          <button type="button" class="option" onclick="chooseOption('ب', ${i})" data-option="ب">ب</button>
          <button type="button" class="option" onclick="chooseOption('ج', ${i})" data-option="ج">ج</button>
          <button type="button" class="option" onclick="chooseOption('د', ${i})" data-option="د">د</button>
        </div>
        <input type="hidden" id="q${i}" name="q${i}" value="">
      </div>
    `;
  }

  currentPresetIndex = -1;
  updateProgressBar();
  updateJumpToOptions();
  updateNavigationButtons();
}
function generateQuestions() {
  totalQuestions = parseInt(document.getElementById("numQuestions").value);
  currentQuestion = 1; // Reset current question index
  var questionContainer = document.getElementById("questionContainer");
  questionContainer.innerHTML = "";

  for (var i = 1; i <= totalQuestions; i++) {
    questionContainer.innerHTML += `
      <div class="card" id="question${i}" style="display: ${i === 1 ? 'block' : 'none'};">
        <h3>Question ${i}</h3>
        <div class="options-container">
          <button type="button" class="option" onclick="chooseOption('أ', ${i})" data-option="أ">أ</button>
          <button type="button" class="option" onclick="chooseOption('ب', ${i})" data-option="ب">ب</button>
          <button type="button" class="option" onclick="chooseOption('ج', ${i})" data-option="ج">ج</button>
          <button type="button" class="option" onclick="chooseOption('د', ${i})" data-option="د">د</button>
        </div>
        <input type="hidden" id="q${i}" name="q${i}" value="">
      </div>
    `;
  }

  currentPresetIndex = -1;
  updateProgressBar();
  updateJumpToOptions();
  updateNavigationButtons();
}

function chooseOption(option, questionNumber) {
  var questionName = `q${questionNumber}`;
  var buttons = document.querySelectorAll(`#question${questionNumber} .option`);
  buttons.forEach(function(button) {
    button.classList.remove('selected');
  });
  var selectedButton = document.querySelector(`#question${questionNumber} .option[data-option="${option}"]`);
  selectedButton.classList.add('selected');
  document.getElementById(questionName).value = option;
}

function prevQuestion() {
  document.getElementById(`question${currentQuestion}`).style.display = 'none';
  currentQuestion--;
  document.getElementById(`question${currentQuestion}`).style.display = 'block';
  updateNavigationButtons();
  updateProgressBar();
}

function nextQuestion() {
  document.getElementById(`question${currentQuestion}`).style.display = 'none';
  currentQuestion++;
  if (currentQuestion > totalQuestions) {
    showSummary();
    return;
  }
  document.getElementById(`question${currentQuestion}`).style.display = 'block';
  updateNavigationButtons();
  updateProgressBar();
  if(currentPresetIndex !== -1) {
    showNotifcation("Autosave!", false)
    updatePreset(currentPresetIndex)
  }
}

function updateNavigationButtons() {
  var prevButton = document.getElementById("prevButton");
  var nextButton = document.getElementById("nextButton");

  if (currentQuestion === 1) {
    prevButton.disabled = true;
  } else {
    prevButton.disabled = false;
  }

  if (currentQuestion === totalQuestions) {
    nextButton.textContent = "Finish";
  } else {
    nextButton.textContent = "Next";
  }
}

function savePreset() {
  var presetName = prompt("Enter a name for this preset:");
  if (!presetName) return;

  var preset = {
    name: presetName,
    numQuestions: totalQuestions,
    answeredQuestions: 0,
    answers: []
  };

  for (var i = 1; i <= totalQuestions; i++) {
    var questionName = `q${i}`;
    var answer = document.getElementById(questionName).value;
    if (answer) {
      preset.answers.push({ question: i, answer: answer });
      preset.answeredQuestions++;
    }
  }

  // Check if a preset with the same name already exists
  var existingIndex = savedPresets.findIndex(p => p.name === presetName);
  if (existingIndex !== -1) {
    savedPresets.splice(existingIndex, 1, preset); // Replace existing preset
  } else {
    savedPresets.push(preset); // Add new preset
  }

  savePresetsToLocalStorage();
  displayPresets();
  showNotification("Preset saved successfully!", false);
}

function displayPresets() {
  var presetContainer = document.getElementById("presetContainer");
  presetContainer.innerHTML = "";
  savedPresets.forEach((preset, index) => {
    var answeredQuestions = preset.answeredQuestions;
    presetContainer.innerHTML += `
      <div class="summary-card">
        <div class="summary-item">
          <span>Preset ${preset.name}</span>
          <span>${answeredQuestions} answered questions</span>
          <button onclick="deletePreset(${index})">Delete</button>
          <button onclick="loadPreset(${index})">Load</button>
          <button onclick="updatePreset(${index})">Update</button>
        </div>
      </div>
    `;
  });
}
function updatePreset(index) {
  var preset = savedPresets[index];

  for (var i = 1; i <= totalQuestions; i++) {
    var questionName = `q${i}`;
    var answer = document.getElementById(questionName).value;
    var existingAnswerIndex = preset.answers.findIndex(ans => ans.question === i);

    if (existingAnswerIndex !== -1) {
      preset.answers[existingAnswerIndex].answer = answer;
    } else {
      preset.answers.push({ question: i, answer: answer });
    }
  }

  savePresetsToLocalStorage();
  showNotification("Preset updated successfully!", false);
}

function deletePreset(index) {
  savedPresets.splice(index, 1);
  savePresetsToLocalStorage();
  displayPresets();
  showNotification("Preset deleted successfully!", false);
}

function loadPreset(index) {
  var preset = savedPresets[index];
  currentPreset = index;
  totalQuestions = preset.numQuestions;
  generateQuestions();
  var questionContainer = document.getElementById("questionContainer");
  questionContainer.querySelectorAll('.option').forEach(option => {
    option.classList.remove('selected');
  });
  preset.answers.forEach(answer => {
    var { question, answer: option } = answer;
    chooseOption(option, question);
  });
  showNotification("Loaded " + preset.name + " preset", false)
  updateJumpToOptions();
}

function showSummary() {
  var summaryContainer = document.createElement('div');
  summaryContainer.classList.add('summary-card');

  for (var i = 1; i <= totalQuestions; i++) {
    var questionName = `q${i}`;
    var answer = document.getElementById(questionName).value;

    var summaryItem = document.createElement('div');
    summaryItem.classList.add('summary-item');
    summaryItem.innerHTML = `
      <span>Question ${i}</span>
      <span id="answer${i}">${answer}</span>
      <span>
        <button class="answer-button correct" onclick="markAnswer(${i}, true)">Correct</button>
        <button class="answer-button wrong" onclick="markAnswer(${i}, false)">Wrong</button>
      </span>
    `;
    summaryContainer.appendChild(summaryItem);
  }

  var questionContainer = document.getElementById("questionContainer");
  questionContainer.innerHTML = '';
  questionContainer.appendChild(summaryContainer);
  updateProgressBar();
}

function markAnswer(questionNumber, isCorrect) {
  var answerElement = document.getElementById(`answer${questionNumber}`);
  if (isCorrect) {
    answerElement.classList.remove('wrong-answer');
    answerElement.classList.add('correct-answer');
  } else {
    answerElement.classList.remove('correct-answer');
    answerElement.classList.add('wrong-answer');
  }
}
// Function to update options in the "Jump to Question" dropdown
function updateJumpToOptions() {
  var jumpToSelect = document.getElementById('jumpToQuestion');
  jumpToSelect.innerHTML = '';
  
  for (var i = 1; i <= totalQuestions; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.textContent = `Question ${i}`;
    jumpToSelect.appendChild(option);
  }
}

// Function to jump to the selected question in the dropdown
function jumpToSelectedQuestion() {
  var jumpToSelect = document.getElementById('jumpToQuestion');
  var selectedQuestion = parseInt(jumpToSelect.value);

  if (selectedQuestion >= 1 && selectedQuestion <= totalQuestions) {
    showQuestion(selectedQuestion);
  }
}

// Function to display a specific question
function showQuestion(questionNumber) {
  var questionContainer = document.getElementById('questionContainer').children;
  for (var i = 0; i < questionContainer.length; i++) {
    questionContainer[i].style.display = 'none';
  }
  document.getElementById(`question${questionNumber}`).style.display = 'block';
  currentQuestion = questionNumber;
  updateProgressBar();
}

function showNotification(message, isError) {
  var notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = 'block';
  notification.style.backgroundColor = isError ? '#dc3545' : '#28a745';

  setTimeout(function() {
    notification.style.display = 'none';
  }, 3000);
}

function savePresetsToLocalStorage() {
  localStorage.setItem('savedPresets', JSON.stringify(savedPresets));
}

function loadPresetsFromLocalStorage() {
  var presets = localStorage.getItem('savedPresets');
  return presets ? JSON.parse(presets) : [];
}
displayPresets()
