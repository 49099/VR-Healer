// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, setDoc, doc, updateDoc, serverTimestamp, getDoc ,addDoc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBSNZkt8-iNirAqfDtBG7Cc8HoFyLDJ80o",
    authDomain: "vr-healer-cc2b7.firebaseapp.com",
    projectId: "vr-healer-cc2b7",
    storageBucket: "vr-healer-cc2b7.appspot.com",
    messagingSenderId: "77804580240",
    appId: "1:77804580240:web:3b97e98cf590d50dff9715"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const profileImageElem = document.getElementById('profileImage');
const fullNameElem = document.getElementById('fullName');
const emailElem = document.getElementById('email');
const phoneElem = document.getElementById('phone');
const addressElem = document.getElementById('address');
const specializationSelect = document.getElementById('specialization');
const therapistSelect = document.getElementById('therapists');
const therapistDetails = document.getElementById('therapistDetails');
const appointmentTable = document.getElementById('appointmentTable').querySelector('tbody');

// Sections

const sections = {
    myProfile: document.getElementById('myProfile'),
    editProfile: document.getElementById('editProfile'),
    changePassword: document.getElementById('changePassword'),
    bookAppointment: document.getElementById('bookAppointment'),
    appointmentHistory: document.getElementById('appointmentHistory')
};

// Function to show a section
const showSection = (sectionId) => {
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    sections[sectionId].classList.add('active');
};

// Add event listeners for navigation
document.getElementById('myProfileTab').addEventListener('click', () => showSection('myProfile'));
document.getElementById('bookAppointmentTab').addEventListener('click', () => showSection('bookAppointment'));
document.getElementById('appointmentHistoryTab').addEventListener('click', () => showSection('appointmentHistory'));
document.getElementById('editProfileButton').addEventListener('click', () => showSection('editProfile'));
document.getElementById('changePasswordButton').addEventListener('click', () => showSection('changePassword'));

// Show default section
showSection('myProfile');


// Load Patient Profile Data
const loadPatientData = async (user) => {
    if (!user) {
        alert("User not logged in. Redirecting to login page.");
        window.location.href = "form.html";
        return;
    }
    try {
        const docRef = doc(db, "patients", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            fullNameElem.textContent = data.name || "No Name Found";
            emailElem.textContent = data.email || "No Email Found";
            phoneElem.textContent = data.phone || "No Phone Found";
            addressElem.textContent = data.address || "No Address Found";
            profileImageElem.src = data.profile_picture_base64 || "default-profile.png";
        } else {
            alert("Patient profile not found. Please contact support.");
        }
    } catch (error) {
        console.error("Error fetching patient data:", error.message);
    }
};
// Save Edited Profile
document.getElementById('saveProfileButton').addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("User not logged in.");
        return;
    }
    const updatedProfile = {
        name: document.getElementById('editFullName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value,
        updatedAt: serverTimestamp(),
    };

    try {
        await updateDoc(doc(db, "patients", user.uid), updatedProfile);
        alert("Profile updated successfully!");
        showSection('myProfile');
        await loadPatientData(user);
    } catch (error) {
        console.error("Error updating profile:", error.message);
    }
});

// Load Specializations
const loadSpecializations = () => {
    const specializations = ["Claustrophobia", "Nyctophobia", "Hydrophobia"];
    specializationSelect.innerHTML = '<option value="">Select Specialization</option>';
    specializations.forEach(spec => {
        const option = document.createElement('option');
        option.value = spec;
        option.textContent = spec;
        specializationSelect.appendChild(option);
    });
};

// Load Therapists
specializationSelect.addEventListener('change', async () => {
    const specialization = specializationSelect.value;
    if (!specialization) return;

    therapistSelect.innerHTML = '<option value="">Loading...</option>';

    try {
        const q = query(collection(db, "therapists"), where("specialization", "==", specialization));
        const querySnapshot = await getDocs(q);

        therapistSelect.innerHTML = '<option value="">Select Therapist</option>';
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${data.name} (${data.consultation_fee} PKR)`; 
            therapistSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading therapists:", error.message);
    }
});

// Load Appointments
const loadAppointmentHistory = async (user) => {
    if (!user) return;

    try {
        const q = query(collection(db, "appointments"), where("patient_id", "==", user.uid));
        const querySnapshot = await getDocs(q);

        appointmentTable.innerHTML = ''; // Clear table before adding new data
        let index = 1; // Initialize numbering counter

        querySnapshot.forEach(doc => {
            const data = doc.data();
            console.log("Appointment Data:", data); // Debugging purpose

            // Ensure therapist name is not undefined
            const therapistName = data.therapist_name ? data.therapist_name : "Not Available";

            // Create table row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index++}</td>  <!-- Incrementing number -->
                <td>${therapistName}</td>
                <td>${data.specialization || "N/A"}</td>
                <td>${data.selected_date} / ${data.selected_time}</td>
                <td>${data.status}</td>
                <td>${data.feedback || 'N/A'}</td>
            `;

            appointmentTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading appointments:", error.message);
    }
};

// Firebase Auth State Check
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await loadPatientData(user);
        await loadSpecializations();
        await loadAppointmentHistory(user);
    } else {
        window.location.href = "form.html";
    }
});
// Logout
document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert("Logged out successfully.");
        window.location.href = "form.html";
    } catch (error) {
        console.error("Error during logout:", error.message);
        alert("Error during logout: " + error.message);
    }
});
// Show the default section (Dashboard or My Profile)
showSection('myProfile');


document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.sidebar a').forEach(item => item.classList.remove('active'));
        this.classList.add('active');
    });
});

document.getElementById('editProfileImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = function() {
        updatedProfile.profile_picture_base64 = reader.result;
    };
    if (file) reader.readAsDataURL(file);
});


document.getElementById('submitAppointment').addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("User not logged in.");
        return;
    }

    const selectedDate = new Date(document.getElementById('appointmentDate').value);
    if (selectedDate < new Date()) {
        alert("You cannot book an appointment in the past!");
        return;
    }

    const selectedSpecialization = specializationSelect.value;
    const selectedTherapistId = therapistSelect.value;
    const selectedTherapistName = therapistSelect.options[therapistSelect.selectedIndex].text;
    const selectedTime = document.getElementById('appointmentTime').value;

    if (!selectedSpecialization || !selectedTherapistId || !selectedTime) {
        alert("Please select all required fields!");
        return;
    }

    try {
        await addDoc(collection(db, "appointments"), {
            patient_id: user.uid,
            patient_name: fullNameElem.textContent, 
            therapist_id: selectedTherapistId,
            therapist_name: selectedTherapistName,
            specialization: selectedSpecialization,
            selected_date: selectedDate.toISOString(),
            selected_time: selectedTime,
            consultation_fee: "5000", // Change if dynamic
            status: "Pending",
            timestamp: serverTimestamp()
        });

        alert("Appointment booked successfully!");
        showSection('appointmentHistory');
    } catch (error) {
        console.error("Error booking appointment:", error.message);
        alert("Error booking appointment: " + error.message);
    }
});