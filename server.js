const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const cors = require('cors')

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(bodyParser.json())

app.use(
    cors({
        origin: [
            'https://gustavof-dev.onrender.com',
            'https://gustavof-dev.onrender.com/',
            'https://portfolio-v2-wql0.onrender.com/',
            'https://portfolio-v2-wql0.onrender.com',
            'https://portfolio-v2-server.onrender.com',
            'https://portfolio-v2-server.onrender.com/'
        ]
    })
)

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

app.post('/enviar-email', (req, res) => {
    const userName = req.body.userName
    const userEmail = req.body.userEmail
    const userMessage = req.body.userMessage

    if (!userName || userName.length < 2) {
        return res.status(400).json({ success: false, error: 'O nome deve ter mais de 1 letra' });
    }

    if (!userEmail || !validateEmail(userEmail)) {
        return res.status(400).json({ success: false, error: 'Por favor, insira um e-mail válido' });
    }

    if (!userMessage || userMessage.length < 5) {
        return res.status(400).json({ success: false, error: 'A mensagem deve ter mais de 5 letras' });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.STANDARD_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    const mailOptions = {
        from: {
            name: userName,
            address: userEmail
        },
        to: [process.env.STANDARD_EMAIL],
        subject: "E-mail do Portfólio!",
        html: `<b>Email do Sender (Remetente):</b> ${userEmail} <br/> ${userMessage}`,
    }

    const sendMail = async (transporter, mailOptions) => {
        try {
            await transporter.sendMail(mailOptions)
            console.log('email has been sent')
            res.json({ success: true, redirectUrl: '/thank-you.html' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ success: false, error: 'Internal Server Error' })
        }
    }

    sendMail(transporter, mailOptions)
})

app.get('/', (req, res) => {
    res.send('Hello from the backend')
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})