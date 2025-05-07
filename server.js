const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const session = require('express-session'); 
const svgCaptcha = require('svg-captcha');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); 
const app = express();
const port = 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'smartTrackCaptchaSecret', 
    resave: false,            
    saveUninitialized: true,  
    cookie: {
        secure: false,        
        maxAge: 24 * 60 * 60 * 1000,       
    }
})); 

const JWT_SECRET = 'SmartTrackSecretKeyJWT';

app.use(cookieParser());

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5500','http://127.0.0.1:5500','http://10.1.1.67', 'http://localhost'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.options('*', cors()); 

const dbConfig = {
    user: 'sa',
    password: '123',
    server: 'Pooya',
    database: 'SmartTrack',
    options: {
        port: 1433,
        trustServerCertificate: true
    }
};

const transporter = nodemailer.createTransport({
    host: 'mail.kara2000.ir',
    port: 465,
    secure: true,
    auth: {
        user: 'noreply@kara2000.ir',
        pass: 'N0R3ply2025'
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.post('/submit-form', async (req, res) => {
    const { firstName, lastName, companyName, staffSize, email, mobileCode, phoneNumber, productID } = req.body;

    console.log('[submit-form] Data received:', req.body);

    if (!productID) {
        console.error('[submit-form] ProductID not provided');
        return res.status(400).json({ error: 'ProductID not provided' });
    }

    try {
        let pool = await sql.connect(dbConfig);
        console.log('[submit-form] Connected to database');

        const existingEmail = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT userID FROM users WHERE email = @email');

        if (existingEmail.recordset.length > 0) {
            console.error('[submit-form] Email already exists:', email);
            return res.status(400).json({ field: 'email', error: 'Email already exists' });
        }

        const existingPhone = await pool.request()
            .input('phoneNumber', sql.BigInt, phoneNumber)
            .input('mobileCode', sql.VarChar, mobileCode)
            .query('SELECT userID FROM users WHERE mobileCode = @mobileCode AND phoneNumber = @phoneNumber');

        if (existingPhone.recordset.length > 0) {
            console.error('[submit-form] Phone number already exists:', phoneNumber);
            return res.status(400).json({ field: 'phoneNumber', error: 'Phone number already exists' });
        }

        const hashedPassword = await bcrypt.hash(email, 10);

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            console.log('[submit-form] Inserting user data...');
            const insertUserResult = await transaction.request()
                .input('firstName', sql.VarChar, firstName || '')
                .input('lastName', sql.VarChar, lastName || '')
                .input('companyName', sql.VarChar, companyName || '')
                .input('staffSize', sql.VarChar, staffSize || '')
                .input('username', sql.VarChar, email)
                .input('email', sql.VarChar, email)
                .input('mobileCode', sql.VarChar, mobileCode || '')
                .input('phoneNumber', sql.BigInt, phoneNumber || null)
                .input('password', sql.VarChar, hashedPassword)
                .query(`INSERT INTO users 
                        (firstName, lastName, companyName, staffSize, username, email, mobileCode, phoneNumber, password) 
                        OUTPUT INSERTED.userID 
                        VALUES (@firstName, @lastName, @companyName, @staffSize, @username, @email, @mobileCode, @phoneNumber, @password)`);

            const userID = insertUserResult.recordset[0].userID;
            console.log('[submit-form] User data inserted, userID:', userID);

            const roleID = 2; 

            await transaction.request()
                .input('userID', sql.Int, userID)
                .input('roleID', sql.Int, roleID)
                .query(`INSERT INTO userRole (userID, roleID) VALUES (@userID, @roleID)`);

            const currentDate = new Date();
            await transaction.request()
                .input('userID', sql.Int, userID)
                .input('productID', sql.Int, productID)
                .input('requestDate', sql.DateTime, currentDate)
                .input('startDate', sql.DateTime, null)
                .input('endDate', sql.DateTime, null)
                .input('usernameProduct', sql.VarChar, null)
                .input('passwordProduct', sql.VarChar, null)
                .query(`INSERT INTO userProduct 
                        (userID, productID, requestDate, startDate, endDate, usernameProduct, passwordProduct) 
                        VALUES (@userID, @productID, @requestDate, @startDate, @endDate, @usernameProduct, @passwordProduct)`);

            await transaction.commit();
            console.log('[submit-form] Transaction committed successfully');

            const formData = { firstName, lastName, companyName, staffSize, email, mobileCode, phoneNumber };

            try {
                const trackingCode = userID;
                await sendGetStartedForm(formData, trackingCode);
                res.json({ 
                    message: 'Data inserted successfully into users, userRole and userProduct tables', 
                    trackingCode: `${trackingCode}` 
                });
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                res.status(500).json({
                    error: 'Data inserted but error sending email',
                    trackingCode: `${userID}` 
                });
            }

        } catch (err) {
            await transaction.rollback();
            console.error('[submit-form] Transaction rolled back due to error:', err);
            res.status(500).json({ error: 'Error inserting data' });
        }
    } catch (err) {
        console.error('[submit-form] Database connection error:', err);
        res.status(500).json({ error: 'Database connection error' });
    }
});

app.post('/submit-logged-in-user-product', async (req, res) => {
    const { username, productID } = req.body;

    console.log('[Server] Data received:', { username, productID }); 

    if (!username || !productID) {
        console.error('[Server] Missing username or productID');
        return res
            .status(400)
            .json({ error: 'Bad Request: Missing username or productID' });
    }

    try {
        let pool = await sql.connect(dbConfig);

        const userResult = await pool
            .request()
            .input('username', sql.VarChar, username)
            .query('SELECT userID FROM users WHERE username = @username');

        if (userResult.recordset.length === 0) {
            console.error('[Server] User not found:', username);
            return res.status(404).json({ error: 'User not found' });
        }

        const userID = userResult.recordset[0].userID;
        const currentDate = new Date();

        await pool
            .request()
            .input('userID', sql.Int, userID)
            .input('productID', sql.Int, productID)
            .input('requestDate', sql.DateTime, currentDate)
            .input('startDate', sql.DateTime, null)
            .input('endDate', sql.DateTime, null)
            .input('usernameProduct', sql.VarChar, null)
            .input('passwordProduct', sql.VarChar, null)
            .query(`
                INSERT INTO userProduct 
                (userID, productID, requestDate, startDate, endDate, usernameProduct, passwordProduct) 
                VALUES (@userID, @productID, @requestDate, @startDate, @endDate, @usernameProduct, @passwordProduct)
            `);

        const trackingCode = userID;

        console.log('[Server] Data successfully inserted:', { trackingCode });

        res.json({ message: 'Data saved successfully', trackingCode });
    } catch (err) {
        console.error('[Server] Error occurred during database operation:', err);

        res
            .status(500)
            .json({ error: 'Internal Server Error', details: err.message });
    }
});

app.get('/captcha', (req, res) => {
    const captcha = svgCaptcha.create({
        size: 5, 
        noise: 1, 
        color: false,
        ignoreChars: '0o1iIl', 
        background: '#f2f2f2'
    });

    req.session.captcha = captcha.text.toLowerCase(); 
    console.log('Generated CAPTCHA stored in session:', req.session.captcha);

    res.type('svg');
    res.status(200).send(captcha.data);
});

app.post('/login', async (req, res) => {
    const { username, password, captcha } = req.body;

    if (!captcha || captcha.toLowerCase() !== req.session.captcha) {
        console.log('Invalid CAPTCHA entered:', captcha);
        return res.status(400).json({ message: 'Invalid CAPTCHA' });
    }
    req.session.captcha = null;

    try {
        const pool = await sql.connect(dbConfig);

        const user = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM users WHERE username = @username');

        if (user.recordset.length === 0) {
            console.log('User not found in the database:', username);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const hashedPassword = user.recordset[0].password;

        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            console.log('Invalid password for username:', username);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const { firstName, email } = user.recordset[0];

        console.log('Login successful for user:', username, 'First name:', firstName);

        req.session.userEmail = email;
        req.session.username = username;
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session for user:', username, '-', err);
                return res.status(500).json({ error: 'Session save error' });
            }
            
            console.log('Session saved successfully for user:', req.session.userEmail);

            const responsePayload = {
                message: 'Login successful',
                username: username,
                email: email,
                firstName: firstName,
            };
            console.log('Response payload:', responsePayload); 
            
            res.status(200).json(responsePayload);
        });

    } catch (err) {
        console.error('Error during user login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
      
app.post("/setUserRole", isAuthenticated, async (req, res) => {
    const { userEmail } = req.session; 
    let role = null;

    try {
        const pool = await sql.connect(dbConfig);

        const findUserQuery = `
            SELECT userID, username 
            FROM users 
            WHERE email = @Email
        `;
        const userResult = await pool
            .request()
            .input("Email", sql.VarChar, userEmail)
            .query(findUserQuery);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                message: "User not found",
                role: null,
            });
        }

        const { userID, username } = userResult.recordset[0];

        const findRoleQuery = `
            SELECT role.roleName
            FROM userRole
            INNER JOIN role ON userRole.roleID = role.roleID
            WHERE userRole.userID = @UserID
        `;
        const roleResult = await pool
            .request()
            .input("UserID", sql.Int, userID)
            .query(findRoleQuery);

        if (!roleResult.recordset.length) {
            return res.status(200).json({
                message: "User has no role",
                role: null,
            });
        }

        role = roleResult.recordset[0].roleName;

        const token = jwt.sign(
            { username, role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("authToken", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
            // maxAge: 3600000, 
        });

        return res.status(200).json({
            message: "Role assigned",
            role,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            details: error.message,
        });
    }
});

app.post('/register-form', async (req, res) => {
    const { firstName, lastName, companyName, staffSize, email, passwordRegister, mobileCode, phoneNumber } = req.body;

    try {
        const pool = await sql.connect(dbConfig);

        const existingEmail = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT userID FROM users WHERE email = @email');

        if (existingEmail.recordset.length > 0) {
            return res.status(400).json({ success: false, field: 'email', error: 'Email already exists' });
        }

        const existingCombo = await pool.request()
            .input('mobileCode', sql.VarChar, mobileCode)
            .input('phoneNumber', sql.BigInt, phoneNumber)
            .query('SELECT userID FROM users WHERE mobileCode = @mobileCode AND phoneNumber = @phoneNumber');

        if (existingCombo.recordset.length > 0) {
            return res.status(400).json({ success: false, field: 'phoneNumber', error: 'This phone combination already exists' });
        }

        const hashedPassword = await bcrypt.hash(passwordRegister, 10);

        const insertUserResult = await pool.request()
            .input('firstName', sql.VarChar, firstName)
            .input('lastName', sql.VarChar, lastName)
            .input('companyName', sql.VarChar, companyName)
            .input('staffSize', sql.VarChar, staffSize)
            .input('username', sql.VarChar, email) 
            .input('password', sql.VarChar, hashedPassword)
            .input('email', sql.VarChar, email)
            .input('mobileCode', sql.VarChar, mobileCode)
            .input('phoneNumber', sql.BigInt, phoneNumber)
            .query(`
                    INSERT INTO users
                    (firstName, lastName, companyName, staffSize, username, password, email, mobileCode, phoneNumber) 
                    OUTPUT INSERTED.userID 
                    VALUES (@firstName, @lastName, @companyName, @staffSize, @username, @password, @email, @mobileCode, @phoneNumber)`);

        if (!insertUserResult.recordset || insertUserResult.recordset.length === 0) {
            throw new Error('User was not inserted into the database');
        }

        const userID = insertUserResult.recordset[0].userID;

        const roleID = 2; 

        const insertUserRoleResult = await pool.request()
            .input('userID', sql.Int, userID)
            .input('roleID', sql.Int, roleID)
            .query(`
                    INSERT INTO userRole
                    (userID, roleID)
                    VALUES (@userID, @roleID)`);

        if (!insertUserRoleResult.rowsAffected || insertUserRoleResult.rowsAffected[0] === 0) {
            throw new Error('Role was not assigned to the user');
        }

        const formData = { firstName, lastName, companyName, staffSize, email, mobileCode, phoneNumber };

        try {
            await sendRegisterForm(formData);
            res.status(201).json({ 
                success: true, 
                message: 'Your registration was successful!', 
                userID 
            });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            res.status(500).json({ 
                success: true, 
                message: 'User registered but email could not be sent' 
            });
        }
    } catch (err) {
        console.error('Error during registration:', err);

        res.status(500).json({ 
            success: false, 
            error: err.message || 'Internal server error' 
        });
    }
});

app.post('/contact-us', async (req, res) => {
    const { firstName, lastName, email, companyName, mobileCode, phoneNumber, subject, message } = req.body;

    const formData = { firstName, lastName, email, companyName, mobileCode, phoneNumber, subject, message };

    try {
        await sendContactEmail(formData);
        res.status(200).json({ message: 'Contact form submitted successfully' });
    } catch (emailError) {
        console.error('Error sending email:', emailError);
        res.status(500).json({ error: 'Error sending email' });
    }
});

async function sendGetStartedForm(formData, trackingCode) {
    const adminMailOptions = {
        from: 'noreply@kara2000.ir',
        to: 'mehrabi.pooya1@gmail.com',
        subject: 'New customer register',
        text: `Form Information:\n\n` +
            `Tracking Code: ${trackingCode}\n` +
            `First Name: ${formData.firstName}\n` +
            `Last Name: ${formData.lastName}\n` +
            `Company Name: ${formData.companyName}\n` +
            `Staff Size: ${formData.staffSize}\n` +
            `Email: ${formData.email}\n` +
            `Code of Country: ${formData.mobileCode}\n` +
            `Phone Number: ${formData.phoneNumber}\n`
    };

    const userMailOptions = {
        from: 'noreply@kara2000.ir',
        to: formData.email,
        subject: 'Registration Confirmation',
        html: `
            <div style="text-align: center; padding: 20px;">
                <img src="cid:logo" alt="Logo" style="width: 150px; height: auto; margin-bottom: 20px;" />
                <h2>Registration Confirmation</h2>
                <p style="font-size: 20px;">
                    Dear <strong>${formData.firstName} ${formData.lastName}</strong>,
                </p>
                <p style="font-size: 16px; color: #555555;">
                    Thank you for registering with us.<br />
                    Your tracking code is: <strong>${trackingCode}</strong><br /><br />
                    <strong>Login information:</strong><br /><br />
                    Username: <strong>${formData.email}</strong><br />
                    Password: <strong>${formData.email}</strong><br /><br />
                    <strong>You can change your password on your profile.</strong>
                </p>
                <p style="font-size: 16px; color: #555555;">
                    <strong>Best regards,</strong><br/>
                    Smart Track
                </p>
            </div>
        `,
        attachments: [
            {
                filename: 'logo.png',
                path: 'Images/Theme/logoBlue.png',
                cid: 'logo'
            }
        ]
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(adminMailOptions, function (error, info) {
            if (error) {
                reject(error);
            } else {
                console.log('Admin Email sent: ' + info.response);

                transporter.sendMail(userMailOptions, function (error, info) {
                    if (error) {
                        reject(error);
                    } else {
                        console.log('User Email sent: ' + info.response);
                        resolve(info.response);
                    }
                });
            }
        });
    });
}

async function sendContactEmail(formData) {
    const adminMailOptions = {
        from: 'noreply@kara2000.ir',
        to: 'mehrabi.pooya1@gmail.com',
        subject: `New Contact Form Submission: ${formData.subject}`,
        text: `Contact Form Details:\n\n` +
              `First Name: ${formData.firstName}\n` +
              `Last Name: ${formData.lastName}\n` +
              `Email: ${formData.email}\n` +
              `Company Name: ${formData.companyName || 'N/A'}\n` +
              `Code of Country: ${formData.mobileCode || 'N/A'}\n` +
              `Phone Number: ${formData.phoneNumber || 'N/A'}\n` +
              `Subject: ${formData.subject}\n` +
              `Message: ${formData.message}\n`
    };

    const userMailOptions = {
        from: 'noreply@kara2000.ir',
        to: formData.email,
        subject: 'Thank you for contacting us',
        html: `
            <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
                <img src="cid:logo" alt="Logo" style="width: 150px; height: auto; margin-bottom: 20px;" />
                <h2>Thank you for getting in touch!</h2>
                <p>Hi <strong>${formData.firstName} ${formData.lastName || ''}</strong>,</p>
                <p>Your message with the subject "<strong>${formData.subject}</strong>" has been received.</p>
                <p>We will respond to you as soon as possible.</p>
                <p style="font-size: 16px; color: #666; margin-top: 20px;">
                    <strong>Kind regards,</strong><br>
                    Smart Track Team
                </p>
            </div>
        `,
        attachments: [
            {
                filename: 'logo.png',
                path: 'Images/Theme/logoBlue.png',
                cid: 'logo'
            }
        ]
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(adminMailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                console.log('Admin Email sent: ' + info.response);

                transporter.sendMail(userMailOptions, (error, info) => {
                    if (error) {
                        reject(error);
                    } else {
                        console.log('User Email sent: ' + info.response);
                        resolve(info.response);
                    }
                });
            }
        });
    });
}

