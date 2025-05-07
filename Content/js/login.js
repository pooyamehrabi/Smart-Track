//Menu

$(function () {
    $("#menu").load("menu.html");
   
});

//Menu

//Login Form

    //  Toggle  Password Start

$(document).ready(function () {

    $("#togglePassword").removeClass("fa fa-eye").addClass("fa fa-eye-slash");
    $("#togglePassword").click(function() {
       const passwordInput = $("#password");
       const type = passwordInput.attr("type");

       if (type === "password") {
           passwordInput.attr("type", "text");
           $("#togglePassword").removeClass("fa fa-eye-slash").addClass("fa fa-eye");
       } else {
           passwordInput.attr("type", "password");
           $("#togglePassword").removeClass("fa fa-eye").addClass("fa fa-eye-slash");
       }
   });
   
 });
 
    //  Toggle  Password End

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const captchaInput = document.getElementById('captcha');
    const captchaImage = document.getElementById('captchaImage');
    const confirmationMessageElement = document.getElementById('confirmationMessage');

    async function loadCaptcha() {
        try {
            const captchaSvg = await getCaptcha();
            captchaImage.innerHTML = captchaSvg;
        } catch (error) {
            console.error('Error loading CAPTCHA:', error);
            captchaImage.innerHTML =
                '<p style="color: red;">Error loading CAPTCHA!</p>';
        }
    }

    captchaImage.addEventListener('click', loadCaptcha);
    loadCaptcha();

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        resetConfirmationMessage();
        resetFields();

        const data = {
            username: usernameInput.value.trim(),
            password: passwordInput.value.trim(),
            captcha: captchaInput.value.trim(),
        };

        let isValid = true;

        if (!data.username) {
            showFieldError(usernameInput, 'Username is required.');
            isValid = false;
        }
        if (!data.password) {
            showFieldError(passwordInput, 'Password is required.');
            isValid = false;
        }
        if (!data.captcha) {
            showFieldError(captchaInput, 'CAPTCHA is required.');
            isValid = false;
        }

        if (isValid) {
            try {
                const response = await login(data);
                
                const sessionData = await setUserRole(data.username);

                form.reset();

                if (sessionData.role === 'admin') {
                    window.location.replace('admin-panel.html');
                } else {
                    window.location.replace('index.html');
                }
            } catch (error) {
                console.error('Login failed:', error.message);
                if (error.message.includes('Invalid username or password')) {
                    showConfirmationMessage('Invalid username or password.', 'red');
                } else if (error.message.includes('Invalid CAPTCHA')) {
                    showFieldError(captchaInput, 'Invalid CAPTCHA. Try again.');
                }
                await loadCaptcha();
            }
        }
    });

    function resetFields() {
        const fields = form.querySelectorAll('input');
        fields.forEach((field) => {
            field.classList.remove('is-invalid');
            const errorElement = field.nextElementSibling;
            if (errorElement) errorElement.textContent = '';
        });
    }

    function resetConfirmationMessage() {
        confirmationMessageElement.style.display = 'none';
        confirmationMessageElement.textContent = '';
    }

    function showFieldError(field, errorMessage) {
        const errorElement = field.nextElementSibling;
        field.classList.add('is-invalid');
        if (errorElement) errorElement.textContent = errorMessage;
    }

    function showConfirmationMessage(message, color) {
        confirmationMessageElement.style.display = 'block';
        confirmationMessageElement.textContent = message;
        confirmationMessageElement.style.color = color;
    }
});

//Login Form

