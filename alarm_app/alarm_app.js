
// --- Global Variables and DOM Elements ---
const currentTimeDisplay = document.getElementById('current-time'), currentDateDisplay = document.getElementById('current-date');
const alarmNameInput = document.getElementById('alarm-name'), generateNameIdeaBtn = document.getElementById('generate-name-idea-btn');
const alarmDescriptionInput = document.getElementById('alarm-description'), enhanceDescriptionBtn = document.getElementById('enhance-description-btn');
const alarmAddressInput = document.getElementById('alarm-address'), alarmDateInput = document.getElementById('alarm-date'), alarmTimeInput = document.getElementById('alarm-time');
const recurrenceTypeSelect = document.getElementById('recurrence-type'), weeklyDaysContainer = document.getElementById('weekly-days-container'), weeklyDayCheckboxes = document.querySelectorAll('.weekly-day');
const setAlarmButton = document.getElementById('set-alarm-btn'), alarmsList = document.getElementById('alarms-list'), alarmSound = document.getElementById('alarm-sound');
const requestNotificationPermissionButton = document.getElementById('request-notification-permission'), darkModeToggle = document.getElementById('dark-mode-toggle');
const calendarMonthYear = document.getElementById('calendar-month-year'), calendarGrid = document.getElementById('calendar-grid'), prevMonthButton = document.getElementById('prev-month'), nextMonthButton = document.getElementById('next-month');
const selectedDateDisplay = document.getElementById('selected-date-display'), selectedDayAlarmsList = document.getElementById('selected-day-alarms'), calendarTooltip = document.getElementById('calendar-tooltip');
const customModal = document.getElementById('custom-modal'), modalTitle = document.getElementById('modal-title'), modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm-btn'), modalCancelBtn = document.getElementById('modal-cancel-btn'), modalOkBtn = document.getElementById('modal-ok-btn'), modalSpeakerContainer = document.getElementById('modal-speaker-container');
const settingsModal = document.getElementById('settings-modal'), openSettingsButton = document.getElementById('open-settings'), alarmSoundSelect = document.getElementById('alarm-sound-select');
const speakerVoiceSelect = document.getElementById('speaker-voice-select'), prioritizeNaturalVoicesToggle = document.getElementById('prioritize-natural-voices-toggle'), saveSettingsBtn = document.getElementById('save-settings-btn'), cancelSettingsBtn = document.getElementById('cancel-settings-btn');
const openChatbotButton = document.getElementById('chatbot-btn'), chatbotModal = document.getElementById('chatbot-modal'), chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input'), chatbotSendBtn = document.getElementById('chatbot-send-btn'), chatbotCloseBtn = document.getElementById('chatbot-close-btn');

