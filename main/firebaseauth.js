import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBSNZkt8-iNirAqfDtBG7Cc8HoFyLDJ80o",
    authDomain: "vr-healer-cc2b7.firebaseapp.com",
    projectId: "vr-healer-cc2b7",
    storageBucket: "vr-healer-cc2b7.appspot.com",
    messagingSenderId: "77804580240",
    appId: "1:77804580240:web:3b97e98cf590d50dff9715"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

document.addEventListener('DOMContentLoaded', () => {
    const signUp = document.getElementById('submitSignUp');
    const roleSelect = document.getElementById('role');

    // Role dropdown logic
    roleSelect.addEventListener('change', () => {
        const therapistFields = document.getElementById('therapistFields');
        const patientFields = document.getElementById('patientFields');

        if (roleSelect.value === 'Therapist') {
            therapistFields.style.display = 'block';
            patientFields.style.display = 'none';
            document.getElementById('cvUpload').setAttribute('required', 'true');
            document.getElementById('therapistProfilePicture').setAttribute('required', 'true');
            document.getElementById('patientProfilePicture').removeAttribute('required');
        } else if (roleSelect.value === 'Patient') {
            patientFields.style.display = 'block';
            therapistFields.style.display = 'none';
            document.getElementById('patientProfilePicture').setAttribute('required', 'true');
            document.getElementById('cvUpload').removeAttribute('required');
            document.getElementById('therapistProfilePicture').removeAttribute('required');
        } else {
            therapistFields.style.display = 'none';
            patientFields.style.display = 'none';
            document.getElementById('cvUpload').removeAttribute('required');
            document.getElementById('patientProfilePicture').removeAttribute('required');
            document.getElementById('therapistProfilePicture').removeAttribute('required');
        }
    });

    // Sign-up logic
    signUp.addEventListener('click', async (event) => {
        event.preventDefault();        
        const role = roleSelect.value;
        let isValid = true;
        if (role === 'Therapist') {
            const cvFile = document.getElementById('cvUpload').files[0];
            const profilePic = document.getElementById('therapistProfilePicture').files[0];
            if (!cvFile) {
                alert("Please upload your CV.");
                isValid = false;
            }
            if (!profilePic) {
                alert("Please upload a profile picture.");
                isValid = false;
            }
        } else if (role === 'Patient') {
            const profilePic = document.getElementById('patientProfilePicture').files[0];
            if (!profilePic) {
                alert("Please upload your profile picture.");
                isValid = false;
            }
        }
        if (!isValid) return;
        const email = document.getElementById('rEmail').value;
        const password = document.getElementById('rPassword').value;
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address')?.value;
        const gender = document.getElementById('gender').value; // Get selected gender
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods.length > 0) {
                alert("This email is already registered. Please use a different email.");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const collection = role === 'Therapist' ? 'therapists' : 'patients';
            
            const userData = {
                email,
                name,
                phone,
                role,
                gender, // Add gender to the userData object
                address,
                created_at: new Date().toISOString(),
                uid: user.uid,
            };

            const uploadFileAsBase64 = (file) => {
                return new Promise((resolve, reject) => {
                    if (!file) resolve(null);
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });
            };

            if (role === 'Therapist') {
                userData.cv_base64 = await uploadFileAsBase64(document.getElementById('cvUpload').files[0]);
                userData.profile_picture_base64 = await uploadFileAsBase64(document.getElementById('therapistProfilePicture').files[0]);
                userData.consultation_fee = document.getElementById('consultationFee').value;
                userData.education = document.getElementById('education').value;
                userData.specialization = document.getElementById('specialization').value;
            } else {
                userData.profile_picture_base64 = await uploadFileAsBase64(document.getElementById('patientProfilePicture').files[0]);
            }


            await setDoc(doc(db, collection, user.uid), userData);
            window.location.href = role === 'Therapist' ? 'therapist_dashboard.html' : 'patient_dashboard.html';
        } catch (error) {
            console.error("Error signing up:", error.message);
            alert("Error: " + error.message);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const signInButton = document.getElementById('submitSignIn');
    signInButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            // Authenticate the user
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Fetch the user's role from Firestore
            const therapistDoc = await getDoc(doc(db, 'therapists', user.uid));
            const patientDoc = await getDoc(doc(db, 'patients', user.uid));
            if (therapistDoc.exists()) {
                // Redirect to therapist dashboard
                window.location.href = 'therapist_dashboard.html';
            } else if (patientDoc.exists()) {
                // Redirect to patient dashboard
                window.location.href = 'patient_dashboard.html';
            } else {
                throw new Error("User role not found. Please contact support.");
            }
        } catch (error) {
            console.error("Login error:", error.message);
            // Display error message
            alert(error.message.includes("auth/wrong-password") || error.message.includes("auth/user-not-found")
                ? "Incorrect email or password. Please try again."
                : "Error: " + error.message);
        }
    });
});