//Register Form

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    const confirmationMessageRegister = document.getElementById('confirmationMessageRegister');
    const overlay = document.getElementById('registerOverlay');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        let isValid = true;
        const fields = form.querySelectorAll('input, select');
        const data = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            companyName: document.getElementById('companyName').value.trim(),
            staffSize: document.getElementById('staffSize').value.trim(),
            email: document.getElementById('email').value.trim(),
            passwordRegister: document.getElementById('passwordRegister').value.trim(),
            mobileCode: document.getElementById('mobileCode').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
        };

        if (form.checkValidity() === false) {
            form.classList.add('was-validated');
            isValid = false;
        }

        fields.forEach((field) => {
            const errorMessage = validateField(field);
            showError(field, errorMessage);
            if (errorMessage) {
                isValid = false;
            }
        });

        if (isValid) {
            try {
                const response = await register(data);

                showSuccessMessage(response.message || 'Your registration was successful!');
                form.reset();
                form.classList.remove('was-validated');

                overlay.style.display = 'flex';

                setTimeout(() => {
                    clearSuccessMessage();
                    overlay.style.display = 'none';
                    window.location.replace('login.html');
                }, 5000);
            } catch (error) {
                if (error.field) {
                    showError(document.getElementById(error.field), error.error);
                } else {
                    alert(error.error || 'Unexpected error occurred');
                }
            }
        }
    });

    function showSuccessMessage(message) {
        confirmationMessageRegister.style.display = 'block';
        confirmationMessageRegister.textContent = message;
    }

    function clearSuccessMessage() {
        confirmationMessageRegister.style.display = 'none';
        confirmationMessageRegister.textContent = '';
    }

    function validateField(field) {
        const fieldID = field.id;
        const fieldName = field.placeholder;
        const fieldValue = field.value.trim();

        if (fieldID === 'staffSize' && !fieldValue) {
            return `Staff Size is required`;
        }

        if (fieldID === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
                return 'Please enter a valid email.';
            }
        }

        if (fieldID === 'mobileCode' && !fieldValue) {
            return `Mobile Code is required`;
        }

        if (fieldID === 'phoneNumber') {
            if (!isValidPhoneNumber(fieldValue)) {
                return 'Please enter a valid phone number.';
            }
        }

        if (!fieldValue) {
            return `${fieldName} is required`;
        }

        return null;
    }

    function isValidPhoneNumber(phoneNumber) {
        const digitsOnly = phoneNumber.replace(/\D/g, '');
        return digitsOnly.length >= 6 && digitsOnly.length <= 20;
    }

    function showError(field, errorMessage) {
        let errorElement = field.nextElementSibling;

        if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            field.parentElement.appendChild(errorElement);
        }

        if (errorMessage) {
            field.classList.add('is-invalid');
            errorElement.textContent = errorMessage;
        } else {
            field.classList.remove('is-invalid');
            errorElement.textContent = '';
        }
    }
});


//Register Form

//Display Form

document.addEventListener('DOMContentLoaded', function () {
    const signUpButton = document.querySelector('.signUp');
    const registerButton = document.querySelector('.register');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const forgotButton = document.querySelector('.fotgot');

    signUpButton.addEventListener('click', function () {
        loginForm.style.display = 'none'; 
        registerForm.style.display = 'flex';
    });

    registerButton.addEventListener('click', function () {
        registerForm.style.display = 'none'; 
        loginForm.style.display = 'flex';
    });

    forgotPasswordLink.addEventListener('click', function () {
        loginForm.style.display = 'none'; 
        forgotForm.style.display = 'flex';
    });

    forgotButton.addEventListener('click', function () {
        forgotForm.style.display = 'none'; 
        loginForm.style.display = 'flex';
    });
});


//Display Form

//Forgot Password

