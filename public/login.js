function login() {
    const email = document.querySelector("[name = emailInput]").value;
    console.log("Email: ", email);
    const password = document.querySelector("[name = passwordInput]").value;
    console.log("Password: ", password);
    const loginUser = {
        email,
        password
    };

    console.log(JSON.stringify(loginUser));

    fetch('/login', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(loginUser)
    })
    .then(response => {
        if (response.ok) {
            console.log("User login successful!");
            window.location.href = "/main";
        } else {
            console.error("Error logging in user!");
        }
    })
    .catch(error => {
        console.error(error);
    });
}

function setupButton() {
    window.addEventListener("DOMContentLoaded", (event) => {
        const submitButton = document.getElementById("login-submit-button");
        if (submitButton) {
            submitButton.addEventListener("click", login);
        }
    });
}

setupButton();