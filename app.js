
// Initialize Firebase App
const firebaseConfig = {
  apiKey: "AIzaSyBSNZkt8-iNirAqfDtBG7Cc8HoFyLDJ80o",
  authDomain: "vr-healer-cc2b7.firebaseapp.com",
  projectId: "vr-healer-cc2b7",
  storageBucket: "vr-healer-cc2b7.firebasestorage.app",
  messagingSenderId: "77804580240",
  appId: "1:77804580240:web:3b97e98cf590d50dff9715"
  };

  // Ensure the default app is initialized
firebase.initializeApp(firebaseConfig);
  // Access Firebase Database
// Admin credentials (fixed)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Test@12345";


  // Modal and Navbar Login Button
  const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("login-btn");
const closeBtn = document.querySelector(".close");
const adminLoginBtn = document.getElementById("admin-login-btn");
const loginChoices = document.getElementById("login-choices");
const adminLoginForm = document.getElementById("admin-login-form");
const therapistLoginForm = document.getElementById("signIn");
const backToHome = document.getElementById("back-to-home");
const therapistLoginBtn = document.getElementById("therapist-login-btn");
  const registerNowLink = document.getElementById("register-now");
  
  document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {  // Check if form exists
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
  
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
  
        if (!username || !password) {
          alert("Fill out all fields");
          return;
        }
  
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          alert("Login successful! Redirecting to Admin Dashboard...");
          window.location.href = "admin-dashboard.html";
        } else {
          alert("Invalid username or password. Please try again.");
          loginForm.reset();
        }
      });
    }
  });
  


 
// Show Modal on Login Click
if (loginBtn) {
  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.style.display = "block";
  });
}

// Close Modal on X Click
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    loginModal.style.display = "none";
  });
}

// Show Admin Login Form
if (adminLoginBtn) {
  adminLoginBtn.addEventListener("click", () => {
    loginChoices.style.display = "none";
    adminLoginForm.style.display = "block";
  });
}

// Go Back to Login Options
if (backToHome) {
  backToHome.addEventListener("click", (e) => {
    e.preventDefault();
    adminLoginForm.style.display = "none";
    loginChoices.style.display = "block";
  });
}


// // Handle admin login form submission
// document.addEventListener("DOMContentLoaded", () => {
//   const loginForm = document.getElementById("loginForm");

//   loginForm.addEventListener("submit", (event) => {
//     event.preventDefault();

//     const username = document.getElementById("username").value;
//     const password = document.getElementById("password").value;
    
//     // Check hardcoded admin credentials
//     if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
//       alert("Login successful! Redirecting to Admin Dashboard...");
//       window.location.href = "admin-dashboard.html";  // Redirect to admin dashboard
//     } else {
//       alert("Invalid username or password. Please try again.");
//       loginForm.reset();
//     }
//   });
// });





  // reference your database
  var contactFormDB = firebase.database().ref("contactForm");
  
  document.getElementById("contactForm").addEventListener("submit", submitForm);
  
  function submitForm(e) {
    e.preventDefault();
  
    var name = getElementVal("name");
    var emailid = getElementVal("emailid");
    var msgContent = getElementVal("msgContent");
  
    saveMessages(name, emailid, msgContent);
  
    //   enable alert
    document.querySelector(".alert").style.display = "block";
  
    //   remove the alert
    setTimeout(() => {
      document.querySelector(".alert").style.display = "none";
    }, 3000);
  
    //   reset the form
    document.getElementById("contactForm").reset();
  }
  
  const saveMessages = (name, emailid, msgContent) => {
    var newContactForm = contactFormDB.push();
  
    newContactForm.set({
      name: name,
      emailid: emailid,
      msgContent: msgContent,
    });
  };
  
  const getElementVal = (id) => {
    return document.getElementById(id).value;
  };





const galleryData = {
  all: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
  claustrophobia: ['img4.jpg'],
  nyctophobia: ['img5.jpg'],
  hydrophobia: ['img6.jpg']
};

function filterGallery(category) {
  const galleryContainer = document.getElementById('gallery-container');
  galleryContainer.innerHTML = '';
  const images = galleryData[category] || galleryData['all'];
  images.forEach(img => {
      const imgElem = document.createElement('img');
      imgElem.src = img;
      galleryContainer.appendChild(imgElem);
  });
}

function openLoginForm(role) {
  document.getElementById('loginTitle').innerText = `${role} Login`;
  document.getElementById('loginForm').classList.remove('hidden');
}

function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
      .then(user => alert('Login successful'))
      .catch(error => alert(error.message));
}




const db = firebase.database();

// Load Therapists
function loadTDoctors() {
    const dataList = document.getElementById('dataList');
    dataList.innerHTML = "";
    db.ref('users/doctors').once('value', snapshot => {
        let count = 0;
        snapshot.forEach(child => {
            count++;
            const data = child.val();
            const row = `<tr>
                <td>${count}</td>
                <td>${data.name}</td>
                <td>${data.email}</td>
                <td>Therapist</td>
                <td>${data.date}</td>
            </tr>`;
            dataList.innerHTML += row;
        });
        document.getElementById('doctorCount').innerText = count;
        document.getElementById('manageTitle').innerText = "Doctors";
    });
}

// Load Patients
function loadPatients() {
    const dataList = document.getElementById('dataList');
    dataList.innerHTML = "";
    db.ref('users/patients').once('value', snapshot => {
        let count = 0;
        snapshot.forEach(child => {
            count++;
            const data = child.val();
            const row = `<tr>
                <td>${count}</td>
                <td>${data.name}</td>
                <td>${data.email}</td>
                <td>Patient</td>
                <td>${data.date}</td>
            </tr>`;
            dataList.innerHTML += row;
        });
        document.getElementById('patientCount').innerText = count;
        document.getElementById('manageTitle').innerText = "Patients";
    });
}

