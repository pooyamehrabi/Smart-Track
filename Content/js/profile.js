//Menu

$(function () {
    $("#menu").load("menu.html");
});

//Menu

//User Info Form

document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('username'); 
    let userID = null;

    const confirmationMessage = document.getElementById('confirmationMessage');
    const overlay = document.getElementById('Overlay');
    const form = document.getElementById('profileForm');

    if (!overlay || !confirmationMessage || !form) {
        console.error("Required elements (overlay, confirmationMessage, form) are missing from the DOM.");
        return;
    }

    showOverlay();

    if (username) {
        try {
            const data = await getUserProfile(username);

            setTimeout(() => {
                userID = data.userID || '';
                document.getElementById('firstName').value = data.firstName || '';
                document.getElementById('lastName').value = data.lastName || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('companyName').value = data.companyName || '';
                document.getElementById('staffSize').value = data.staffSize || '';
                document.getElementById('mobileCode').value = data.mobileCode || '';
                document.getElementById('phoneNumber').value = data.phoneNumber || '';

                hideOverlay();
            }, 200); 
        } catch (error) {
            console.error("Error loading user profile:", error);
            showConfirmationMessage('Unable to load user profile. Please try again later.', 'error');
            hideOverlay(); 
        }
    } else {
        console.error("Username not found in localStorage. Redirecting to login page.");
        window.location.href = 'login.html';
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        let isValid = true;
        const fields = form.querySelectorAll('input, select');

        const updatedData = {
            userID,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            companyName: document.getElementById('companyName').value,
            staffSize: document.getElementById('staffSize').value,
            mobileCode: document.getElementById('mobileCode').value,
            phoneNumber: document.getElementById('phoneNumber').value
        };

        if (form.checkValidity() === false) {
            form.classList.add('was-validated');
            isValid = false;
        }

        fields.forEach(field => {
            const errorMessage = validateField(field);
            showError(field, errorMessage);
            if (errorMessage) {
                isValid = false;
            }
        });

        if (!isValid) {
            console.warn("Form validation failed.");
            return;
        }

        showOverlay(); 

        try {
            const response = await updateUserProfile(updatedData);

            if (response && response.message) {
                if (response.message.toLowerCase() === 'profile updated successfully') {
                    showConfirmationMessage('Profile updated successfully.', 'success');

                    setTimeout(async () => {
                        await reloadUserProfile(username);
                        hideOverlay(); 
                    }, 200); 
                } else {
                    showConfirmationMessage(response.message, 'error');
                    hideOverlay(); 
                }
            } else {
                throw new Error('Invalid server response.');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            showConfirmationMessage('Error updating profile. Please try again.', 'error');
            hideOverlay(); 
        }
    });

    function validateField(field) {
        const fieldID = field.id;
        const fieldname = field.getAttribute('aria-label');
        const fieldValue = field.value;

        if (fieldID === 'staffSize' && !fieldValue) {
            return 'Staff Size is required';
        }

        if (fieldID === 'mobileCode' && !fieldValue) {
            return 'Mobile Code is required';
        }

        if (fieldID === 'phoneNumber' && !isValidPhoneNumber(fieldValue)) {
            return 'Please enter a valid phone number.';
        }

        if (!fieldValue) {
            return `${fieldname} is required`;
        }

        return null;
    }

    function isValidPhoneNumber(phoneNumber) {
        const digitsOnly = phoneNumber.replace(/\D/g, '');
        return digitsOnly.length <= 20;
    }

    function showError(field, errorMessage) {
        const errorElement = field.nextElementSibling;

        if (errorMessage) {
            field.classList.add('is-invalid');
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
        } else {
            field.classList.remove('is-invalid');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }
    }

    function showOverlay() {
        overlay.style.display = 'flex';
    }

    function hideOverlay() {
        overlay.style.display = 'none';
    }

    function showConfirmationMessage(message, type) {
        confirmationMessage.style.display = 'block';
        confirmationMessage.textContent = message;

        confirmationMessage.className = ''; 
        if (type === 'success') {
            confirmationMessage.classList.add('alert', 'alert-success');
        } else if (type === 'error') {
            confirmationMessage.classList.add('alert', 'alert-danger');
        }

        setTimeout(() => {
            confirmationMessage.style.display = 'none';
        }, 5000);
    }

    async function reloadUserProfile(username) {
        try {
            const data = await getUserProfile(username);

            setTimeout(() => {
                userID = data.userID;

                document.getElementById('firstName').value = data.firstName || '';
                document.getElementById('lastName').value = data.lastName || '';
                document.getElementById('companyName').value = data.companyName || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('staffSize').value = data.staffSize || '';
                document.getElementById('mobileCode').value = data.mobileCode || '';
                document.getElementById('phoneNumber').value = data.phoneNumber || '';

            }, 200);
        } catch (error) {
            console.error("Error reloading user profile:", error);
            showConfirmationMessage('Unable to reload user profile. Please try again later.', 'error');
        }
    }
});

//User Info Form

//Footer

$(function () {
    $("#footer").load("footer.html");
});

//Footer
