//Menu

$(function () {
    $("#menu").load("menu.html");
});

//Menu

//Contact Us Form

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactUsForm');
    const confirmationMessage = document.getElementById('confirmationMessage');
    
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); 
    
        let isValid = true;
        const fields = form.querySelectorAll('input, select, textarea');
        const data = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            companyName: document.getElementById('companyName').value,
            mobileCode: document.getElementById('mobileCode').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
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
    
        if (isValid) {
            try {
                const response = await sendContactForm(data);
                form.reset();
                form.classList.remove('was-validated');
                confirmationMessage.style.display = 'block';
                confirmationMessage.textContent = 'Thank you! Your information has been successfully submitted.';

                sessionStorage.removeItem('trackingCode');

                setTimeout(() => {
                    confirmationMessage.style.display = 'none';
                }, 5000);
            } catch (error) {
                console.error('Error:', error);
                alert('Error sending information, please try again.'); 
            }
        }
    });
    
    
    function validateField(field) {
        const fieldID = field.id;
        const fieldname = field.placeholder;
        const fieldValue = field.value;
    
        if (fieldID === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
                return 'Please enter a valid email.';
            }
        }
    
        if (fieldID === 'mobileCode' && !field.value) {
            return `Mobile Code is required`;
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
    });

//Contact Us Form

//Footer

$(function () {
    $("#footer").load("footer.html");
});

//Footer