function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const message = document.getElementById("registerMessage");

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.style.color = "red";
        return;
    }

    let users = JSON.parse(localStorage.getItem("tms_users")) || [];

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        message.textContent = "Email already registered.";
        message.style.color = "red";
        return;
    }

    const newUser = {
        name: name,
        email: email,
        password: password
    };

    users.push(newUser);

    localStorage.setItem("tms_users", JSON.stringify(users));

    message.textContent = "Registration successful!";
    message.style.color = "green";

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
}


function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const message = document.getElementById("loginMessage");

    let users = JSON.parse(localStorage.getItem("tms_users")) || [];

    const user = users.find(
        user => user.email === email && user.password === password
    );

    if (user) {

        localStorage.setItem("tms_currentUser", JSON.stringify(user));

        message.textContent = "Login successful!";
        message.style.color = "green";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 700);

    } else {

        message.textContent = "Invalid email or password.";
        message.style.color = "red";
    }
}


function logoutUser() {

    localStorage.removeItem("tms_currentUser");

    window.location.href = "login.html";
}