document.addEventListener('DOMContentLoaded', function () {
    const forgotForm = document.getElementById('forgotForm');
    const loginForm = document.getElementById('loginForm');
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const timeSpan = document.getElementById('time');
    const compareCodeInput = document.getElementById('compareCode');
    const newPasswordForgotInput = document.getElementById('newPasswordForgot');
    const confirmPasswordForgotInput = document.getElementById('confirmPasswordForgot');
    const emailForForgotInput = document.getElementById('emailForForgot');
    const confirmationMessage = document.querySelector('.login #forgotForm #confirmationMessage');
    const overlay = document.getElementById('forgotOverlay');

    let generatedCode;
    let timerInterval;
    let timeLeft;
    let emailSent = false;

    function startTimer(durationInMinutes) {
        timeLeft = durationInMinutes * 60;
        updateTimerDisplay();

        timerInterval = setInterval(function () {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                resetSendCodeButton();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        const formattedMinutes = String(minutes).padStart(1, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        timeSpan.textContent = `(${formattedMinutes}:${formattedSeconds} remaining)`;
    }

    function enableSendCodeButton() {
        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = 'Send Code';
        emailSent = false;
        timeSpan.textContent = '';
    }

    function disableSendCodeButton() {
        sendCodeBtn.disabled = true;
        sendCodeBtn.textContent = 'Resend Code';
        emailSent = true;
    }

    function resetSendCodeButton() {
        clearInterval(timerInterval);
        enableSendCodeButton();
    }

    function showFieldError(fieldId, errorMessage) {
        const field = document.getElementById(fieldId);
        const errorElement = field.nextElementSibling;
        field.classList.add('is-invalid');
        if (errorElement) errorElement.textContent = errorMessage;
    }

    function resetFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        field.classList.remove('is-invalid');
        const errorElement = field.nextElementSibling;
        if (errorElement) errorElement.textContent = '';
    }

    function showSuccessMessage(message) {
        confirmationMessage.style.display = 'block';
        confirmationMessage.textContent = message;
    }

    function clearSuccessMessage() {
        confirmationMessage.style.display = 'none';
        confirmationMessage.textContent = '';
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    sendCodeBtn.addEventListener('click', async function (event) {
        event.preventDefault();

        const email = emailForForgotInput.value.trim();

        if (!email) {
            showFieldError('emailForForgot', 'Email is required.');
            return;
        }

        if (!isValidEmail(email)) {
            showFieldError('emailForForgot', 'Please enter a valid email.');
            return;
        }

        if (emailSent) {
            return;
        }

        resetFieldError('emailForForgot');

        generatedCode = Math.floor(100000 + Math.random() * 900000);

        try {
            const response = await sendCodeToEmail({ email: email, code: generatedCode });

            if (response.success) {
                disableSendCodeButton();
                startTimer(5);
            } else {
                showFieldError('emailForForgot', response.message);
            }
        } catch (error) {
            showFieldError('emailForForgot', 'Error sending code. Please try again.');
        }
    });

    forgotForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        let isValid = true;

        const email = emailForForgotInput.value.trim();
        const compareCode = Number(compareCodeInput.value);
        const newPassword = newPasswordForgotInput.value.trim();
        const confirmPassword = confirmPasswordForgotInput.value.trim();

        resetFieldError('compareCode');
        resetFieldError('newPasswordForgot');
        resetFieldError('confirmPasswordForgot');

        if (!email) {
            showFieldError('emailForForgot', 'Email is required.');
            isValid = false;
        }

        if (!compareCode) {
            showFieldError('compareCode', 'Code is required.');
            isValid = false;
        }

        if (compareCode !== generatedCode) {
            showFieldError('compareCode', 'Code is incorrect.');
            isValid = false;
        }

        if (!newPassword) {
            showFieldError('newPasswordForgot', 'New Password is required.');
            isValid = false;
        }

        if (!confirmPassword) {
            showFieldError('confirmPasswordForgot', 'Confirm Password is required.');
            isValid = false;
        }

        if (newPassword !== confirmPassword) {
            showFieldError('confirmPasswordForgot', 'Passwords do not match.');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const data = {
                email: email,
                newPassword: newPassword
            };

            const response = await resetPassword(data);

            if (response.success) {
                showSuccessMessage('Password changed successfully.');

                overlay.style.display = 'flex'; // Show spinner

                setTimeout(() => {
                    clearSuccessMessage();
                    overlay.style.display = 'none'; // Hide spinner
                    forgotForm.style.display = 'none';
                    loginForm.style.display = 'flex';
                    forgotForm.reset();
                    resetSendCodeButton();
                }, 5000);
            } else {
                showSuccessMessage('Failed to reset password.');
            }
        } catch (error) {
            showSuccessMessage('Error resetting password. Please try again.');
        }
    });
});


//Forgot Password

//Footer

$(function () {
    $("#footer").load("footer.html");
});

//Footer