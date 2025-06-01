// State
let currentStep = 1;
let selectedDoctor = null;
let selectedDate = null;
let selectedTime = null;

// Set minimum date to today
document.getElementById('appointmentDate').min = new Date().toISOString().split('T')[0];
document.getElementById('birthDate').max = new Date().toISOString().split('T')[0];

// Time slots
const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

// Doctor selection
document.querySelectorAll('.doctor-option').forEach(option => {
    option.addEventListener('click', function () {
        document.querySelectorAll('.doctor-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        selectedDoctor = {
            name: this.dataset.doctor,
            specialty: this.dataset.specialty
        };
        document.getElementById('nextBtn').disabled = false;
    });
});

// Date change handler
document.getElementById('appointmentDate').addEventListener('change', function () {
    selectedDate = this.value;
    generateTimeSlots();
    document.getElementById('nextBtn').disabled = true;
    selectedTime = null;
});

// Generate time slots
function generateTimeSlots() {
    const container = document.getElementById('timeSlots');
    container.innerHTML = '';
    timeSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;
        slot.addEventListener('click', function () {
            if (!this.classList.contains('unavailable')) {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
                selectedTime = time;
                if (currentStep === 2) {
                    document.getElementById('nextBtn').disabled = false;
                }
            }
        });
        // Randomly make some slots unavailable for demo
        if (Math.random() < 0.2) {
            slot.classList.add('unavailable');
        }
        container.appendChild(slot);
    });
}

// Step navigation
function nextStep() {
    if (currentStep === 1 && selectedDoctor) {
        showStep(2);
    } else if (currentStep === 2 && selectedDate && selectedTime) {
        showStep(3);
    } else if (currentStep === 3) {
        submitAppointment();
    }
}

function previousStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function showStep(step) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const tabs = ['doctorTab', 'dateTimeTab', 'patientTab', 'completeTab'];
    if (tabs[step - 1]) {
        document.getElementById(tabs[step - 1]).classList.add('active');
    }
    updateProgress(step);
    updateButtons(step);
    currentStep = step;
}

function updateProgress(step) {
    const progressLine = document.getElementById('progressLine');
    const width = ((step - 1) / 3) * 100;
    progressLine.style.width = width + '%';
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`step${i}`);
        const labelEl = stepEl.nextElementSibling;
        stepEl.classList.remove('active', 'completed');
        labelEl.classList.remove('active');
        if (i < step) {
            stepEl.classList.add('completed');
        } else if (i === step) {
            stepEl.classList.add('active');
            labelEl.classList.add('active');
        }
    }
}

function updateButtons(step) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    prevBtn.disabled = step === 1;
    if (step === 1) {
        nextBtn.textContent = 'Volgende';
        nextBtn.disabled = !selectedDoctor;
    } else if (step === 2) {
        nextBtn.textContent = 'Volgende';
        nextBtn.disabled = !selectedDate || !selectedTime;
    } else if (step === 3) {
        nextBtn.textContent = 'Afspraak Bevestigen';
        nextBtn.disabled = false;
    } else if (step === 4) {
        nextBtn.style.display = 'none';
        prevBtn.style.display = 'none';
    } else {
        nextBtn.style.display = '';
        prevBtn.style.display = '';
    }
}

function submitAppointment() {
    const form = document.getElementById('appointmentForm');
    const formData = new FormData(form);
    const requiredFields = ['lastName', 'firstName', 'mobile', 'email', 'birthDate'];
    let isValid = true;
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            input.style.borderColor = '#e8f5f3';
        }
    });
    if (!isValid) {
        alert('Vul alle verplichte velden in.');
        return;
    }
    const appointmentData = {
        doctor: `${selectedDoctor.name} - ${selectedDoctor.specialty}`,
        date: selectedDate,
        time: selectedTime,
        lastName: formData.get('lastName'),
        firstName: formData.get('firstName'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        birthDate: formData.get('birthDate'),
        notes: formData.get('notes')
    };
    const confirmationMessage = `
Bedankt ${appointmentData.firstName} ${appointmentData.lastName}!

Uw afspraak is bevestigd:
• Dokter: ${appointmentData.doctor}
• Datum: ${new Date(appointmentData.date).toLocaleDateString('nl-BE')}
• Tijd: ${appointmentData.time}

We sturen u een bevestigingsmail naar ${appointmentData.email}.
    `;
    showStep(4);
    setTimeout(() => {
        resetModal();
        closeAppointmentModal();
    }, 3500);
}

function resetModal() {
    currentStep = 1;
    selectedDoctor = null;
    selectedDate = null;
    selectedTime = null;
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentDate').value = '';
    document.querySelectorAll('.doctor-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
    document.getElementById('timeSlots').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #52796f;">Selecteer eerst een datum om beschikbare tijdstippen te zien</div>';
    document.getElementById('prevBtn').style.display = '';
    document.getElementById('nextBtn').style.display = '';
    showStep(1);
}

// Modal functions
function openAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    resetModal();
}

function closeAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function selectDoctor(name, specialty) {
    selectedDoctor = { name, specialty };
    openAppointmentModal();
    document.querySelectorAll('.doctor-option').forEach(option => {
        if (option.dataset.doctor === name) {
            option.click();
        }
    });
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('appointmentModal');
    if (event.target == modal) {
        closeAppointmentModal();
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});