async function sendRegisterForm(formData) {
    
    const userMailOptions = {
        from: 'noreply@kara2000.ir',
        to: formData.email,
        subject: 'Registration Confirmation',
        html: `
            <div style="text-align: center; padding: 20px;">
                <img src="cid:logo" alt="Logo" style="width: 150px; height: auto; margin-bottom: 20px;" />
                <h2>Registration Confirmation</h2>
                <p style="font-size: 20px;">
                    Dear <strong>${formData.firstName} ${formData.lastName}</strong>,
                </p>
                <p style="font-size: 16px; color: #555555;">
                    Thank you for registering with us.<br /><br />
                    <strong>Login information:</strong><br /><br />
                    Username: <strong>${formData.email}</strong><br />
                    Password: <strong>${formData.passwordRegister}</strong><br /><br />
                    <strong>You can change your password on your profile.</strong>
                </p>
                <p style="font-size: 16px; color: #555555;">
                    <strong>Best regards,</strong><br/>
                    Smart Track
                </p>
            </div>
        `,
        attachments: [
            {
                filename: 'logo.png',
                path: 'Images/Theme/logoBlue.png',
                cid: 'logo'
            }
        ]
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(userMailOptions, function (error, info) {
            if (error) {
                reject(error);
            } else {
                console.log('User Email sent: ' + info.response);
                resolve(info.response);
            }
        });
    });
}

