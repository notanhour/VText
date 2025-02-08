'use strict';

document.addEventListener('DOMContentLoaded', function () {
    let headerWidth = document.querySelector('header').offsetWidth;
    let titleWidth = document.querySelector('h1').offsetWidth;
    let xIndent = `(100vw - ${titleWidth}px) / 2`;
    document.querySelector('header').style.paddingLeft = `calc(${xIndent})`;

    let headerHeight = document.querySelector('header').offsetHeight;
    let footerHeight = document.querySelector('footer').offsetHeight;
    let helpContainerHeight = helpContainer.offsetHeight;
    let mainTopIndentHeight = window.getComputedStyle(document.querySelector('main')).paddingTop;
    let yIndent = `(100vh - ${headerHeight}px - ${footerHeight}px - ${helpContainerHeight}px) / 2 - ${mainTopIndentHeight}`;
    helpContainer.style.paddingTop = `calc(${yIndent})`;
});