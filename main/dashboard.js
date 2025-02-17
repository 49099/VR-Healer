import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc,addDoc, setDoc, updateDoc, deleteDoc,arrayUnion, arrayRemove,  collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBSNZkt8-iNirAqfDtBG7Cc8HoFyLDJ80o",
    authDomain: "vr-healer-cc2b7.firebaseapp.com",
    projectId: "vr-healer-cc2b7",
    storageBucket: "vr-healer-cc2b7.appspot.com",
    messagingSenderId: "77804580240",
    appId: "1:77804580240:web:3b97e98cf590d50dff9715"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
// Function to Show Sections
function showSection(sectionId) {
    const sections = document.querySelectorAll("section");
    sections.forEach(sec => sec.style.display = "none");
    
    if (sectionId) {
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.style.display = "block";
        } else {
            console.error(`❌ Error: Section '${sectionId}' not found!`);
        }
    }
}

document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        showSection(targetId);
    });
});
showSection("profile");

// Logout Button Fix
document.getElementById("logoutBtn").addEventListener("click", async (event) => {
    event.preventDefault();
    try {
        await signOut(auth);
        window.location.href = 'form.html';
    } catch (error) {
        console.error("❌ Error signing out:", error);
    }
});

// Initially show profile section
showSection("profile");
// Load Therapist Profile
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const therapistRef = doc(db, "therapists", user.uid);
        const therapistSnap = await getDoc(therapistRef);        
        if (therapistSnap.exists()) {
            const therapistData = therapistSnap.data();
            document.getElementById("therapistName").innerText = therapistData.name;
            document.getElementById("therapistEmail").innerText = therapistData.email;
            document.getElementById("therapistPhone").innerText = therapistData.phone;
            document.getElementById("therapistGender").innerText = therapistData.gender;
            document.getElementById("therapistSpecialization").innerText = therapistData.specialization;
            document.getElementById("therapistEducation").innerText = therapistData.education;
            document.getElementById("therapistAddress").innerText = therapistData.address;
            if (therapistData.cv_base64) {
                document.getElementById("therapistCV").href = therapistData.cv_base64;
                document.getElementById("therapistCV").innerText = "Download CV";
            }
            document.getElementById("profilePic").src = therapistData.profile_picture_base64 || "default-user.png";
        }
    } else {
        window.location.href = "form.html";
    }
});


// Sidebar Link Click for "Set Availability"
document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        
        // Show the section
        showSection(targetId);

        // Fetch availability data when clicking the "Set Availability" section
        if (targetId === "availability") {
            fetchAvailability(); // Fetch the current availability whenever this section is clicked
        }
    });
});

// Declare the fetchAvailability function first
const fetchAvailability = async () => {
    const user = auth.currentUser;
    if (user) {
        try {
            const availabilityList = document.getElementById("availabilityTable").getElementsByTagName("tbody")[0];
            availabilityList.innerHTML = '';  // Clear current table rows
            // Fetch all documents from the "availability" subcollection
            const querySnapshot = await getDocs(collection(db, "therapists", user.uid, "availability"));
            if (querySnapshot.empty) {
                // If no availability slots exist
                const row = document.createElement("tr");
                const emptyCell = document.createElement("td");
                emptyCell.colSpan = 3;
                emptyCell.textContent = "No available slots set.";
                row.appendChild(emptyCell);
                availabilityList.appendChild(row);
            } else {
                // Iterate over each document and display the availability data
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const row = document.createElement("tr");
                    // Days cell
                    const daysCell = document.createElement("td");
                    daysCell.textContent = data.days.join(", ");
                    row.appendChild(daysCell);
                    // Time cell
                    const timeCell = document.createElement("td");
                    timeCell.textContent = `${data.startTime} - ${data.endTime}`;
                    row.appendChild(timeCell);
                    // Action (Delete) cell
                    const deleteCell = document.createElement("td");
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.classList.add("delete-availability");
                    deleteButton.setAttribute("data-id", doc.id);  // Use the document ID for deletion
                    deleteCell.appendChild(deleteButton);
                    row.appendChild(deleteCell);

                    availabilityList.appendChild(row);
                });
            }
        } catch (error) {
            console.error("Error fetching availability:", error);
            alert("Error fetching availability.");
        }
    }
};

// Call fetchAvailability on page load
window.addEventListener('DOMContentLoaded', (event) => {
    fetchAvailability();
});