const ALARM_SOUND_OPTIONS = [{ name: "Default (Song 1)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }, { name: "Chime", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }, { name: "Alert Tone", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }];
let alarms = [], currentCalendarDate = new Date(), selectedCalendarDay = null, activeAlarmId = null, selectedVoice = null;
let isSpeechPaused = false, currentUtterance = null, speakingAlarmId = null;

// --- TTS with Pause/Resume ---
/**
 * Updates the icon and title of a speaker button based on the current speech state.
 * @param {HTMLElement} button - The speaker button element.
 * @param {number} alarmId - The ID of the alarm associated with the button.
 */
function updateSpeakerButtonIcon(button, alarmId) {
    if (speakingAlarmId === alarmId && speechSynthesis.speaking) {
        button.innerHTML = isSpeechPaused
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>` // Play icon
            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`; // Pause icon
        button.title = isSpeechPaused ? "Resume Speech" : "Pause Speech";
    } else {
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`; // Speaker icon
        button.title = "Speak Alarm Details";
    }
}

/**
 * Handles the click event for a speaker button, toggling speech play/pause.
 * @param {object} alarm - The alarm object to speak about.
 */
function handleSpeakButtonClick(alarm) {
    if (!('speechSynthesis' in window)) {
        return showAlert('Feature Not Supported', 'Text-to-speech is not supported in your browser.');
    }

    if (speechSynthesis.speaking && speakingAlarmId === alarm.id) {
        // If the same alarm is speaking, toggle pause/resume
        if (isSpeechPaused) {
            speechSynthesis.resume();
        } else {
            speechSynthesis.pause();
        }
    } else {
        // If a different alarm is speaking, or nothing is speaking, cancel current and start new
        speechSynthesis.cancel();
        speakAlarmDetails(alarm);
    }
}

/**
 * Initiates text-to-speech for the given alarm details.
 * @param {object} alarm - The alarm object to speak.
 */
function speakAlarmDetails(alarm) {
    let speechText = `Alarm details: ${alarm.name || 'Untitled Alarm'}. `;
    if (alarm.description) speechText += `${alarm.description}. `;

    if (alarm.recurrenceType === 'daily') speechText += 'This alarm repeats daily. ';
    else if (alarm.recurrenceType === 'weekly' && alarm.recurrenceDays.length > 0) {
        speechText += `It repeats weekly on ${alarm.recurrenceDays.map(d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]).join(', ')}. `;
    }
    if (alarm.address) speechText += `Location is ${alarm.address}.`;

    currentUtterance = new SpeechSynthesisUtterance(speechText);
    if (selectedVoice) currentUtterance.voice = selectedVoice;

    currentUtterance.onstart = () => { isSpeechPaused = false; speakingAlarmId = alarm.id; updateAllSpeakerButtons(); };
    currentUtterance.onpause = () => { isSpeechPaused = true; updateAllSpeakerButtons(); };
    currentUtterance.onresume = () => { isSpeechPaused = false; updateAllSpeakerButtons(); };
    currentUtterance.onend = () => { speakingAlarmId = null; isSpeechPaused = false; currentUtterance = null; updateAllSpeakerButtons(); };
    currentUtterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance.onerror", event);
        speakingAlarmId = null;
        isSpeechPaused = false;
        showAlert('Speech Error', 'Could not play the audio. Error: ' + event.error);
        updateAllSpeakerButtons();
    };
    speechSynthesis.speak(currentUtterance);
}

/**
 * Updates the icons of all speaker buttons on the page.
 */
function updateAllSpeakerButtons() {
    document.querySelectorAll('.speaker-btn-small, .modal-speaker-btn').forEach(btn => {
        const alarmId = parseInt(btn.dataset.alarmId);
        updateSpeakerButtonIcon(btn, alarmId);
    });
}

/**
 * Creates a speaker button element.
 * @param {object} alarm - The alarm object associated with the button.
 * @param {boolean} isModal - True if the button is for a modal, false otherwise.
 * @returns {HTMLElement} The created button element.
 */
function createSpeakerButton(alarm, isModal = false) {
    const speakerButton = document.createElement('button');
    speakerButton.className = isModal ? 'btn-secondary modal-speaker-btn text-sm py-1 px-3 mt-4 mx-auto' : 'speaker-btn-small';
    speakerButton.dataset.alarmId = alarm.id;
    updateSpeakerButtonIcon(speakerButton, alarm.id); // Set initial icon
    speakerButton.onclick = (e) => { e.stopPropagation(); handleSpeakButtonClick(alarm); };
    return speakerButton;
}

// --- Modals and Utility Functions ---
/**
 * Displays a custom alert modal.
 * @param {string} title - The title of the alert.
 * @param {string} message - The message content.
 * @param {object} [alarmObject=null] - Optional alarm object for speaking.
 */
function showAlert(title, message, alarmObject = null) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalSpeakerContainer.innerHTML = '';
    if (alarmObject && (alarmObject.name || alarmObject.description || alarmObject.address)) {
        const speakBtn = createSpeakerButton(alarmObject, true);
        modalSpeakerContainer.appendChild(speakBtn);
    }
    modalConfirmBtn.style.display = 'none';
    modalCancelBtn.style.display = 'none';
    modalOkBtn.style.display = 'block';
    customModal.classList.remove('hidden');
    modalOkBtn.onclick = () => {
        customModal.classList.add('hidden');
        if (speechSynthesis.speaking && speakingAlarmId === (alarmObject ? alarmObject.id : null)) {
            speechSynthesis.cancel();
        }
    };
}

/**
 * Displays a custom confirmation modal.
 * @param {string} title - The title of the confirmation.
 * @param {string} message - The message content.
 * @returns {Promise<boolean>} A promise that resolves to true if confirmed, false if canceled.
 */
function showConfirm(title, message) {
    return new Promise(resolve => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalConfirmBtn.textContent = 'Confirm';
        modalCancelBtn.textContent = 'Cancel';
        modalConfirmBtn.style.display = 'block';
        modalCancelBtn.style.display = 'block';
        modalOkBtn.style.display = 'none';
        modalSpeakerContainer.innerHTML = ''; // Clear speaker button for confirm
        customModal.classList.remove('hidden');
        modalConfirmBtn.onclick = () => {
            customModal.classList.add('hidden');
            resolve(true);
        };
        modalCancelBtn.onclick = () => {
            customModal.classList.add('hidden');
            resolve(false);
        };
    });
}

/**
 * Formats a Date object into a readable date string.
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Formats a Date object into a readable time string.
 * @param {Date} date - The date to format.
 * @returns {string} The formatted time string.
 */
function formatTime(date) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

/**
 * Generates a Google Maps search link for a given address.
 * @param {string} address - The address to search for.
 * @returns {string} The Google Maps URL.
 */
function generateGoogleMapsLink(address) {
    return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';
}

/**
 * Updates the current time and date display on the UI.
 */
function updateCurrentTimeDisplay() {
    const now = new Date();
    currentTimeDisplay.textContent = formatTime(now);
    currentDateDisplay.textContent = formatDate(now);
}

/**
 * Sets the default date and time values for the alarm input fields to the current date and time.
 */
function setDefaultAlarmDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    alarmDateInput.value = `${year}-${month}-${day}`;
    alarmTimeInput.value = `${hours}:${minutes}`;
}

// --- Alarm Core Logic ---
/**
 * Checks all active alarms against the current time and triggers them if due.
 */
function checkAlarms() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const todayISO = now.toISOString().split('T')[0];

    alarms.forEach(alarm => {
        const alarmTimeParts = alarm.time.split(':').map(Number);
        const alarmHour = alarmTimeParts[0];
        const alarmMinute = alarmTimeParts[1];

        if (alarm.recurrenceType === 'once') {
            const alarmDateTime = new Date(`${alarm.date}T${alarm.time}:00`);
            if (alarmDateTime.getFullYear() === now.getFullYear() &&
                alarmDateTime.getMonth() === now.getMonth() &&
                alarmDateTime.getDate() === now.getDate() &&
                alarmHour === currentHour &&
                alarmMinute === currentMinute &&
                currentSecond === 0 &&
                !alarm.isTriggered) { // Only trigger if not already triggered
                triggerAlarm(alarm);
                alarm.isTriggered = true; // Mark as triggered
                updateLocalStorageAlarms();
                renderAlarms();
                renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
            }
        } else { // Daily or Weekly recurrence
            const isTodayDue = alarm.recurrenceType === 'daily' ||
                (alarm.recurrenceType === 'weekly' && alarm.recurrenceDays.includes(now.getDay()));

            // Reset triggeredForToday at the start of a new day
            if (alarm.lastCheckedDate !== todayISO) {
                alarm.triggeredForToday = false;
                alarm.lastCheckedDate = todayISO;
                // Only update if it actually changed to avoid excessive writes
                if (JSON.stringify(alarms.find(a => a.id === alarm.id)) !== JSON.stringify(alarm)) {
                    updateLocalStorageAlarms();
                }
            }

            if (isTodayDue &&
                alarmHour === currentHour &&
                alarmMinute === currentMinute &&
                currentSecond === 0 &&
                !alarm.triggeredForToday) {
                triggerAlarm(alarm);
                alarm.triggeredForToday = true;
                updateLocalStorageAlarms();
            }
        }
    });
}

/**
 * Triggers an alarm, plays sound, shows notification, and displays an alert modal.
 * @param {object} alarm - The alarm object to trigger.
 */
function triggerAlarm(alarm) {
    const alarmMessage = `${alarm.name || 'Your alarm'} is going off!`;
    if (Notification.permission === 'granted') {
        new Notification('Alarm!', { body: alarmMessage, icon: 'https://placehold.co/128x128/007bff/ffffff?text=🔔' });
    }
    showAlert('Alarm!', alarmMessage, alarm);
    try {
        alarmSound.play();
        activeAlarmId = alarm.id;
        renderAlarms();
        updateAllSpeakerButtons(); // Ensure button reflects active alarm state
    } catch (error) {
        console.error("Error playing sound:", error);
    }
}

/**
 * Renders the list of alarms in the "Upcoming Alarms" section.
 * @param {Array<object>} [filteredAlarms=alarms] - Optional array of alarms to render (for filtering).
 * @param {HTMLElement} [targetList=alarmsList] - The DOM element where alarms should be rendered.
 */
function renderAlarms(filteredAlarms = alarms, targetList = alarmsList) {
    targetList.innerHTML = ''; // Clear the target list
    if (filteredAlarms.length === 0) {
        targetList.innerHTML = '<p class="text-gray-500 text-center">No alarms set yet.</p>';
        return;
    }

    // Sort alarms by time
    const sortedAlarms = [...filteredAlarms].sort((a, b) => {
        const [hA, mA] = a.time.split(':').map(Number);
        const [hB, mB] = b.time.split(':').map(Number);
        if (hA !== hB) return hA - hB;
        return mA - mB;
    });

    sortedAlarms.forEach(alarm => {
        const li = document.createElement('li');
        li.className = 'flex flex-col bg-white p-3 rounded-md shadow-sm mb-2';

        const mainInfoDiv = document.createElement('div');
        mainInfoDiv.className = 'flex items-center justify-between';

        const alarmText = document.createElement('span');
        alarmText.className = 'text-base font-semibold';
        let displayText = `⏰ ${alarm.name || 'Alarm'} at ${alarm.time}`;
        if (alarm.recurrenceType === 'once') {
            displayText += ` on ${formatDate(new Date(alarm.date))}`;
        } else if (alarm.recurrenceType === 'weekly') {
            const days = alarm.recurrenceDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ');
            displayText += ` (Weekly on ${days})`;
        } else {
            displayText += ` (${alarm.recurrenceType})`;
        }
        alarmText.textContent = displayText;

        // Apply styles based on alarm state
        if (activeAlarmId === alarm.id) {
            alarmText.classList.add('text-red-600');
            alarmText.classList.remove('text-gray-800'); // Ensure it's not gray
            alarmText.classList.remove('strike-blue'); // Remove strike-blue if actively ringing
        } else if (alarm.isTriggered) { // For 'once' alarms that have completed or recurring that are done for the day
            alarmText.classList.add('strike-blue'); // Strikethrough in blue
            alarmText.classList.remove('text-red-600'); // Ensure it's not red if not active
            alarmText.classList.add('text-gray-800'); // Ensure basic text color
        } else {
            alarmText.classList.remove('text-red-600');
            alarmText.classList.remove('strike-blue');
            alarmText.classList.add('text-gray-800'); // Default text color
        }


        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex items-center';

        // Only show stop button if this alarm is currently active
        if (activeAlarmId === alarm.id) {
            const stopButton = document.createElement('button');
            stopButton.textContent = 'Stop';
            stopButton.className = 'btn-danger mr-2';
            stopButton.onclick = () => {
                alarmSound.pause();
                alarmSound.currentTime = 0;
                activeAlarmId = null;
                // For 'once' alarms, mark as triggered when stopped
                if (alarm.recurrenceType === 'once') {
                    const alarmToUpdate = alarms.find(a => a.id === alarm.id);
                    if (alarmToUpdate) alarmToUpdate.isTriggered = true;
                }
                updateLocalStorageAlarms();
                renderAlarms(); // Re-render upcoming alarms list
                displayAlarmsForSelectedDay(currentCalendarDate.getDate(), currentCalendarDate.getMonth(), currentCalendarDate.getFullYear()); // Re-render selected day alarms
                updateAllSpeakerButtons(); // Update speaker buttons as well
            };
            buttonContainer.appendChild(stopButton);
        }

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn-danger';
        deleteButton.onclick = async () => {
            if (await showConfirm('Delete Alarm?', `Are you sure you want to delete "${alarm.name || 'Untitled'}"?`)) {
                alarms = alarms.filter(a => a.id !== alarm.id);
                if (activeAlarmId === alarm.id) {
                    speechSynthesis.cancel(); // Stop speech if current alarm is deleted
                    alarmSound.pause();
                    alarmSound.currentTime = 0;
                    activeAlarmId = null;
                }
                updateLocalStorageAlarms();
                renderAlarms(); // Update the main upcoming alarms list
                renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth()); // Re-render calendar for alarm indicators
                displayAlarmsForSelectedDay(currentCalendarDate.getDate(), currentCalendarDate.getMonth(), currentCalendarDate.getFullYear()); // Update selected day alarms list
                updateAllSpeakerButtons(); // Update speaker buttons after deletion
            }
        };
        buttonContainer.appendChild(deleteButton);

        mainInfoDiv.appendChild(alarmText);
        mainInfoDiv.appendChild(buttonContainer);
        li.appendChild(mainInfoDiv);

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'text-gray-600 text-sm mt-1 flex items-center justify-between';

        const textDetailsSpan = document.createElement('span');
        textDetailsSpan.className = 'flex-1';
        if (alarm.description) {
            textDetailsSpan.textContent = alarm.description;
        }
        if (alarm.address) {
            const mapLink = document.createElement('a');
            mapLink.href = alarm.mapLink;
            mapLink.target = '_blank';
            mapLink.className = 'text-blue-500 hover:underline ml-2';
            mapLink.textContent = `📍 View Map`;
            textDetailsSpan.appendChild(mapLink);
        }
        detailsDiv.appendChild(textDetailsSpan);
        detailsDiv.appendChild(createSpeakerButton(alarm));
        li.appendChild(detailsDiv);

        targetList.appendChild(li); // Append to the specified targetList
    });
    updateAllSpeakerButtons(); // Ensure correct icons are displayed after rendering
}


setAlarmButton.addEventListener('click', () => {
    const recurrenceType = recurrenceTypeSelect.value;
    let recurrenceDays = [];

    if (!alarmTimeInput.value || (recurrenceType === 'once' && !alarmDateInput.value)) {
        return showAlert('Input Error', 'Please select a date and time for the alarm.');
    }

    if (recurrenceType === 'once') {
        const alarmDateTime = new Date(`${alarmDateInput.value}T${alarmTimeInput.value}`);
        if (alarmDateTime <= new Date()) {
            return showAlert('Invalid Time', 'Please select a future date and time.');
        }
    }

    if (recurrenceType === 'weekly') {
        weeklyDayCheckboxes.forEach(cb => {
            if (cb.checked) recurrenceDays.push(parseInt(cb.value));
        });
        if (recurrenceDays.length === 0) {
            return showAlert('Input Error', 'Please select at least one day for weekly recurrence.');
        }
    }

    const newAlarm = {
        id: Date.now(), // Unique ID for the alarm
        date: alarmDateInput.value,
        time: alarmTimeInput.value,
        name: alarmNameInput.value.trim() || 'Untitled Alarm',
        description: alarmDescriptionInput.value.trim(),
        address: alarmAddressInput.value.trim(),
        mapLink: generateGoogleMapsLink(alarmAddressInput.value.trim()),
        recurrenceType,
        recurrenceDays,
        triggeredForToday: false, // Flag to prevent multiple triggers on the same day for recurring alarms
        isTriggered: false, // New flag for 'once' alarms to mark as completed
        lastCheckedDate: null // To track the last day it was checked/triggered
    };

    alarms.push(newAlarm);
    updateLocalStorageAlarms();
    renderAlarms();
    renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
    showAlert('Success', `Alarm "${newAlarm.name}" set successfully.`, newAlarm);

    // Reset form fields
    alarmNameInput.value = '';
    alarmDescriptionInput.value = '';
    alarmAddressInput.value = '';
    setDefaultAlarmDateTime(); // Reset to current time
    recurrenceTypeSelect.value = 'once';
    weeklyDaysContainer.classList.add('hidden');
    alarmDateInput.disabled = false;
    weeklyDayCheckboxes.forEach(cb => cb.checked = false);
});

/**
 * Saves the current alarms array to local storage.
 */
function updateLocalStorageAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

/**
 * Loads alarms from local storage and initializes them.
 */
function loadAlarmsFromLocalStorage() {
    const stored = localStorage.getItem('alarms');
    if (stored) {
        alarms = JSON.parse(stored).map(a => ({
            ...a,
            mapLink: generateGoogleMapsLink(a.address),
            // Ensure triggeredForToday and lastCheckedDate are reset for new day
            triggeredForToday: false,
            // Ensure isTriggered is false on load unless explicitly set otherwise
            isTriggered: a.isTriggered || false,
            lastCheckedDate: null // Will be updated on first check of the day
        }));
    }
}

recurrenceTypeSelect.addEventListener('change', () => {
    weeklyDaysContainer.classList.toggle('hidden', recurrenceTypeSelect.value !== 'weekly');
    alarmDateInput.disabled = recurrenceTypeSelect.value !== 'once';
});

// --- Calendar Logic ---
/**
 * Renders the calendar grid for the specified year and month.
 * @param {number} year - The year to display.
 * @param {number} month - The month to display (0-indexed).
 */
function renderCalendar(year, month) {
    calendarGrid.innerHTML = '';
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 6 for Saturday

    calendarMonthYear.textContent = firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Add empty divs for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDiv = document.createElement('div');
        calendarGrid.appendChild(emptyDiv);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day p-3 text-center rounded-lg cursor-pointer transition-all duration-200';
        dayDiv.textContent = day;
        dayDiv.dataset.day = day;

        const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
        if (isToday) {
            dayDiv.classList.add('current-day');
        }

        const alarmsOnDay = getAlarmsForDate(day, month, year);
        if (alarmsOnDay.length > 0) {
            dayDiv.classList.add('has-alarm');
            // Add tooltip event listeners
            addTooltipListeners(dayDiv, alarmsOnDay);
        }

        dayDiv.addEventListener('click', () => {
            // Remove selected-day class from previously selected day
            if (selectedCalendarDay) {
                selectedCalendarDay.classList.remove('selected-day');
            }
            dayDiv.classList.add('selected-day');
            selectedCalendarDay = dayDiv;
            displayAlarmsForSelectedDay(day, month, year);
        });

        calendarGrid.appendChild(dayDiv);
    }
}

/**
 * Adds mouse event listeners to a calendar day element for displaying tooltips.
 * @param {HTMLElement} dayDiv - The calendar day div element.
 * @param {Array<object>} alarmsForDay - An array of alarm objects for that day.
 */
function addTooltipListeners(dayDiv, alarmsForDay) {
    dayDiv.addEventListener('mouseenter', (e) => {
        if (alarmsForDay.length === 0) return;

        let tooltipContent = '<ul>';
        alarmsForDay.forEach(alarm => {
            tooltipContent += `<li><strong>${alarm.time}</strong>: ${alarm.name || 'Untitled Alarm'}`;
            if (alarm.description) {
                tooltipContent += `<br>${alarm.description}`;
            }
            tooltipContent += '</li>';
        });
        tooltipContent += '</ul>';

        calendarTooltip.innerHTML = tooltipContent;
        calendarTooltip.classList.remove('hidden');

        // Position the tooltip
        const rect = dayDiv.getBoundingClientRect();
        calendarTooltip.style.left = `${rect.left + window.scrollX + rect.width / 2 - calendarTooltip.offsetWidth / 2}px`;
        calendarTooltip.style.top = `${rect.top + window.scrollY - calendarTooltip.offsetHeight - 10}px`; // 10px above the element
        calendarTooltip.style.opacity = '1';
        calendarTooltip.style.transform = 'translateY(0)';
    });

    dayDiv.addEventListener('mouseleave', () => {
        calendarTooltip.style.opacity = '0';
        calendarTooltip.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            calendarTooltip.classList.add('hidden');
        }, 200); // Hide after transition
    });
}


/**
 * Retrieves alarms that fall on a specific date, considering recurrence.
 * @param {number} day - The day of the month.
 * @param {number} month - The month (0-indexed).
 * @param {number} year - The year.
 * @returns {Array<object>} An array of alarm objects for the specified date.
 */
function getAlarmsForDate(day, month, year) {
    const checkDate = new Date(year, month, day);
    return alarms.filter(alarm => {
        if (alarm.recurrenceType === 'once') {
            const alarmDate = new Date(alarm.date);
            return alarmDate.getFullYear() === year && alarmDate.getMonth() === month && alarmDate.getDate() === day;
        }
        if (alarm.recurrenceType === 'daily') {
            // For daily alarms, check if their set date is on or before the checkDate
            // This ensures alarms set for future days still show up daily once their set date arrives
            const setDate = new Date(alarm.date);
            return setDate <= checkDate;
        }
        if (alarm.recurrenceType === 'weekly') {
            // For weekly alarms, check if their set date is on or before the checkDate
            const setDate = new Date(alarm.date);
            return setDate <= checkDate && alarm.recurrenceDays.includes(checkDate.getDay());
        }
        return false;
    });
}

/**
 * Displays alarms for the selected calendar day in the dedicated section.
 * @param {number} day - The day of the month.
 * @param {number} month - The month (0-indexed).
 * @param {number} year - The year.
 */
function displayAlarmsForSelectedDay(day, month, year) {
    selectedDayAlarmsList.innerHTML = '';
    const selectedDate = new Date(year, month, day);
    selectedDateDisplay.textContent = `Alarms for: ${formatDate(selectedDate)}`;

    const alarmsForDay = getAlarmsForDate(day, month, year);

    if (alarmsForDay.length === 0) {
        selectedDayAlarmsList.innerHTML = '<p class="text-gray-500 text-center">No alarms for this date.</p>';
        return;
    }

    // Render these specific alarms directly into the selectedDayAlarmsList
    // The renderAlarms function is now more flexible and can target different lists.
    renderAlarms(alarmsForDay, selectedDayAlarmsList);
}

prevMonthButton.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
});

nextMonthButton.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
});

// --- Chatbot and Gemini ---
/**
 * Adds a chat message to the chatbot messages display.
 * @param {string} text - The message text.
 * @param {string} sender - 'user' or 'bot'.
 */
function addChatMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}-message`;
    div.textContent = text;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Auto-scroll to latest message
}

/**
 * Handles the user's chat message submission.
 */
async function handleChatSend() {
    const userInput = chatbotInput.value.trim();
    if (!userInput) return;

    addChatMessage(userInput, 'user');
    chatbotInput.value = ''; // Clear input

    addChatMessage('Thinking...', 'bot'); // Show thinking message

    await processChatMessage(userInput);
}

/**
 * Processes the user's chat message using the Gemini API.
 * @param {string} message - The user's message.
 */
async function processChatMessage(message) {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `Analyze the user's request to find alarms. Today's date is ${today}. Determine the specific date the user is asking about. Respond ONLY with a JSON object in the format {"date": "YYYY-MM-DD"}. Examples: "tomorrow" -> tomorrow's date, "today" -> today's date, "july 4th 2026" -> "2026-07-04". If no specific date is mentioned or it's unclear, respond with {"error": "Could not determine the date. Please be more specific."}. User request: "${message}"`;

    const resultText = await callGeminiAPI(prompt, null, chatbotSendBtn);
    const lastBotMessage = chatbotMessages.querySelector('.bot-message:last-child');

    try {
        // Clean the response: remove markdown code block fences if present
        const cleanedResult = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const resultJson = JSON.parse(cleanedResult);

        if (resultJson.date) {
            lastBotMessage.textContent = `Sure! Looking up tasks for ${resultJson.date}.`;
            const [year, month, day] = resultJson.date.split('-').map(Number);

            // Validate parsed date
            if (!year || !month || !day || isNaN(new Date(year, month - 1, day))) {
                throw new Error("Invalid date from API");
            }

            // Update calendar and display alarms
            currentCalendarDate = new Date(year, month - 1, day);
            renderCalendar(year, month - 1);

            // Click the day element to highlight it and display alarms for it
            const dayElement = calendarGrid.querySelector(`.calendar-day[data-day="${day}"]`);
            if (dayElement) {
                dayElement.click(); // This will also call displayAlarmsForSelectedDay
            } else {
                // Fallback if day element isn't directly clickable (e.g., if it's in a different month view now)
                displayAlarmsForSelectedDay(day, month - 1, year);
            }

            // Optionally close chatbot after a short delay
            setTimeout(() => chatbotModal.classList.add('hidden'), 1500);

        } else {
            lastBotMessage.textContent = resultJson.error || "Sorry, I couldn't understand that.";
        }
    } catch (error) {
        console.error("Chatbot parse error:", error);
        lastBotMessage.textContent = "I had trouble with that request. Please try rephrasing.";
    }
}

const API_KEY = ""; // Keep this empty. Canvas will provide it at runtime.

/**
 * Calls the Gemini API to generate content.
 * @param {string} prompt - The prompt for the Gemini model.
 * @param {HTMLElement} [targetElement=null] - Optional HTML element to populate with the response.
 * @param {HTMLElement} [buttonElement=null] - Optional button element to disable during API call.
 * @returns {Promise<string>} The generated text from the API.
 */
async function callGeminiAPI(prompt, targetElement = null, buttonElement = null) {
    if (buttonElement) {
        buttonElement.disabled = true;
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '...';
        // Use finally block to ensure button state is reset
        const resetButtonStyle = () => {
            buttonElement.disabled = false;
            buttonElement.textContent = originalText;
        };

        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                if (targetElement) targetElement.value = text.trim();
                return text;
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (error) {
            const msg = 'API Error. Please try again.';
            if (targetElement) showAlert('Error', msg);
            console.error("Gemini API call failed:", error);
            return `{"error": "${msg}"}`; // Return a JSON string with error for chatbot parsing
        } finally {
            resetButtonStyle(); // Ensure button is re-enabled and text restored
        }
    } else { // Case where no button element is provided (e.g., initial chatbot message)
        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (error) {
            console.error("Gemini API call failed:", error);
            return `{"error": "API Error. Please try again."}`;
        }
    }
}

generateNameIdeaBtn.addEventListener('click', () => callGeminiAPI("Suggest a creative and concise alarm/task name idea.", alarmNameInput, generateNameIdeaBtn));
enhanceDescriptionBtn.addEventListener('click', () => alarmDescriptionInput.value && callGeminiAPI(`Enhance this task description: "${alarmDescriptionInput.value}"`, alarmDescriptionInput, enhanceDescriptionBtn));
openChatbotButton.addEventListener('click', () => chatbotModal.classList.remove('hidden'));
chatbotCloseBtn.addEventListener('click', () => chatbotModal.classList.add('hidden'));
chatbotSendBtn.addEventListener('click', handleChatSend);
chatbotInput.addEventListener('keydown', (e) => e.key === 'Enter' && handleChatSend());

// --- Settings and Init ---
/**
 * Populates the speaker voice select dropdown with available voices.
 */
function populateVoices() {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return;

    speakerVoiceSelect.innerHTML = '';
    // Filter and sort voices to prioritize natural-sounding ones if setting is enabled
    const prioritizeNatural = prioritizeNaturalVoicesToggle.checked;
    const filteredVoices = voices.filter(voice => {
        // Example filter: only en-US voices, and prefer Google/Microsoft (often higher quality)
        const isEnglish = voice.lang.startsWith('en');
        const isNatural = voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Neural');
        return isEnglish && (!prioritizeNatural || isNatural);
    }).sort((a, b) => {
        // Put default voice first, then sort alphabetically
        if (a.default) return -1;
        if (b.default) return 1;
        return a.name.localeCompare(b.name);
    });


    filteredVoices.forEach(voice => {
        const opt = document.createElement('option');
        opt.value = voice.voiceURI;
        opt.textContent = `${voice.name} (${voice.lang})${opt.default ? ' - Default' : ''}`; // Use opt.default here
        speakerVoiceSelect.appendChild(opt);
    });

    // Set selected voice based on saved preference or default
    const savedVoiceURI = localStorage.getItem('speakerVoiceURI');
    if (savedVoiceURI) {
        speakerVoiceSelect.value = savedVoiceURI;
    }
    selectedVoice = voices.find(v => v.voiceURI === speakerVoiceSelect.value);
}

openSettingsButton.addEventListener('click', () => { settingsModal.classList.remove('hidden'); });
cancelSettingsBtn.addEventListener('click', () => { settingsModal.classList.add('hidden'); });
saveSettingsBtn.addEventListener('click', () => {
    localStorage.setItem('alarmSoundUrl', alarmSoundSelect.value);
    alarmSound.src = alarmSoundSelect.value;
    localStorage.setItem('speakerVoiceURI', speakerVoiceSelect.value);
    selectedVoice = speechSynthesis.getVoices().find(v => v.voiceURI === speakerVoiceSelect.value);
    localStorage.setItem('prioritizeNaturalVoices', prioritizeNaturalVoicesToggle.checked);
    settingsModal.classList.add('hidden');
    showAlert('Settings Saved', 'Preferences updated.');
});

requestNotificationPermissionButton.addEventListener('click', () => Notification.requestPermission());

darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme', darkModeToggle.checked);
    localStorage.setItem('theme', darkModeToggle.checked ? 'dark' : 'light');
});

