// Store theme color data
let originalThemeColors: Array<string> = []

class Theme {
    /**
     * Gather current theme
     * @method _get
     * @returns {string}
     */
    get(): string {
        let _fallbackTheme = 'dark'

        if (document.documentElement.hasAttribute('color-scheme')) {
            return document.documentElement.getAttribute('color-scheme')
        } else if (window.matchMedia) {
            let _schemeDark = '(prefers-color-scheme: dark)'
            let _schemeLight = '(prefers-color-scheme: light)'
            if (window.matchMedia(_schemeDark).matches) {
                return 'dark'
            } else if (window.matchMedia(_schemeLight).matches) {
                return 'light'
            } else {
                return _fallbackTheme
            }
        } else {
            return _fallbackTheme
        }
    }

    /**
     * Set theme
     * @method set
     * @returns {string}
     */
    set(): void {
        let _nextTheme: string
        let _autoTheme = false
        let _currentTheme = this.get()

        if (_currentTheme === 'dark') {
            _nextTheme = 'light'
        } else if (_currentTheme === 'light') {
            _nextTheme = 'dark'
        }

        if (window.matchMedia) {
            let _schemeDark = '(prefers-color-scheme: dark)'
            let _schemeLight = '(prefers-color-scheme: light)'
            if (
                window.matchMedia(_schemeDark).matches &&
                _nextTheme === 'dark'
            ) {
                document.documentElement.removeAttribute('color-scheme')
                _autoTheme = true
            } else if (
                window.matchMedia(_schemeLight).matches &&
                _nextTheme === 'light'
            ) {
                document.documentElement.removeAttribute('color-scheme')
                _autoTheme = true
            }

            if (_autoTheme) {
                let _themeIndex = 0
                let _themeData: string
                document
                    .querySelectorAll('meta[name="theme-color"]')
                    .forEach(function (ele) {
                        _themeData = originalThemeColors[_themeIndex]
                        ele.setAttribute('content', _themeData)
                        _themeIndex++
                    })
            }
        }

        if (!_autoTheme) {
            let _colorTheme: string
            if (_nextTheme === 'dark') {
                document.documentElement.setAttribute('color-scheme', 'dark')
                _colorTheme = originalThemeColors[0]
            } else if (_nextTheme === 'light') {
                document.documentElement.setAttribute('color-scheme', 'light')
                _colorTheme = originalThemeColors[1]
            }
            document
                .querySelectorAll('meta[name="theme-color"]')
                .forEach(function (ele) {
                    ele.setAttribute('content', _colorTheme)
                })
        }
    }
}

const theme = new Theme()

// Header state types
enum headerStates {
    SHOW,
    HIDE,
    ONLOAD,
    NULL,
}

// FAB state types
enum fabStates {
    SHOW,
    HIDE,
    NULL,
}

class UIController {
    // Manage header state
    _headerPast = window.scrollY
    _headerActive = false
    _headerState = headerStates.NULL

    /**
     * Controls header state
     * @method header
     * @returns {void}
     */
    header(): void {
        let headerEle = document.getElementsByTagName('header')[0]
        if (!this._headerActive && window.scrollY <= this._headerPast) {
            this._headerPast = window.scrollY
            if (this._headerState !== headerStates.SHOW) {
                this._headerState = headerStates.SHOW
                headerEle.classList.remove('hide')
                this._headerActive = true
            }
        } else if (
            this._headerActive &&
            window.scrollY > 50 &&
            window.scrollY > this._headerPast
        ) {
            if (this._headerState !== headerStates.HIDE) {
                this._headerState = headerStates.HIDE
                headerEle.classList.add('hide')
                this._headerActive = false
            }
        } else if (!this._headerActive && window.scrollY > 0) {
            if (this._headerState !== headerStates.ONLOAD) {
                this._headerState = headerStates.ONLOAD
                headerEle.classList.add('hide')
            }
        }
        this._headerPast = window.scrollY
    }

    // Initiate FAB state
    readonly _fabZone = 200
    _fabActive = false
    _fabState = fabStates.NULL

    /**
     * Controls FAB (floating action button) state
     * @method fab
     * @returns {void}
     */
    fab(): void {
        let fabEle = document.getElementsByClassName('fab-scroll')[0]
        if (this._fabActive && window.scrollY <= this._fabZone) {
            if (this._fabState === fabStates.HIDE) return
            fabEle.classList.add('hide')
            this._fabActive = false
        } else if (!this._fabActive && window.scrollY > this._fabZone) {
            if (this._fabState === fabStates.SHOW) return
            fabEle.classList.remove('hide')
            this._fabActive = true
        }
    }

    /**
     * Smooth scroll transition
     * @method scroll
     * @param ele {string} HTML element ID or query selector
     * @returns {void}
     */
    scroll(ele: string): void {
        let reduceMotion: boolean =
            !!window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion)').matches
        let scrollBehavior: ScrollBehavior
        let eleObj =
            document.getElementById(ele) ?? document.querySelector(ele) ?? null
        if (eleObj === null) {
            console.error(
                'Attempted to scroll to element that does not exist: ' + ele
            )
        } else {
            scrollBehavior = reduceMotion
                ? ('instant' as ScrollBehavior)
                : ('smooth' as ScrollBehavior)

            window.scrollTo({
                top: eleObj.offsetTop,
                behavior: scrollBehavior,
            })
        }
    }

    /**
     * Determine offsets of element
     * @method offset
     * @param ele {HTMLElement} HTML element
     * @returns {OffsetProps}
     */
    offset(ele: HTMLElement): OffsetProps {
        let _rect = ele.getBoundingClientRect(),
            _scrollLeft =
                window.pageXOffset || document.documentElement.scrollLeft,
            _scrollTop =
                window.pageYOffset || document.documentElement.scrollTop
        return {
            top: _rect.top + _scrollTop,
            left: _rect.left + _scrollLeft,
        }
    }
}

