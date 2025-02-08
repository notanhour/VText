'use strict';

document.addEventListener('DOMContentLoaded', function () {
    let files = [];

    resultsTable.innerHTML = '<thead><tr><th>ДАТА</th><th>ФАЙЛ</th><th>МОДЕЛЬ</th><th></th></tr></thead><tbody></tbody>';
    responseContainer.style.display = 'none';
    let tbody = document.querySelector('tbody');
    sendBtn.disabled = true;

    let titleWidth = document.querySelector('h1').offsetWidth;
    let xIndent = `(100vw - ${titleWidth}px) / 2`;
    document.querySelector('header').style.paddingLeft = `calc(${xIndent})`;

    let headerHeight = document.querySelector('header').offsetHeight;
    let footerHeight = document.querySelector('footer').offsetHeight;
    let requestContainerHeight = requestContainer.offsetHeight;
    let mainTopIndentHeight = window.getComputedStyle(document.querySelector('main')).paddingTop;
    let yIndent = `(100vh - ${headerHeight}px - ${requestContainerHeight}px - ${footerHeight}px) / 2 - ${mainTopIndentHeight}`;
    masterContainer.style.paddingTop = `calc(${yIndent})`;

    // Проверка выполнения входа
    let token = localStorage.getItem('token');

    if (token) {
        fetch('/prefetch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data.success) {
                    logInOutLink.textContent = 'Выход';
                    logInOutLink.addEventListener('click', function (e) {
                        e.preventDefault();
                        localStorage.removeItem('token');
                        window.location.href = 'index.html';
                    });
                    displayResults(data.transcripts);
                } else {
                    console.error('Invalid token.');
                    localStorage.removeItem('token');
                }
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
    } else {
        logInOutLink.textContent = 'Вход';
        logInOutLink.href = './login/login.html';
        sendBtn.disabled = true;
    }

    function validateToken(token) {
        return fetch('/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        })
            .then(function (res) {
                if (!res.ok) {
                    console.error('Invalid token.');
                }
                return res.json();
            })
            .then(function (data) {
                return data.success;
            })
            .catch(function (error) {
                console.error('Error validating token:', error);
                return false;
            })
    }

    // Открытие файлового диалога при клике на дроп-бокс
    dropBox.addEventListener('click', function () {
        fileInput.click();
    });

    // Обработка события перетаскивания файлов
    dropBox.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropBox.classList.add('dragover');
    });

    dropBox.addEventListener('dragleave', function () {
        dropBox.classList.remove('dragover');
    });

    dropBox.addEventListener('drop', function (e) {
        e.preventDefault();
        dropBox.classList.remove('dragover');
        files = e.dataTransfer.files;
        this.style.backgroundImage = 'none';
        this.textContent = 'Выбрано файлов: ' + files.length;
        token = localStorage.getItem('token');
        if (token) {
            validateToken(token).then(function (isValid) {
                if (isValid) {
                    sendBtn.disabled = false;
                } else {
                    sendBtn.disabled = true;
                    let newLink = logInOutLink.cloneNode(true);
                    newLink.href = './login/login.html';
                    newLink.textContent = 'Вход';
                    logInOutLink.replaceWith(newLink);
                    localStorage.removeItem('token');
                }
            });
        }
    });

    // Обработка выбора файлов через файловый диалог
    fileInput.addEventListener('change', function (e) {
        files = e.target.files;
        dropBox.style.backgroundImage = 'none';
        dropBox.textContent = 'Выбрано файлов: ' + files.length;
        token = localStorage.getItem('token');
        if (token) {
            validateToken(token).then(function (isValid) {
                if (isValid) {
                    sendBtn.disabled = false;
                } else {
                    sendBtn.disabled = true;
                    let newLink = logInOutLink.cloneNode(true);
                    newLink.href = './login/login.html';
                    newLink.textContent = 'Вход';
                    logInOutLink.replaceWith(newLink);
                    localStorage.removeItem('token');
                }
            });
        }
    });

    sendBtn.addEventListener('click', function () {
        if (!files) {
            alert('Пожалуйста, выберите файлы.');
            return;
        }
        uploadFiles(files);
        fileInput.value = null;
        files = [];
        dropBox.innerHTML = '';
        dropBox.style.backgroundImage = '';
        sendBtn.disabled = true;
    });

    function uploadFiles(files) {
        let data = new FormData();
        for (let file of files) {
            data.append('files', file);
        }
        if (language.value == 'en') {
            data.append('model', model.value + '.en');
        } else {
            data.append('model', model.value);
        }
        fetch('/upload', {
            method: 'POST',
            headers: {
                'Authorization': token
            },
            body: data
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                displayResults(data);
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
    }

    function displayResults(results) {
        results.forEach(function (result) {
            let resultInfo = document.createElement('tr');

            let translatedModel = Array.from(model.options).find(function (option) {
                return result.model.includes(option.value);
            }).text;

            resultInfo.innerHTML = `<td>${result.date}</td><td id="fileName">${result.file}</td><td>${translatedModel}</td>`;

            let viewBtn = document.createElement('button');
            viewBtn.id = 'viewBtn';
            let viewIcon = document.createElement('img');
            viewIcon.src = './images/view.png';
            viewIcon.style.height = '20px';
            viewIcon.classList.add('manageIcon');
            viewBtn.appendChild(viewIcon);
            viewBtn.style.marginRight = '7px';

            let downloadBtn = document.createElement('button');
            downloadBtn.id = 'downloadBtn';
            let downloadIcon = document.createElement('img');
            downloadIcon.src = './images/download.png';
            downloadIcon.style.height = '22px';
            downloadIcon.classList.add('manageIcon');
            downloadBtn.appendChild(downloadIcon);
            downloadBtn.style.marginRight = '7px';

            let deleteBtn = document.createElement('button');
            deleteBtn.id = 'deleteBtn';
            let deleteIcon = document.createElement('img');
            deleteIcon.src = './images/delete.png';
            deleteIcon.style.height = '22px';
            deleteIcon.classList.add('manageIcon');
            deleteBtn.appendChild(deleteIcon);

            let td = document.createElement('td');

            let btnContainer = document.createElement('div');
            btnContainer.id = 'btnContainer';
            btnContainer.style.textAlign = 'right';

            if (!result.error) {
                btnContainer.appendChild(viewBtn);
                btnContainer.appendChild(downloadBtn);
            }
            btnContainer.appendChild(deleteBtn);

            td.appendChild(btnContainer);
            resultInfo.appendChild(td);

            if (result.error) {
                resultInfo.classList.add('error');
            } else {
                resultInfo.classList.add('success');
            }

            tbody.appendChild(resultInfo);

            viewBtn.addEventListener('click', function () {
                let textToShow = result.transcript;
                let newTab = window.open();
                if (newTab) {
                    newTab.document.write('<div style="width: 100%;">' + textToShow + '</div>');
                    newTab.document.close();
                } else {
                    alert('Не удалось открыть новое окно. Пожалуйста, проверьте настройки браузера.');
                }
            });

            downloadBtn.addEventListener('click', function () {
                let blob = new Blob([result.transcript], { type: 'text/plain' });
                let url = URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = `${result.file.split('.')[0]}.txt`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });

            deleteBtn.addEventListener('click', function () {
                fetch('/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({
                        id: result.id
                    })
                })
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        if (data.success) {
                            tbody.removeChild(resultInfo);
                            if (!document.querySelectorAll('#resultsTable tbody tr').length) {
                                responseContainer.style.display = 'none';
                            }
                        }
                    })
                    .catch(function (error) {
                        console.error('Error:', error);
                    });
            });
        });
        if (results.length) {
            responseContainer.style.display = '';
        }
    }

    language.addEventListener('change', function () {
        if (this.value == 'en') {
            model.querySelector('option[value="large"]').disabled = true;
            model.querySelector('option[value="turbo"]').disabled = true;
            if (model.value == 'large' || model.value == 'turbo') {
                model.value = 'medium';
            }
        } else {
            model.querySelector('option[value="large"]').disabled = false;
            model.querySelector('option[value="turbo"]').disabled = false;
        }
    });

    language.dispatchEvent(new Event('change'));
});