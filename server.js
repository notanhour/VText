'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const bodyParser = require('body-parser');
const app = express();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const uploadFolder = 'uploads/';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

let port = 6482;

function createUploadFolder() {
    let dir = path.join(uploadFolder, Date.now().toString());
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (!req.uploadFolder) req.uploadFolder = createUploadFolder();
        callback(null, req.uploadFolder);
    },
    filename: function (req, file, callback) {
        crypto.randomBytes(16, function (error, buf) {
            if (error) {
                return callback(error);
            }
            let hexFileName = buf.toString('hex') + path.extname(file.originalname);
            callback(null, hexFileName);
        });
    }
});

app.use(express.static('public', {
    maxAge: '0'
}));
app.use(bodyParser.json());

let upload = multer({ storage: storage });

app.post('/upload', upload.array('files'), function (req, res) {
    let results = [];
    let date = getFDate();
    let model = req.body.model;
    let completed = 0;

    req.files.forEach(function (file) {
        let filename = file.originalname;
        let filePath = path.resolve(file.path);
        let fileExtension = path.extname(filename).toLowerCase();
        let id = uuidv4();
        transcribe(filePath, filename, id);
    });

    function transcribe(filePath, filename, id) {
        exec(`python transcribe.py ${filePath} ${model}`, function (error, stdout, stderr) {
            if (error) {
                console.error('Error:', error.message);
                results.push({id: id, file: filename, date: date, model: model, error: error.message});
            } else if (stderr) {
                console.error('StdErr:', stderr);
                results.push({id: id, file: filename, date: date, model: model, error: stderr});
            } else {
                let transcript = stdout.trim();
                console.log('Transcript:', transcript);
                results.push({id: id, file: filename, date: date, model: model, transcript: transcript});
            }
            isFinished();
        });
    }

    function getFDate() {
        let now = new Date();

        let day = String(now.getDate()).padStart(2, '0');
        let month = String(now.getMonth() + 1).padStart(2, '0');
        let year = now.getFullYear();

        let hours = String(now.getHours()).padStart(2, '0');
        let minutes = String(now.getMinutes()).padStart(2, '0');

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    function isFinished() {
        completed++;
        if (completed == req.files.length) {
            let username = decodeToken(req.headers['authorization']);

            fs.readFile('./users.json', function (error, data) {
                if (error) {
                    console.error('Error reading users.json:', error);
                    return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
                }

                let users;
                try {
                    users = JSON.parse(data);
                } catch (error) {
                    console.error('Error parsing users.json:', error);
                    return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
                }

                results.forEach(function (result) {
                    users[username].transcripts.push(result);
                });

                fs.writeFile('./users.json', JSON.stringify(users, null, 4), function (error) {
                    if (error) {
                        console.error('Error writing to users.json:', error);
                        res.status(500).json({ success: false, message: 'Ошибка сервера.' })
                    } else {
                        res.json(results);
                        deleteUploads(req.uploadFolder);
                    }
                });
            });
        }
    }

    function deleteUploads(directory) {
        fs.rm(directory, { recursive: true, force: true }, function (error) {
            if (error) {
                console.error('Unable to delete directory:', error);
            }
        });
    }
});

function generateToken(username) {
    return jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
}

function decodeToken(token) {
    let decodedToken = jwt.decode(token);
    return decodedToken ? decodedToken.username : null;
}

app.post('/login', function (req, res) {
    let { username, password } = req.body;

    fs.readFile('./users.json', function (error, data) {
        if (error) {
            console.error('Error reading users.json:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
        }

        let users;
        try {
            users = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing users.json:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
        }

        if (users[username]) {
            bcrypt.compare(password, users[username].password, function (error, result) {
                if (error) {
                    console.error('Error comparing passwords:', error);
                    return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
                }

                if (result) {
                    let token = generateToken(username);
                    res.json({ success: true, token: token });
                } else {
                    res.json({ success: false, message: 'Неверное имя пользователя или пароль.' });
                }
            });
        } else {
            res.json({ success: false, message: 'Неверное имя пользователя или пароль.' });
        }
    });
});

function authenticateToken(req, res, next) {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Не авторизован.' });
    }
    jwt.verify(token, SECRET_KEY, function (error, decoded) {
        if (error) {
            return res.status(403).json({ success: false, message: 'Токен недействителен.' });
        }
        next();
    });
}

app.post('/register', function (req, res) {
    let { username, password } = req.body;

    fs.readFile('./users.json', function (error, data) {
        if (error) {
            console.error('Error reading users.json:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
        }

        let users;
        try {
            users = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing users.json:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
        }

        if (users[username]) {
            res.status(400).json({ success: false, message: 'Имя пользователя занято. Попробуйте другое.' });
        } else if (username.trim() == "" || password.trim() == "") {
            res.status(400).json({ success: false, message: 'Имя пользователя и пароль не могут быть пустыми или включать в себя только пробелы.' });
        } else {
            bcrypt.hash(password, 10, function (error, hash) {
                if (error) {
                    console.error('Error hashing password:', error);
                    return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
                }

                users[username] = {
                    password: hash,
                    transcripts: []
                };

                fs.writeFile('./users.json', JSON.stringify(users, null, 4), function (error) {
                    if (error) {
                        console.error('Error writing to users.json:', error);
                        res.status(500).json({ success: false, message: 'Ошибка сервера.' });
                    } else {
                        res.json({ success: true });
                    }
                });
            });
        }
    });
});

app.post('/prefetch', authenticateToken, function (req, res) {
    let username = decodeToken(req.headers['authorization']);

    fs.readFile('./users.json', function (error, data) {
        if (error) {
            console.error('Error reading users.json:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
        }

        let users;
        try {
            users = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing users.json:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
        }

        if (users[username]) {
            return res.json({ success: true, transcripts: users[username].transcripts });
        }
    });
});

app.delete('/delete', function (req, res) {
    let username = decodeToken(req.headers['authorization']);
    const id = req.body.id;

    fs.readFile('./users.json', function (error, data) {
        if (error) {
            console.error('Error reading users.json:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
        }

        let users;
        try {
            users = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing users.json:', error);
            return res.status(500).json({ success: false, message: 'Ошибка сервера.' });
        }

        let transcripts = users[username].transcripts;
        let transcriptIndex = transcripts.findIndex(function (transcript) {
            return transcript.id == id;
        });

        if (transcriptIndex != -1) {
            transcripts.splice(transcriptIndex, 1);
            fs.writeFile('./users.json', JSON.stringify(users, null, 4), function (error) {
                if (error) {
                    console.error('Error writing to users.json:', error);
                    res.status(500).json({ success: false, message: 'Ошибка сервера.' });
                } else {
                    res.json({ success: true });
                }
            });
        }
    });
});

app.post('/validate', function (req, res) {
    authenticateToken(req, res, function () {
        res.json({ success: true });
    });
});

app.listen(port, function () {
    console.log(`Server is running on localhost:${port}`);
});