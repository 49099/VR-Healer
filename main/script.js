// Get references to the buttons and forms
const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const signInForm = document.getElementById('signIn');
const signUpForm = document.getElementById('signup');

// Event listener to show the registration form when "Create an account" is clicked
signUpButton.addEventListener('click', function () {
    signInForm.style.display = "none"; // Hide the login form
    signUpForm.style.display = "block"; // Show the registration form
});

// Event listener to show the login form when "Login" is clicked
signInButton.addEventListener('click', function () {
    signInForm.style.display = "block"; // Show the login form
    signUpForm.style.display = "none"; // Hide the registration form
});

// Role dropdown logic to show/hide Therapist and Patient fields
const roleSelect = document.getElementById('role');
roleSelect.addEventListener('change', () => {
    document.getElementById('therapistFields').style.display = roleSelect.value === 'Therapist' ? 'block' : 'none';
    document.getElementById('patientFields').style.display = roleSelect.value === 'Patient' ? 'block' : 'none';
});



const errorDiv = document.getElementById('loginErrorMessage');
errorDiv.style.display = 'block';
errorDiv.innerText = "Your error message here";


// Mobile Menu Toggle
const mobileMenu = document.getElementById("mobile-menu");
const navLinks = document.getElementById("menu");

mobileMenu.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// Close menu when clicking a link (for mobile)
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });
});


function goHome() {
    window.location.href = "/index.html"; // Change this to your home page URL
}
