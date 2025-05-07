//modal - Get Started

document.getElementById('getStarted').addEventListener('click', function () {
    $('#getStartedModal').modal('show');
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('getStartedForm');
    const productID = form.dataset.productid;

    sessionStorage.setItem('productID', productID);

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
            mobileCode: document.getElementById('mobileCode').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            productID: sessionStorage.getItem('productID') 
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
                const response = await save(data);

                if (response && response.trackingCode) {
                    const trackingCode = response.trackingCode;

                    sessionStorage.setItem('trackingCode', trackingCode);

                    form.reset();
                    form.classList.remove('was-validated');
                    window.location.replace('confirmation.html');
                } else {
                    console.error('Tracking code not found in server response.');
                    alert('Error: Tracking code not found in the server response.');
                }

            } catch (error) {
                console.error('Error:', error);

                if (error instanceof Response) {
                    try {
                        const errorDetails = await error.json();
                        if (errorDetails.field) {
                            showError(document.getElementById(errorDetails.field), errorDetails.error);
                        } else {
                            alert('Error sending information, please try again.');
                        }
                    } catch (jsonError) {
                        console.error('Error parsing server response:', jsonError);
                        alert('Error occurred. Please try again.');
                    }
                } else {
                    alert('Unexpected error occurred.');
                }
            }
        }
    });

    function validateField(field) {
        const fieldID = field.id;
        const fieldname = field.placeholder;
        const fieldValue = field.value.trim();

        if (fieldID === 'staffSize' && !field.value) {
            return `Staff Size is required`;
        }

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



//modal - Get Started