app.get('/api/getUserProfile', async (req, res) => {
    try {
        console.log('Request received for /api/getUserProfile');
        
        const username = req.query.username;
        if (!username) {
            console.error('No username provided in query');
            return res.status(400).json({ error: 'Username is required' });
        }

        const pool = await sql.connect(dbConfig);
        const query = 'SELECT * FROM users WHERE username = @Username';
        
        console.log('Executing query:', query, 'with username:', username);

        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .query(query);

        if (result.recordset.length > 0) {
            console.log('User found:', result.recordset[0]);
            return res.status(200).json(result.recordset[0]); 
        } else {
            console.warn('User not found for username:', username);
            return res.status(404).json({ error: 'User not found' }); 
        }
    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
});

app.post('/api/updateUserProfile', async (req, res) => {
    const { userID, firstName, lastName, companyName, staffSize, mobileCode, phoneNumber } = req.body;

    if (!userID) {
        return res.status(400).json({ error: 'User ID is required for update' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.request()
            .input('userID', sql.Int, userID)
            .input('firstName', sql.VarChar, firstName || null)
            .input('lastName', sql.VarChar, lastName || null)
            .input('companyName', sql.VarChar, companyName || null)
            .input('staffSize', sql.VarChar, staffSize || null)
            .input('mobileCode', sql.VarChar, mobileCode || null)
            .input('phoneNumber', sql.VarChar, phoneNumber || null)
            .query(`
                UPDATE users 
                SET 
                    firstName = @firstName, 
                    lastName = @lastName, 
                    companyName = @companyName, 
                    staffSize = @staffSize, 
                    mobileCode = @mobileCode, 
                    phoneNumber = @phoneNumber 
                WHERE userID = @userID
            `);

        if (result.rowsAffected[0] > 0) {
            return res.status(200).json({ message: 'Profile updated successfully' });
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error('Error updating user profile:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

function isAuthenticated(req, res, next) {
    console.log('Session data:', req.session);
    console.log('Session userEmail:', req.session?.userEmail);

    const userEmail = req.session?.userEmail;
    if (userEmail) {
        console.log('User is authenticated');
        next(); 
    } else {
        console.log('User is not logged in');
        res.status(401).json({ error: 'User not logged in' });
    }
}

app.post('/api/change-password', isAuthenticated, async (req, res) => {
    console.log('Session data at /api/change-password:', req.session);
    console.log('Request body:', req.body);

    const { currentPassword, newPassword } = req.body;
    const userEmail = req.session?.userEmail || null;

    if (!userEmail) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    try {
        let pool = await sql.connect(dbConfig);
        console.log('Connected to DB');

        const result = await pool.request()
            .input('email', sql.VarChar, userEmail)
            .query('SELECT password FROM users WHERE email = @email');

        if (result.recordset.length === 0) {
            console.error('User not found in database.');
            return res.status(404).json({ error: 'User not found.' });
        }

        const hashedPassword = result.recordset[0].password;
        console.log('Hashed password from DB:', hashedPassword);

        console.log('Provided Current Password:', currentPassword);
        const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
        console.log('Compare Result (current password):', isPasswordValid);

        if (!isPasswordValid) {
            console.error('Incorrect current password');
            return res.status(400).json({ error: 'Incorrect current password.' });
        }

        const isNewPasswordSame = await bcrypt.compare(newPassword, hashedPassword);
        console.log('Compare Result (new password):', isNewPasswordSame);

        if (isNewPasswordSame) {
            console.error('New password cannot be the same as current password.');
            return res.status(400).json({ error: 'New password cannot be the same as current password.' });
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('New hashed password generated.');

        await pool.request()
            .input('email', sql.VarChar, userEmail)
            .input('password', sql.VarChar, newHashedPassword)
            .query('UPDATE users SET password = @password WHERE email = @email');

        console.log('Password updated successfully for user:', userEmail);
        return res.status(200).json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Error changing password:', error.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

app.post('/api/send-code', async (req, res) => {
    const { email, code } = req.body;

    console.log("Request received at /api/send-code. Email:", email);

    try {
        let pool = await sql.connect(dbConfig);

        const emailCheckResult = await pool.request()
            .input('username', sql.VarChar, email)
            .query('SELECT COUNT(*) AS emailCount FROM users WHERE username = @username');

        const emailCount = emailCheckResult.recordset[0].emailCount;

        console.log("Number of matching usernames found:", emailCount);

        if (emailCount === 0) {
            console.log("Email not found. Sending error response.");
            return res.json({ success: false, message: 'Email not registered.' });
        }

        const mailOptions = {
            from: 'noreply@kara2000.ir',
            to: email,
            subject: 'Password Reset Request for Smart Track Account',
            html: `
            <div style="text-align: center; padding: 20px;">
                <img src="cid:logo" alt="Logo" style="width: 150px; height: auto; margin-bottom: 20px;" />
                <h2>Hello,</h2>
                <p style="font-size: 16px; color: #555555;">
                    We received a request to reset your password for your Smart Track account. If you made this request, please follow the instructions in this email to proceed.<br /><br />
                    If you did not request this password reset, you can safely ignore this message. Please note that your account will remain secure.<br /><br />
                    Your password reset code is: <strong>${code}</strong><br /><br />
                    If you have any questions, feel free to contact our support team.<br /><br />
                </p>
                <p style="font-size: 16px; color: #555555;">
                    Best regards,<br/>
                    <strong>Smart Track</strong>
                </p>
            </div>
        `,
            attachments: [
                {
                    filename: 'logo.png',
                    path: 'Images/Theme/logoBlue.png',
                    cid: 'logo'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');

        res.json({ success: true, message: 'Code sent to email successfully.' });
    } catch (error) {
        console.error('Error sending email or checking username:', error);
        res.status(500).json({ success: false, message: 'Failed to send code to email.' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    console.log("Request received at /api/reset-password. Email:", email);

    try {
        let pool = await sql.connect(dbConfig);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await pool.request()
            .input('username', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .query('UPDATE users SET password = @password WHERE username = @username');

        if (result.rowsAffected[0] === 0) {
            console.log("No user found to update the password.");
            return res.json({ success: false, message: 'Failed to reset password. Email not registered.' });
        }

        console.log('Password updated successfully for user:', email);
        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ success: false, error: 'Failed to reset password.' });
    }
});

app.get('/api/getUserProducts', async (req, res) => {
    const username = req.query.username; 

    try {
        console.log('Request received for /api/getUserProducts');

        if (!username) {
            console.error('No username provided in query');
            return res.status(400).json({ message: 'Username is required.' });
        }

        const pool = await sql.connect(dbConfig);

        const userQuery = 'SELECT userID FROM users WHERE username = @Username';
        console.log('Executing query:', userQuery, 'with username:', username);

        const userResult = await pool.request()
            .input('Username', sql.VarChar, username) 
            .query(userQuery);

        if (userResult.recordset.length === 0) {
            console.warn('User not found for username:', username);
            return res.status(404).json({ message: 'User not found.' });
        }

        const userID = userResult.recordset[0].userID; 

        const productQuery = `
            SELECT 
                p.productName, 
                u.requestDate, 
                u.startDate, 
                u.endDate, 
                u.usernameProduct, 
                u.passwordProduct
            FROM 
                products AS p
            INNER JOIN 
                userProduct AS u 
            ON 
                p.productID = u.productID
            WHERE 
                u.userID = @UserID`; 

        console.log('Executing product query:', productQuery, 'with userID:', userID);

        const productResult = await pool.request()
            .input('UserID', sql.Int, userID) 
            .query(productQuery);

        if (productResult.recordset.length === 0) {
            console.warn('No products found for userID:', userID);
            return res.status(404).json({ message: 'No products found for this user.' });
        }

        console.log('Products found:', productResult.recordset);

        return res.status(200).json(productResult.recordset);
    } catch (error) {
        console.error('Error fetching user products:', error.message);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.get("/getUserRole", async (req, res) => {
    const token = req.cookies.authToken; 

    if (!token) {
        return res.status(200).json({ 
            success: false, 
            role: null,  
        }); 
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.status(200).json({ 
            success: true, 
            role: decoded.role 
        }); 
    } catch (error) {
        res.clearCookie("authToken", { path: "/" });
        return res.status(200).json({ 
            success: false, 
            role: null, 
        }); 
    }
});

app.post("/logout", (req, res) => {
    try {
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: false, 
            sameSite: "strict",
            path: "/", 
        });

        res.clearCookie("anotherCookie", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
        });

        return res.status(200).json({ message: "Logged out, cookies cleared." });
    } catch (error) {
        console.error("Error while logging out:", error.message);
        return res.status(500).json({ error: "Error while logging out." });
    }
});

app.get('/api/getNewOrdersCount', async (req, res) => {
    try {
        console.log('Request received for /api/getNewOrdersCount');

        const pool = await sql.connect(dbConfig);

        const countQuery = `
            SELECT COUNT(*) AS orderCount 
            FROM userProduct 
            WHERE startDate IS NULL AND endDate IS NULL
        `;

        console.log('Executing count query:', countQuery);

        const countResult = await pool.request().query(countQuery);

        const orderCount = countResult.recordset[0].orderCount;

        console.log('Orders count:', orderCount);

        return res.status(200).json({ count: orderCount }); 
    } catch (error) {
        console.error('Error fetching orders count:', error.message);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.get('/api/getUsersCount', async (req, res) => {
    try {
        console.log('Request received for /api/getUsersCount');

        const pool = await sql.connect(dbConfig);

        const countQuery = `
            SELECT COUNT(*) AS userCount
            FROM users u
            WHERE NOT EXISTS (
                SELECT 1
                FROM userRole ur
                WHERE ur.userID = u.userID AND ur.roleID = 1
            )
        `;

        console.log('Executing count query:', countQuery);

        const countResult = await pool.request().query(countQuery);

        const usersCount = countResult.recordset[0].userCount;

        console.log('users count:', usersCount);

        return res.status(200).json({ count: usersCount }); 
    } catch (error) {
        console.error('Error fetching users count:', error.message);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.get('/api/getUsersListForAdmin', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const userQuery = 'SELECT * FROM users';
        console.log('Executing query:', userQuery);

        const userResult = await pool.request()
            .query(userQuery);

        return res.status(200).json(userResult.recordset);

    } catch (error) {
        console.error('Error fetching user list:', error.message);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.post('/api/deleteUsers', async (req, res) => {
    try {
        const { usernames } = req.body;

        if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty usernames list provided for deletion.' });
        }

        const pool = await sql.connect(dbConfig);
        console.log('Connected to the database successfully.');

        const undeletableUsers = []; 
        const deletedUsers = []; 

        for (const username of usernames) {
            try {
                console.log(`Processing user: ${username}`);

                const userIdQuery = `
                    SELECT userID FROM users 
                    WHERE username = @username
                `;
                console.log('Executing query for finding userID:', userIdQuery);
                const userResult = await pool.request()
                    .input('username', sql.VarChar, username)
                    .query(userIdQuery);

                if (userResult.recordset.length === 0) {
                    console.warn(`User not found: ${username}`);
                    undeletableUsers.push(username);
                    continue;
                }

                const userId = userResult.recordset[0].userID;
                console.log(`Found userID for ${username}: ${userId}`);

                const productCheckQuery = `
                    SELECT COUNT(*) AS productCount 
                    FROM userProduct 
                    WHERE userID = @userID
                `;
                console.log('Executing product check query:', productCheckQuery);
                const productCheckResult = await pool.request()
                    .input('userID', sql.Int, userId)
                    .query(productCheckQuery);

                const productCount = productCheckResult.recordset[0].productCount;

                if (productCount > 0) {
                    console.warn(`Cannot delete user ${username}. Associated products found.`);
                    undeletableUsers.push(username); 
                } else {
                    const deleteUserQuery = `
                        DELETE FROM users WHERE userID = @userID;
                        DELETE FROM userRole WHERE userID = @userID;
                    `;
                    console.log('Executing delete query:', deleteUserQuery);
                    await pool.request()
                        .input('userID', sql.Int, userId)
                        .query(deleteUserQuery);

                    console.log(`User deleted: ${username}`);
                    deletedUsers.push(username);
                }
            } catch (queryError) {
                console.error(`Error processing user ${username}:`, queryError.message);
                undeletableUsers.push(username);
            }
        }

        return res.status(200).json({ 
            deletedUsers, 
            undeletableUsers 
        });
    } catch (error) {
        console.error('Error deleting users:', error.message);
        return res.status(500).json({ 
            message: 'Internal server error occurred while deleting users.', 
            error: error.message 
        });
    }
});

app.post('/api/add-user', async (req, res) => {
    const { firstName, lastName, companyName, staffSize, email, mobileCode, phoneNumber } = req.body;

    console.log('[add-user] Data received:', req.body);

    if (!email) {
        console.error('[add-user] Email not provided');
        return res.status(400).json({ error: 'Email is required.' });
    }

    try {
        let pool = await sql.connect(dbConfig);
        console.log('[add-user] Connected to database');

        const existingEmail = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT userID FROM users WHERE email = @email');

        if (existingEmail.recordset.length > 0) {
            console.error('[add-user] Email already exists:', email);
            return res.status(400).json({ field: 'email', error: 'Email already exists' });
        }

        const existingPhone = await pool.request()
            .input('phoneNumber', sql.BigInt, phoneNumber)
            .input('mobileCode', sql.VarChar, mobileCode)
            .query('SELECT userID FROM users WHERE mobileCode = @mobileCode AND phoneNumber = @phoneNumber');

        if (existingPhone.recordset.length > 0) {
            console.error('[add-user] Phone number already exists:', phoneNumber);
            return res.status(400).json({ field: 'phoneNumber', error: 'Phone number already exists' });
        }

        const hashedPassword = await bcrypt.hash(email, 10);

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            console.log('[add-user] Inserting user data...');
            const insertUserResult = await transaction.request()
                .input('firstName', sql.VarChar, firstName || '')
                .input('lastName', sql.VarChar, lastName || '')
                .input('companyName', sql.VarChar, companyName || '')
                .input('staffSize', sql.VarChar, staffSize || '')
                .input('username', sql.VarChar, email)
                .input('email', sql.VarChar, email)
                .input('mobileCode', sql.VarChar, mobileCode || '')
                .input('phoneNumber', sql.BigInt, phoneNumber || null)
                .input('password', sql.VarChar, hashedPassword)
                .query(`INSERT INTO users 
                        (firstName, lastName, companyName, staffSize, username, email, mobileCode, phoneNumber, password) 
                        OUTPUT INSERTED.userID 
                        VALUES (@firstName, @lastName, @companyName, @staffSize, @username, @email, @mobileCode, @phoneNumber, @password)`);

            const userID = insertUserResult.recordset[0].userID;
            console.log('[add-user] User data inserted, userID:', userID);

            const roleID = 2; 
            await transaction.request()
                .input('userID', sql.Int, userID)
                .input('roleID', sql.Int, roleID)
                .query(`INSERT INTO userRole (userID, roleID) VALUES (@userID, @roleID)`);

            await transaction.commit();
            console.log('[add-user] Transaction committed successfully');

            const formData = { firstName, lastName, companyName, staffSize, email, mobileCode, phoneNumber };

            try {
                const trackingCode = userID; 
                await sendGetStartedForm(formData, trackingCode); 
                res.json({
                    message: 'User added successfully and email sent',
                    trackingCode: `${trackingCode}` 
                });
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                res.status(500).json({
                    error: 'User added but error sending email',
                    trackingCode: `${userID}`
                });
            }

        } catch (err) {
            await transaction.rollback();
            console.error('[add-user] Transaction rolled back due to error:', err);
            res.status(500).json({ error: 'Error inserting data' });
        }
    } catch (err) {
        console.error('[add-user] Database connection error:', err);
        res.status(500).json({ error: 'Database connection error' });
    }
});

app.post('/api/edit-user', async (req, res) => {
    const { email, firstName, lastName, companyName, staffSize, mobileCode, phoneNumber, username, currentEmail } = req.body;

    console.log('[edit-user] Data received: ', req.body);

    if (!email || !username || !currentEmail) {
        console.error('[edit-user] Email, Username or Current Email not provided');
        return res.status(400).json({ error: 'Email, Username and Current Email are required.' });
    }

    try {
        let pool = await sql.connect(dbConfig);
        console.log('[edit-user] Connected to database');

        const userQuery = await pool.request()
            .input('currentEmail', sql.VarChar, currentEmail)
            .query('SELECT userID FROM users WHERE email = @currentEmail');

        if (userQuery.recordset.length === 0) {
            console.error('[edit-user] User not found with current email:', currentEmail);
            return res.status(404).json({ error: 'User not found' });
        }

        const userID = userQuery.recordset[0].userID;

        const existingEmailQuery = await pool.request()
            .input('email', sql.VarChar, email)
            .input('userID', sql.Int, userID)
            .query('SELECT userID FROM users WHERE email = @email AND userID != @userID');
        if (existingEmailQuery.recordset.length > 0) {
            console.error('[edit-user] Email already exists:', email);
            return res.status(400).json({ field: 'email', error: 'Email already exists' });
        }

        const existingUsernameQuery = await pool.request()
            .input('username', sql.VarChar, username)
            .input('userID', sql.Int, userID)
            .query('SELECT userID FROM users WHERE username = @username AND userID != @userID');
        if (existingUsernameQuery.recordset.length > 0) {
            console.error('[edit-user] Username already exists:', username);
            return res.status(400).json({ field: 'username', error: 'Username already exists' });
        }

        const existingPhoneQuery = await pool.request()
            .input('mobileCode', sql.VarChar, mobileCode)
            .input('phoneNumber', sql.BigInt, phoneNumber)
            .input('userID', sql.Int, userID)
            .query('SELECT userID FROM users WHERE mobileCode = @mobileCode AND phoneNumber = @phoneNumber AND userID != @userID');
        if (existingPhoneQuery.recordset.length > 0) {
            console.error('[edit-user] Phone number already exists:', phoneNumber);
            return res.status(400).json({ field: 'phoneNumber', error: 'Phone number already exists' });
        }

        const hashedPassword = await bcrypt.hash(email, 10);

        await pool.request()
            .input('userID', sql.Int, userID)
            .input('firstName', sql.VarChar, firstName || '')
            .input('lastName', sql.VarChar, lastName || '')
            .input('companyName', sql.VarChar, companyName || '')
            .input('staffSize', sql.VarChar, staffSize || '')
            .input('username', sql.VarChar, username)
            .input('email', sql.VarChar, email)
            .input('mobileCode', sql.VarChar, mobileCode || '')
            .input('phoneNumber', sql.BigInt, phoneNumber || null)
            .input('password', sql.VarChar, hashedPassword)
            .query(`UPDATE users 
                    SET firstName = @firstName, lastName = @lastName, companyName = @companyName, staffSize = @staffSize, 
                        username = @username, email = @email, mobileCode = @mobileCode, phoneNumber = @phoneNumber, password = @password 
                    WHERE userID = @userID`);

        console.log('[edit-user] User updated successfully');
        res.json({ message: 'User updated successfully!' });
    } catch (err) {
        console.error('[edit-user] Error updating user:', err);
        res.status(500).json({ error: 'Error updating user' });
    }
});

app.get('/api/getRolesListForAdmin', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const roleQuery = 'SELECT * FROM role';
        console.log('Executing query:', roleQuery);

        const roleResult = await pool.request()
            .query(roleQuery);

        return res.status(200).json(roleResult.recordset);

    } catch (error) {
        console.error('Error fetching role list:', error.message);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.post('/api/deleteRoles', async (req, res) => {
    try {
        const { roleNames } = req.body;

        if (!roleNames || !Array.isArray(roleNames) || roleNames.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty roleNames list provided for deletion.' });
        }

        const pool = await sql.connect(dbConfig);

        const undeletableRoles = [];
        const deletedRoles = [];

        for (const roleName of roleNames) {
            try {
                const roleIdResult = await pool.request()
                    .input('roleName', sql.VarChar, roleName)
                    .query('SELECT roleID FROM role WHERE roleName = @roleName');

                if (roleIdResult.recordset.length === 0) {
                    undeletableRoles.push(roleName);
                    continue;
                }

                const roleId = roleIdResult.recordset[0].roleID;
                const userRoleCheckResult = await pool.request()
                    .input('roleID', sql.Int, roleId)
                    .query('SELECT COUNT(*) AS userCount FROM userRole WHERE roleID = @roleID');
                
                const userCount = userRoleCheckResult.recordset[0].userCount;

                if (userCount > 0) {
                    undeletableRoles.push(roleName);
                } else {
                    await pool.request()
                        .input('roleID', sql.Int, roleId)
                        .query('DELETE FROM role WHERE roleID = @roleID');
                    deletedRoles.push(roleName);
                }
            } catch (error) {
                undeletableRoles.push(roleName);
                console.error('Error processing role:', roleName, error.message);
            }
        }

        await pool.close();

        res.status(200).json({
            deletedRoles,
            undeletableRoles,
        });
    } catch (error) {
        console.error('Error in deleteRoles API:', error.message);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.post('/api/addRole', async (req, res) => {
    try {
        const { roleName } = req.body;

        if (!roleName || typeof roleName !== 'string') {
            return res.status(400).json({ message: 'Invalid roleName provided.' });
        }

        const pool = await sql.connect(dbConfig);

        const existingRoleResult = await pool.request()
            .input('roleName', sql.VarChar, roleName)
            .query('SELECT * FROM role WHERE roleName = @roleName');

        if (existingRoleResult.recordset.length > 0) {
            return res.status(400).json({ message: 'Role already exists.' });
        }

        const insertQuery = `
            INSERT INTO role (roleName)
            VALUES (@roleName)
        `;
        await pool.request()
            .input('roleName', sql.VarChar, roleName)
            .query(insertQuery);

        await pool.close();

        res.status(201).json({ message: 'Role successfully created.', roleName });
    } catch (error) {
        console.error('Error adding role:', error.message);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.get('/api/getUserRoleListForAdmin', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const userRoleQuery = `SELECT u.username, u.firstName, u.lastName, r.roleName FROM userRole ur
                            JOIN users u ON ur.userID = u.userID
                            JOIN role r ON ur.roleID = r.roleID; `;
        console.log('Executing query:', userRoleQuery);

        const userRoleResult = await pool.request()
            .query(userRoleQuery);

        return res.status(200).json(userRoleResult.recordset);

    } catch (error) {
        console.error('Error fetching user role list:', error.message);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.post('/api/updateUserRole', async (req, res) => {
    const { username, roleName } = req.body;

    if (!username || !roleName) {
        return res.status(400).json({ message: 'Username and roleName are required.' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const userQuery = `SELECT userID FROM users WHERE username = @username`;
        const userResult = await pool.request().input('username', sql.VarChar, username).query(userQuery);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const userID = userResult.recordset[0].userID;

        const roleQuery = `SELECT roleID FROM role WHERE roleName = @roleName`;
        const roleResult = await pool.request().input('roleName', sql.VarChar, roleName).query(roleQuery);

        if (roleResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Role not found.' });
        }
        const roleID = roleResult.recordset[0].roleID;

        const updateQuery = `UPDATE userRole SET roleID = @roleID WHERE userID = @userID`;
        await pool.request().input('userID', sql.Int, userID).input('roleID', sql.Int, roleID).query(updateQuery);

        res.status(200).json({ message: 'User role updated successfully.' });
    } catch (error) {
        console.error('Error updating user role:', error.message);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.get('/api/getUserRolesListForDropdown', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const roleQuery = `SELECT roleName FROM role;`;
        console.log('Executing query:', roleQuery);

        const roleResult = await pool.request().query(roleQuery);

        return res.status(200).json({ success: true, roles: roleResult.recordset });
    } catch (error) {
        console.error('Error fetching roles list:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
    }
});

app.get('/api/getUserOrdersListForAdmin', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const userOrdersQuery = `
            SELECT u.username, u.firstName, u.lastName, p.productName, up.userProductID,
                   up.requestDate, up.startDate, up.endDate, up.usernameProduct, 
                   up.passwordProduct 
            FROM userProduct up
            JOIN users u ON up.userID = u.userID
            JOIN products p ON up.productID = p.productID
            ORDER BY up.requestDate DESC;
        `;
        console.log('Executing query:', userOrdersQuery);

        const userOrdersResult = await pool.request().query(userOrdersQuery);

        return res.status(200).json(userOrdersResult.recordset);

    } catch (error) {
        console.error('Error fetching user orders list:', error.message);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.post('/api/updateUserOrders', async (req, res) => {
    const { userProductID, username, productName, startDate, endDate, usernameProduct, passwordProduct } = req.body;

    if (!userProductID || !username || !productName || !startDate || !endDate || !usernameProduct || !passwordProduct) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const userQuery = `SELECT userID FROM users WHERE username = @username`;
        const userResult = await pool.request().input('username', sql.VarChar, username).query(userQuery);
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const userID = userResult.recordset[0].userID;

        const productQuery = `SELECT productID FROM products WHERE productName = @productName`;
        const productResult = await pool.request().input('productName', sql.VarChar, productName).query(productQuery);
        if (productResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const productID = productResult.recordset[0].productID;

        const updateQuery = `
            UPDATE userProduct 
            SET productID = @productID, startDate = @startDate, endDate = @endDate, usernameProduct = @usernameProduct, passwordProduct = @passwordProduct
            WHERE userID = @userID AND userProductID = @userProductID
        `;
        await pool.request()
            .input('userID', sql.Int, userID)
            .input('productID', sql.Int, productID)
            .input('startDate', sql.DateTime, startDate)
            .input('endDate', sql.DateTime, endDate)
            .input('usernameProduct', sql.VarChar, usernameProduct)
            .input('passwordProduct', sql.VarChar, passwordProduct)
            .input('userProductID', sql.Int, userProductID)
            .query(updateQuery);

        res.status(200).json({ success: true, message: 'User order updated successfully.' });
    } catch (error) {
        console.error('Error updating user order:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
    }
});

app.get('/api/getProductsListForDropdown', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const productQuery = `SELECT productName FROM products;`;
        console.log('Executing query:', productQuery);

        const productResult = await pool.request().query(productQuery);
        return res.status(200).json({ success: true, roles: productResult.recordset });
    } catch (error) {
        console.error('Error fetching product list:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
    }
});

app.get('/api/getUsersList', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const usersQuery = `
            SELECT username, firstName, lastName 
            FROM users 
            ORDER BY username ASC;
        `;
        console.log('Executing query:', usersQuery);

        const usersResult = await pool.request().query(usersQuery);

        return res.status(200).json(usersResult.recordset);
    } catch (error) {
        console.error('Error fetching users list:', error.message);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
});

app.post('/api/addUserOrder', async (req, res) => {
    const { username, productName, requestedDate, startDate, endDate, usernameProduct, passwordProduct } = req.body;

    if (!username || !productName || !requestedDate || !startDate || !endDate || !usernameProduct || !passwordProduct) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const userQuery = `SELECT userID FROM users WHERE username = @username`;
        const userResult = await pool.request()
            .input('username', sql.VarChar, username)
            .query(userQuery);
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const userID = userResult.recordset[0].userID;

        const productQuery = `SELECT productID FROM products WHERE productName = @productName`;
        const productResult = await pool.request()
            .input('productName', sql.VarChar, productName)
            .query(productQuery);
        if (productResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const productID = productResult.recordset[0].productID;

        const insertQuery = `
            INSERT INTO userProduct 
                (userID, productID, requestDate, startDate, endDate, usernameProduct, passwordProduct)
            VALUES 
                (@userID, @productID, @requestedDate, @startDate, @endDate, @usernameProduct, @passwordProduct)
        `;
        await pool.request()
            .input('userID', sql.Int, userID)
            .input('productID', sql.Int, productID)
            .input('requestedDate', sql.DateTime, requestedDate)
            .input('startDate', sql.DateTime, startDate)
            .input('endDate', sql.DateTime, endDate)
            .input('usernameProduct', sql.VarChar, usernameProduct)
            .input('passwordProduct', sql.VarChar, passwordProduct)
            .query(insertQuery);

        res.status(200).json({ success: true, message: 'User order added successfully.' });
    } catch (error) {
        console.error('Error adding user order:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