// User Registration
function registerUser(name, email, role) {
    const userData = {
        name,
        email,
        date: new Date().toLocaleString()
    };
    db.ref(`users/${role}`).push(userData);
}


// // Load Therapists
// function loadTDoctors() {
//     const dataList = document.getElementById('dataList');
//     dataList.innerHTML = "";
//     db.ref('users/doctors').once('value', snapshot => {
//         let count = 0;
//         snapshot.forEach(child => {
//             count++;
//             const data = child.val();
//             const row = `<tr>
//                 <td>${count}</td>
//                 <td>${data.name}</td>
//                 <td>${data.email}</td>
//                 <td>Therapist</td>
//                 <td>${data.date}</td>
//             </tr>`;
//             dataList.innerHTML += row;
//         });
//         document.getElementById('doctorCount').innerText = count;
//         document.getElementById('manageTitle').innerText = "Doctors";
//     });
// }

// // Load Patients
// function loadPatients() {
//     const dataList = document.getElementById('dataList');
//     dataList.innerHTML = "";
//     db.ref('users/patients').once('value', snapshot => {
//         let count = 0;
//         snapshot.forEach(child => {
//             count++;
//             const data = child.val();
//             const row = `<tr>
//                 <td>${count}</td>
//                 <td>${data.name}</td>
//                 <td>${data.email}</td>
//                 <td>Patient</td>
//                 <td>${data.date}</td>
//             </tr>`;
//             dataList.innerHTML += row;
//         });
//         document.getElementById('patientCount').innerText = count;
//         document.getElementById('manageTitle').innerText = "Patients";
//     });
// }

// // User Registration
// function registerUser(name, email, role) {
//     const userData = {
//         name,
//         email,
//         date: new Date().toLocaleString()
//     };
//     db.ref(`users/${role}`).push(userData);
// }






// /* ///////////Admin Dashboard ////////////// */
// // Firebase Configuration

// const app = firebase.initializeApp(firebaseConfig);
// const db = firebase.database();

// let currentDataType = 'therapists'; // Track which data type we are managing

// // Function to show dashboard
// function showDashboard() {
//   document.getElementById("dashboard").classList.remove('hidden');
//   document.getElementById("management").classList.add('hidden');
//   loadDashboardStats();
// }

// // Function to load therapist data
// function loadTherapists() {
//   currentDataType = 'therapists';
//   document.getElementById("dashboard").classList.add('hidden');
//   document.getElementById("management").classList.remove('hidden');
//   document.getElementById('manageTitle').textContent = 'Therapists';
//   loadData();
// }

// // Function to load patient data
// function loadPatients() {
//   currentDataType = 'patients';
//   document.getElementById("dashboard").classList.add('hidden');
//   document.getElementById("management").classList.remove('hidden');
//   document.getElementById('manageTitle').textContent = 'Patients';
//   loadData();
// }

// // Function to load data (Therapists/Patients)
// function loadData() {
//   const ref = db.ref(currentDataType);
//   ref.on('value', function(snapshot) {
//     const dataList = snapshot.val();
//     let html = '';
//     let count = 0;
//     for (let id in dataList) {
//       count++;
//       const data = dataList[id];
//       html += `<tr>
//                   <td>${count}</td>
//                   <td><a href="#" onclick="viewDetails('${id}')">${data.name}</a></td>
//                   <td>${data.email}</td>
//                   <td>${data.role}</td>
//                   <td>${data.regDate}</td>
//                   <td><button onclick="removeData('${id}')">Remove</button></td>
//                 </tr>`;
//     }
//     document.getElementById("dataList").innerHTML = html;
//     if (currentDataType === 'therapists') {
//       document.getElementById("doctorCount").textContent = count;
//     } else {
//       document.getElementById("patientCount").textContent = count;
//     }
//   });
// }

// // Function to search data
// function searchData() {
//   const searchInput = document.getElementById('searchInput').value.toLowerCase();
//   const rows = document.getElementById('dataList').getElementsByTagName('tr');
//   for (let row of rows) {
//     const name = row.getElementsByTagName('td')[1].textContent.toLowerCase();
//     if (name.indexOf(searchInput) === -1) {
//       row.style.display = 'none';
//     } else {
//       row.style.display = '';
//     }
//   }
// }

// // Function to view details of therapist/patient
// function viewDetails(id) {
//   const ref = db.ref(currentDataType + '/' + id);
//   ref.once('value').then(function(snapshot) {
//     const data = snapshot.val();
//     alert(JSON.stringify(data, null, 2)); // Display details in a formatted manner
//   });
// }

// // Function to remove therapist/patient
// function removeData(id) {
//   const ref = db.ref(currentDataType + '/' + id);
//   ref.remove()
//     .then(() => {
//       alert('Data removed successfully');
//       loadData(); // Refresh data list
//     })
//     .catch(error => alert('Error removing data: ' + error));
// }

// // Function to load dashboard stats
// function loadDashboardStats() {
//   loadTherapists();
//   loadPatients();
// }

// // Logout function
// function logout() {
//   firebase.auth().signOut().then(() => {
//     window.location = "form.html"; // Redirect to login page
//   }).catch((error) => {
//     console.log(error);
//   });
// }

// window.onload = showDashboard; // Initialize on load