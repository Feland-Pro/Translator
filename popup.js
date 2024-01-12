document.addEventListener('DOMContentLoaded', function () {
    // Get the select element for target language
    var targetLanguageSelect = document.getElementById('targetLanguage');
  
    // Get the translate button
    var translateButton = document.getElementById('translateButton');
  
    // Add an event listener for the translate button
    translateButton.addEventListener('click', function () {
      // Get the selected target language
      var targetLanguage = targetLanguageSelect.value;
  
      // Send a message to the background script to start translation
      chrome.runtime.sendMessage({
        action: 'startTranslation',
        targetLanguage: targetLanguage
      });
    });
  
    // Add logic to populate language options in the select element
    // You may use an API or a predefined list of languages here
    // For simplicity, adding English and Spanish as options
    var languages = ['English', 'Spanish']; // Replace with your language options
    languages.forEach(function (language) {
      var option = document.createElement('option');
      option.value = language.toLowerCase(); // Use lowercase values for consistency
      option.text = language;
      targetLanguageSelect.appendChild(option);
    });
  });
  