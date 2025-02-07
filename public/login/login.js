'use strict';

document.addEventListener('DOMContentLoaded', function () {
    let headerWidth = document.querySelector('header').offsetWidth;
    let titleWidth = document.querySelector('h1').offsetWidth;
    let xIndent = `(100vw - ${titleWidth}px) / 2`;
    document.querySelector('header').style.paddingLeft = `calc(${xIndent})`;

    let headerHeight = document.querySelector('header').offsetHeight;
    let footerHeight = document.querySelector('footer').offsetHeight;
    let loginContainerHeight = loginContainer.offsetHeight;
    let mainTopIndentHeight = window.getComputedStyle(document.querySelector('main')).paddingTop;
    let yIndent = `(100vh - ${headerHeight}px - ${footerHeight}px - ${loginContainerHeight}px) / 2 - ${mainTopIndentHeight}`;
    loginContainer.style.paddingTop = `calc(${yIndent})`;

    loginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        authenticateUser('login');
    });

    signUpBtn.addEventListener('click', function (e) {
        e.preventDefault();
        authenticateUser('register');
    });

    function authenticateUser(action) {
        let username = document.querySelector('#username').value;
        let password = document.querySelector('#password').value;

        fetch(`/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data.success) {
                    if (action == 'login') {
                        localStorage.setItem('token', data.token);
                        window.location.href = '../index.html';
                    } else {
                        alert('Вы зарегистрировались. Теперь Вам доступен вход.');
                    }
                } else {
                    alert(data.message);
                }
            })
            .catch(function (error) {
                console.error('Error', error);
                alert('Ошибка при выполнении запроса. Попробуйте еще раз.');
            });
    }
});