const uiController = new UIController()

// Offset property types
interface OffsetProps {
    top: number
    left: number
}

// Create an interface that allows mouse, touch and keyboard properties
interface InputHybridEvent {
    preventDefault: Function
    currentTarget: Object
    detail?: Number
    pointerId?: Number
    mozInputSource?: Number
    pageX?: Number
    pageY?: Number
}

class Ripple {
    readonly selector = '.fab-scroll, .button-link, .card, .theme-invert'

    /**
     * Create ripple effect
     * @method create
     * @param event {InputHybridEvent} Mouse, keyboard and touch input event
     * @returns {void}
     */
    create(event: InputHybridEvent): void {
        event.preventDefault()

        const _button = event.currentTarget as HTMLElement

        const _circle = document.createElement('span')
        const _diameter = Math.max(_button.clientWidth, _button.clientHeight)
        const _radius = _diameter / 2

        let _inputKeyboard = false

        let _inputDetail = event.detail
        let _inputPointerId = event.pointerId
        let _inputMozSrc = event.mozInputSource

        if (
            (typeof _inputMozSrc !== 'undefined' && _inputMozSrc === 6) ||
            (_inputPointerId === -1 && _inputDetail === 0)
        ) {
            _inputKeyboard = true
        }

        _circle.style.width = _circle.style.height = `${_diameter}px`
        if (!_inputKeyboard) {
            _circle.style.left = `${
                +event.pageX - _button.offsetLeft - _radius
            }px`
            _circle.style.top =
                (
                    +event.pageY -
                    uiController.offset(_button).top -
                    _radius
                ).toString() + 'px'
        } else {
            _circle.style.left = '0px'
            _circle.style.top = '0px'
        }

        _circle.classList.add('ripple')

        const _ripple = _button.getElementsByClassName('ripple')
        let _rippleEle = _ripple[_ripple.length - 1]

        if (_rippleEle) {
            _rippleEle.remove()
        }

        _button.appendChild(_circle)

        let _targetClass = _button.classList.item(0)

        setTimeout(function () {
            switch (_targetClass) {
                case 'card':
                case 'button-link':
                    location.href = _button.getAttribute('href')
                    break
                case 'fab-scroll':
                    uiController.scroll('body')
                    break
                case 'theme-invert':
                    theme.set()
                    break
            }
        }, 400)
    }
}

const ripple = new Ripple()

class Egg {
    /**
     * Generate audio
     * @method audioGen
     * @param frequency {number} Frequency to be used
     * @param type {OscillatorType} Oscillator to use
     * @returns {void}
     */
    audioGen(frequency: number, type: OscillatorType): void {
        let context: AudioContext = new AudioContext()
        let oscillator = context.createOscillator()
        let gain = context.createGain()
        oscillator.type = type
        oscillator.connect(gain)
        oscillator.frequency.value = frequency
        gain.connect(context.destination)
        oscillator.start(0)

        gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 1)
    }

    payload = (): void => {
        console.log('do something fancy')
        this.audioGen(87.31, 'triangle')
    }

    _pressedKeys: string

    /**
     * Easter egg -- wait, this shouldn't be documented...
     * @method init
     * @param event {KeyboardEvent} Event information from the keyboard
     * @returns {void}
     */
    init = (event: KeyboardEvent): void => {
        this._pressedKeys += event.code
        if (
            this._pressedKeys.match(
                /ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightKeyBKeyAEnter$/g
            )
        ) {
            document.removeEventListener('keydown', this.init)
            this.payload()
        }
    }
}

const egg = new Egg()

class InitMsg {
    // List of messages to potentially go with by random
    msgList: Array<string> = [
        'Wow. How modern.',
        'It works!',
        'Hosted within LXC under Proxmox.',
        'Proudly served by NGINX.',
        'Cloudflare is fine, I guess.',
        'TypeScript is what JavaScript should have become.',
        'I wonder what this button does...',
        'I can neither confirm or deny to there being an easter egg.',
        'Something something NFTs.',
        '"Web3", as defined by the delusional, really is not the future.',
        'Buy high, sell low.',
    ]

    constructor() {
        if (theme.get() === 'light') {
            this.msgList.push("Ooh, I'm blinded by the lights...")
        }
    }

    /**
     * Pick out a random string from the `msgList` array
     * @method getRand
     * @returns {string}
     */
    getRand(): string {
        let res = ''
        res = this.msgList[(Math.random() * this.msgList.length) | 0]
        return res
    }

    /**
     * Set a message as the initial message
     * @method setDat
     * @param message {string} Message data
     * @returns {void}
     */
    setDat(message: string): void {
        let initDes = document.getElementsByClassName('title-des')
        if (initDes.length < 1) return
        initDes[0].innerHTML = message
    }
}

const initMsg = new InitMsg()

window.onload = function () {
    // Set initial random message
    initMsg.setDat(initMsg.getRand())

    // Set up listener
    document.querySelectorAll(ripple.selector).forEach(function (ele) {
        ele.addEventListener('click', ripple.create)
    })

    // Build list of themes
    document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach(function (ele) {
            originalThemeColors.push(ele.getAttribute('content'))
        })

    // Initiate and listen to header & FAB
    uiController.header()
    uiController.fab()
    window.onscroll = function () {
        uiController.header()
        uiController.fab()
    }

    document.addEventListener('keydown', egg.init)
}
