// Toggles feedback form when pressing feedback button
function feedbackToggle() {
   const feedback_button = document.getElementById('form-wrapper');
   if (feedback_button.style.display === 'block') {
      feedback_button.style.display = 'none';
   }
   else {
      feedback_button.style.display = 'block';
   }
}