// Event listener for changes in prioritizeNaturalVoicesToggle to re-populate voices
prioritizeNaturalVoicesToggle.addEventListener('change', populateVoices);


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Apply dark mode if saved
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        darkModeToggle.checked = true;
    }

    // Set up alarm sound select
    const savedSoundUrl = localStorage.getItem('alarmSoundUrl') || ALARM_SOUND_OPTIONS[0].url;
    alarmSound.src = savedSoundUrl;
    ALARM_SOUND_OPTIONS.forEach(s => {
        const o = document.createElement('option');
        o.value = s.url;
        o.textContent = s.name;
        alarmSoundSelect.appendChild(o);
    });
    alarmSoundSelect.value = savedSoundUrl;

    // Load alarms, render lists and calendar
    loadAlarmsFromLocalStorage();
    renderAlarms();
    renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());

    // Initialize Text-to-Speech voices
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = populateVoices; // Event fires when voices are loaded
        populateVoices(); // Call initially in case voices are already loaded
    }

    // Set default date and time
    setDefaultAlarmDateTime();

    // Start time and alarm checks
    updateCurrentTimeDisplay();
    setInterval(updateCurrentTimeDisplay, 1000); // Update current time every second
    setInterval(checkAlarms, 1000); // Check alarms every second
});
