/**
 * Smooth scroll transition
 * @method scrollAnimate
 * @param ele {string} HTML element ID or query
 * @returns {void}
 */
function scrollAnimate(ele: string): void {
    let eleObj = document.getElementById(ele)
        ?? document.querySelector(ele)
        ?? null;
    if (eleObj === null) {
        console.error(
            'Attempted to scroll to element that does not exist: ' + ele
        );
    } else {
        window.scrollTo({
            top: eleObj.offsetTop,
            behavior: 'smooth'
        });
    }
}

interface OffsetProps {
    top: number;
    left: number;
}

/**
 * Determine offsets of element
 * @method offset
 * @param ele {HTMLElement} HTML element
 * @returns {OffsetProps}
 */
function offset(ele: HTMLElement): OffsetProps {
    let rect = ele.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft
    }
}

// Manage header state
let headerActive = false;
let headerPast = window.scrollY;

// Header state types
enum headerStates {
    SHOW,
    HIDE,
    ONLOAD,
    NULL
}

let headerState = headerStates.NULL;

/**
 * Controls header state
 * @method headerController
 * @returns {void}
 */
function headerController(): void {
    let headerEle = document.getElementsByTagName('header')[0];
    if (!headerActive && window.scrollY <= headerPast) {
        headerPast = window.scrollY;
        if (headerState !== headerStates.SHOW) {
            headerState = headerStates.SHOW;
            headerEle.classList.remove('hide');
            headerActive = true;
        }
    } else if (headerActive && window.scrollY > 50
        && window.scrollY > headerPast) {
        if (headerState !== headerStates.HIDE) {
            headerState = headerStates.HIDE;
            headerEle.classList.add('hide');
            headerActive = false;
        }
    } else if (!headerActive && window.scrollY > 0) {
        if (headerState !== headerStates.ONLOAD) {
            headerState = headerStates.ONLOAD;
            headerEle.classList.add('hide');
        }
    }
    headerPast = window.scrollY;
}

// Initiate FAB state
let fabActive = false;
const fabZone = 200;

// FAB state types
enum fabStates {
    SHOW,
    HIDE,
    NULL
}

let fabState = fabStates.NULL;

/**
 * Controls FAB (floating action button) state
 * @method fabController
 * @returns {void}
 */
function fabController(): void {
    let fabEle = document.getElementsByClassName('fab-scroll')[0];
    if (fabActive && window.scrollY <= fabZone) {
        if (fabState === fabStates.HIDE) return;
        fabEle.classList.add('hide');
        fabActive = false;
    } else if (!fabActive && window.scrollY > fabZone) {
        if (fabState === fabStates.SHOW) return;
        fabEle.classList.remove('hide');
        fabActive = true;
    }
}

let pressedKeys: string;

/**
 * Easter egg -- wait, this shouldn't be documented...
 * @method eggTrip
 * @param event {KeyboardEvent} Event information from the keyboard
 * @returns {void}
 */
function eggTrip(event: KeyboardEvent): void {
    pressedKeys += event.code;
    if (pressedKeys.match(/ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightKeyBKeyAEnter$/g)) {
        document.removeEventListener('keydown', eggTrip);
        console.log('do something fancy');
    }
}

// Create an interface that allows mouse, touch and keyboard properties
interface InputHybridEvent {
    preventDefault: Function;
    currentTarget: Object;
    detail?: Number;
    pointerId?: Number;
    mozInputSource?: Number;
    pageX?: Number;
    pageY?: Number;
}

/**
 * Create ripple effect
 * @method createRipple
 * @param event {InputHybridEvent} Mouse, keyboard and touch input event
 * @returns {void}
 */
function createRipple(event: InputHybridEvent): void {
    event.preventDefault();

    const button = event.currentTarget as HTMLElement;

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    let inputKeyboard = false;

    let inputDetail = event.detail;
    let inputPointerId = event.pointerId;
    let inputMozSrc = event.mozInputSource;

    if (typeof inputMozSrc !== 'undefined' && inputMozSrc === 6 ||
        inputPointerId === -1 && inputDetail === 0) {
        inputKeyboard = true;
    }

    circle.style.width = circle.style.height = `${diameter}px`;
    if (!inputKeyboard) {
        circle.style.left = `${+event.pageX - button.offsetLeft - radius}px`;
        circle.style.top = `${+event.pageY - offset(button).top - radius}px`;
    } else {
        circle.style.left = '0px';
        circle.style.top = '0px';
    }

    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple');
    var rippleEle = ripple[ripple.length - 1];

    if (rippleEle) {
        rippleEle.remove();
    }

    button.appendChild(circle);

    let targetClass = button.classList.item(0);

    setTimeout(function () {
        switch (targetClass) {
            case 'card':
            case 'button-link':
                location.href = button.getAttribute('href');
                break;
            case 'fab-scroll':
                scrollAnimate('body');
                break;
        }
    }, 400);
}


window.onload = function () {
    document.querySelectorAll('.fab-scroll, .button-link, .card')
        .forEach(function (ele) {
            ele.addEventListener('click', createRipple);
        });

    // Initiate and listen to header & FAB
    headerController();
    fabController();
    window.onscroll = function () {
        headerController();
        fabController();
    }

    document.addEventListener('keydown', eggTrip);
}