// Save Availability function (already in your code)

const saveAvailability = document.getElementById("saveAvailability");
saveAvailability.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        const selectedDays = Array.from(document.getElementById("availabilityDays").selectedOptions).map(option => option.value);
        const startTime = document.getElementById("availabilityStartTime").value;
        const endTime = document.getElementById("availabilityEndTime").value;

        if (selectedDays.length > 0 && startTime && endTime) {
            try {
                const availabilityData = {
                    days: selectedDays,
                    startTime: startTime,
                    endTime: endTime,
                    timestamp: new Date()
                };

                // Add new availability document
                await addDoc(collection(db, "therapists", user.uid, "availability"), availabilityData);

                alert("Availability saved!");
                
                // Fetch the updated availability after saving
                fetchAvailability();

            } catch (error) {
                console.error("Error saving availability:", error);
                alert("Error saving availability.");
            }
        } else {
            alert("Please fill all fields.");
        }
    }
});


// Delete slot logic (already in your code)
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-availability")) {
        const availabilityId = event.target.getAttribute("data-id");
        const user = auth.currentUser;
        if (availabilityId && user) {
            try {
                // Delete the document from the "availability" subcollection
                const slotDocRef = doc(db, "therapists", user.uid, "availability", availabilityId);
                await deleteDoc(slotDocRef);

                alert("Availability deleted!");
                fetchAvailability();  // Refresh the table after deletion
            } catch (error) {
                console.error("Error deleting availability:", error);
                alert("Error deleting availability.");
            }
        }
    }
});



// Fetch availability when the page loads
document.addEventListener("DOMContentLoaded", fetchAvailability);

// // Set Availability
// const saveAvailability = document.getElementById("saveAvailability");
// saveAvailability.addEventListener("click", async () => {
//     const user = auth.currentUser;
//     if (user) {
//         const selectedDays = Array.from(document.getElementById("availabilityDays").selectedOptions).map(option => option.value);
//         const startTime = document.getElementById("availabilityStartTime").value;
//         const endTime = document.getElementById("availabilityEndTime").value;

//         if (selectedDays.length > 0 && startTime && endTime) {
//             const availabilityData = {
//                 days: selectedDays,
//                 startTime: startTime,
//                 endTime: endTime,
//                 timestamp: new Date()
//             };
//             await setDoc(doc(db, "therapists", user.uid, "availability", "schedule"), availabilityData);
//             alert("Availability saved!");
//             fetchAvailability(); 
//         } else {
//             alert("Please fill all fields.");
//         }
//     }
// });

// Fetch Appointments and Display in Table
const fetchAppointments = async () => {
    const user = auth.currentUser;
    if (user) {
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("therapist_id", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const tableBody = document.getElementById("appointmentsTableBody");
        tableBody.innerHTML = ""; // Clear previous data

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Fetched Data:", data);  // ✅ Debugging Line

            const patientName = data.patient_name || "Unknown";
            const specialization = data.specialization || "N/A";
            const consultantFee = data.consultation_fee || "N/A"; // Corrected Field Name
            const appointmentDate = data.selected_date || "N/A";
            const appointmentTime = data.selected_time || "N/A";
            const createdAt = data.timestamp ? new Date(data.timestamp).toLocaleString() : "N/A"; // Corrected Timestamp Handling
            const status = data.status || "Pending";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${patientName}</td>
                <td>${specialization}</td>
                <td>${consultantFee}</td>
                <td>${appointmentDate}</td>
                <td>${appointmentTime}</td>
                <td>${createdAt}</td>
                <td>${status}</td>
                <td>
                    <button class="acceptBtn" data-id="${doc.id}">Accept</button>
                    <button class="rejectBtn" data-id="${doc.id}">Reject</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Add Event Listeners for Accept/Reject Buttons
        document.querySelectorAll(".acceptBtn").forEach(button => {
            button.addEventListener("click", () => updateAppointmentStatus(button.dataset.id, "Accepted"));
        });

        document.querySelectorAll(".rejectBtn").forEach(button => {
            button.addEventListener("click", () => updateAppointmentStatus(button.dataset.id, "Rejected"));
        });
    }
};

// Function to Update Appointment Status
const updateAppointmentStatus = async (appointmentId, newStatus) => {
    const user = auth.currentUser;
    if (user) {
        await updateDoc(doc(db, "appointments", appointmentId), {
            status: newStatus
        });
        alert(`Appointment ${newStatus}!`);
        fetchAppointments(); // Refresh list
    }
};

// Fetch Appointments on Page Load
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAppointments();
    }
});

