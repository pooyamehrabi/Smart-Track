//Menu

$(function () {
    $("#menu").load("menu.html");
});

//Menu

//Change Password Form

document.addEventListener('DOMContentLoaded', function () {
    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
    }

    const form = document.getElementById('changePasswordForm');
    const confirmationMessageElement = document.getElementById('confirmationMessage');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        let isValid = true;

        const currentPassword = document.getElementById('currentPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        resetFields();

        if (!currentPassword) {
            showFieldError('currentPassword', 'Current Password is required.');
            isValid = false;
        }
        if (!newPassword) {
            showFieldError('newPassword', 'New Password is required.');
            isValid = false;
        }
        if (!confirmPassword) {
            showFieldError('confirmPassword', 'Confirm Password is required.');
            isValid = false;
        }

        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            showFieldError('confirmPassword', 'New Password and Confirm Password do not match.');
            isValid = false;
        }

        if (currentPassword && newPassword && currentPassword === newPassword) {
            showFieldError('confirmPassword', 'New Password cannot be the same as Current Password.');
            isValid = false;
        }

        if (!isValid) return; 

        try {
            const data = {
                currentPassword: currentPassword,
                newPassword: newPassword,
            };

            const response = await changePassword(data);

            showSuccessMessage(response.message || 'Password changed successfully.');

            form.reset();
            resetFields();
            setTimeout(() => {
                confirmationMessageElement.style.display = 'none';
            }, 5000); 
        } catch (error) {
            showFieldError('currentPassword', error.message || 'Current Password is incorrect.');
        }
    });

    function resetFields() {
        const fields = document.querySelectorAll('.form-control');
        fields.forEach(field => {
            field.classList.remove('is-invalid');
            const errorElement = field.nextElementSibling;
            if (errorElement) errorElement.textContent = '';
        });
    }

    function showFieldError(fieldId, errorMessage) {
        const field = document.getElementById(fieldId);
        const errorElement = field.nextElementSibling; 
        field.classList.add('is-invalid');
        if (errorElement) errorElement.textContent = errorMessage;
    }

    function showSuccessMessage(message) {
        confirmationMessageElement.style.display = 'block';
        confirmationMessageElement.textContent = message;
        confirmationMessageElement.style.color = 'green';
    }

    function isUserLoggedIn() {
        return true;
    }
});




//Change Password Form

//Footer

$(function () {
    $("#footer").load("footer.html");
});

//Footer