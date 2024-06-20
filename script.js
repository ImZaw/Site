var currentPresetIndex = -1;
var currentQuestion = 1;
var totalQuestions = 1;
var savedPresets = loadPresetsFromLocalStorage();
function updateProgressBar() {
  var progress = (currentQuestion - 1) / totalQuestions * 100;
  var progressBar = document.getElementById('progressBar');
  progressBar.style.width = `${progress}%`;
}
function generateQuestions(number) {
  totalQuestions = parseInt(number)
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
  if(currentPresetIndex !== -1) {updatePreset(currentPresetIndex, true)}
}
function loadSummaryResults() {
    var preset = savedPresets[index];
    preset.correctAnswers.forEach(questionNumber => {
        document.getElementById(`answer${questionNumber}`).classList.add('correct-answer');
    });

    preset.wrongAnswers.forEach(questionNumber => {
        document.getElementById(`answer${questionNumber}`).classList.add('wrong-answer');
    });
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
    if(currentPresetIndex !== -1) loadSummaryResults();
    return;
  }
  document.getElementById(`question${currentQuestion}`).style.display = 'block';
  updateNavigationButtons();
  updateProgressBar();
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
    answers: [],
    correctAnswers: [],
    wrongAnswers: []
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
          <span>${answeredQuestions} answered questions out of ${preset.numQuestions}</span>
          <button onclick="deletePreset(${index})">Delete</button>
          <button onclick="loadPreset(${index})">Load</button>
          <button onclick="updatePreset(${index})">Update</button>
        </div>
      </div>
    `;
  });
}
function updatePreset(index, isAuto) {
  var preset = savedPresets[index];
  var presetName = preset.name;
  for (var i = 1; i <= totalQuestions; i++) {
    var questionName = `q${i}`;
    var answer = document.getElementById(questionName).value;
    if (answer) {
      var existingIndex = preset.answers.findIndex(p => p.question === i);
      if (existingIndex !== -1) {
        preset.answers.splice(existingIndex, 1, { question: i, answer: answer }); // Replace existing answer
      } else {
        preset.answers.push({ question: i, answer: answer });
      }
    }
  }
  preset.answeredQuestions = preset.answers.length
  // Check if a preset with the same name already exists
  var existingIndex = savedPresets.findIndex(p => p.name === presetName);
  if (existingIndex !== -1) {
    savedPresets.splice(existingIndex, 1, preset); // Replace existing preset
  } else {
    savedPresets.push(preset); // Add new preset
  }

  savePresetsToLocalStorage();
  displayPresets();
  if(isAuto === true) {
    showNotification("Preset autosaved successfully!", false);
    } else {    
    showNotification("Preset updated successfully!", false);
  }
}

function deletePreset(index) {
  savedPresets.splice(index, 1);
  savePresetsToLocalStorage();
  displayPresets();
  showNotification("Preset deleted successfully!", false);
}

function loadPreset(index) {
  var preset = savedPresets[index];

  currentQuestion = 1; // Reset current question index
  generateQuestions(preset.numQuestions);
  var questionContainer = document.getElementById("questionContainer");
  questionContainer.querySelectorAll('.option').forEach(option => {
    option.classList.remove('selected');
  });
  preset.answers.forEach(answer => {
    var { question, answer: option } = answer;
    chooseOption(option, question);
  });
  currentPresetIndex = index
  showNotification(preset.name + " loaded successfully!", false)
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
    if(currentPresetIndex !== -1) refreshResult();
  } else {
    answerElement.classList.remove('correct-answer');
    answerElement.classList.add('wrong-answer');
    if(currentPresetIndex !== -1) refreshResult();
  }
}
function refreshResult() {
    var preset = savedPresets[currentPresetIndex];
    preset.correctAnswers = [];
    preset.wrongAnswers = [];

    for (var i = 1; i <= totalQuestions; i++) {
        var answerElement = document.getElementById(`answer${i}`);
        var answer = answerElement.textContent;

        if (answerElement.classList.contains('correct-answer')) {
            preset.correctAnswers.push(i);
        } else if (answerElement.classList.contains('wrong-answer')) {
            preset.wrongAnswers.push(i);
        }
    }

    savedPresets[currentPresetIndex] = preset;
    savePresetsToLocalStorage();
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