// Accept/Reject Appointment
const appointmentsList = document.getElementById("appointmentsList");
appointmentsList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("accept") || event.target.classList.contains("reject")) {
        const appointmentId = event.target.getAttribute("data-id");
        const newStatus = event.target.classList.contains("accept") ? "Accepted" : "Rejected";
        await updateDoc(doc(db, "appointments", appointmentId), { status: newStatus });
        alert(`Appointment ${newStatus}!`);
        fetchAppointments();
    }
});


const populatePatientDropdown = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const appointmentsRef = collection(db, "appointments");

    // ✅ Filter only accepted appointments
    const q = query(appointmentsRef, 
        where("therapist_id", "==", user.uid), 
        where("status", "==", "Accepted")
    );

    const querySnapshot = await getDocs(q);

    let acceptedPatients = [];
    querySnapshot.forEach((doc) => {
        acceptedPatients.push({ id: doc.id, ...doc.data() });
    });

    console.log("Accepted Patients:", acceptedPatients);
    
    // Call function to update dropdown
    updatePatientDropdown(acceptedPatients);
};

const updatePatientDropdown = (patients) => {
    const dropdown = document.getElementById("patientList");
    dropdown.innerHTML = `<option value="">Select a Patient</option>`; 

    patients.forEach((patient) => {
        const option = document.createElement("option");
        option.value = patient.id; // Store appointment ID
        option.textContent = patient.patient_name || "Unknown";
        dropdown.appendChild(option);
    });
};

// Load accepted patients in dropdown
populatePatientDropdown();



// Function to populate patient list with only "Accepted" appointment status
async function populatePatientList() {
    const patientList = document.getElementById("patientList");
    patientList.innerHTML = '<option value="">Select Patient</option>'; // Default option

    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, where("status", "==", "Accepted"));

    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const option = document.createElement("option");
            option.value = doc.id; // Use appointment ID
            option.textContent = `${data.patient_name} - ${data.specialization}`;
            patientList.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching patients:", error);
    }
}

// Save progress function
document.getElementById("saveProgress").addEventListener("click", async () => {
    const patientId = document.getElementById("patientList").value;
    const sessionNumber = document.getElementById("sessionNumber").value;
    const sessionProgress = document.getElementById("sessionProgress").value;

    if (!patientId || !sessionNumber || !sessionProgress) {
        alert("Please fill all fields!");
        return;
    }

    const appointmentRef = doc(db, "appointments", patientId);

    try {
        await updateDoc(appointmentRef, {
            progress_notes: arrayUnion({
                session: parseInt(sessionNumber),
                note: sessionProgress,
                timestamp: new Date().toISOString()
            })
        });

        alert("Progress saved successfully!");
        document.getElementById("sessionNumber").value = "";
        document.getElementById("sessionProgress").value = "";
    } catch (error) {
        console.error("Error saving progress:", error);
    }
});

// Load patients on page load
// document.addEventListener("DOMContentLoaded", populatePatientList);
// const saveAvailability = document.getElementById("saveAvailability");

// saveAvailability.addEventListener("click", async () => {
//     const user = auth.currentUser;
//     if (user) {
//         const selectedDays = Array.from(document.getElementById("availabilityDays").selectedOptions).map(option => option.value);
//         const startTime = document.getElementById("availabilityStartTime").value;
//         const endTime = document.getElementById("availabilityEndTime").value;

//         if (selectedDays.length > 0 && startTime && endTime) {
//             const availabilityData = {
//                 days: selectedDays,
//                 startTime: startTime,
//                 endTime: endTime,
//                 timestamp: new Date() // Track when the slot was added
//             };

//             try {
//                 // Get the existing "schedule" document
//                 const scheduleDocRef = doc(db, "therapists", user.uid, "availability", "schedule");

//                 // Update the availability array in the "schedule" document
//                 await updateDoc(scheduleDocRef, {
//                     slots: arrayUnion(availabilityData) // Add the new availability to the "slots" array
//                 });

//                 alert("Availability saved!");
//                 fetchAvailability();  // Refresh the table to show updated availability
//             } catch (error) {
//                 console.error("Error saving availability:", error);
//                 alert("Error saving availability.");
//             }
//         } else {
//             alert("Please fill all fields.");
//         }
//     }
// });
