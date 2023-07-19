function signup() {
    const email = document.querySelector("[name = emailInput]").value;
    console.log("Email: ", email);
    const passwordInitial = document.querySelector("[name = passwordInput]").value;
    console.log("Initial: ", passwordInitial);
    const passwordConfirm = document.querySelector("[name = passwordConfirmInput]").value;
    console.log("Confirm: ", passwordConfirm);
    const newUser = {
        email,
        passwordConfirm
    };

    console.log(JSON.stringify(newUser));

    fetch('/signup', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(newUser)
    })
    .then(response => {
        if (response.ok) {
            console.log("User created successfully!");
            window.location.href = "/main";
        } else {
            console.error("Error saving user!");
        }
    })
    .catch(error => {
        console.error(error);
    });
}

function setupButton() {
    window.addEventListener("DOMContentLoaded", (event) => {
        const submitButton = document.getElementById("submit-button");
        if (submitButton) {
            submitButton.addEventListener("click", signup);
        }
    });
}

setupButton();