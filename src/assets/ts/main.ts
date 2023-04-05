// Store theme color data
let originalThemeColors: Array<string> = []

class Theme {
    private readonly _fallbackTheme = 'dark'

    /**
     * Gather current theme
     * @method _get
     * @returns {string}
     */
    public get(): string | null {
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
                return this._fallbackTheme
            }
        } else {
            return this._fallbackTheme
        }
    }

    /**
     * Set theme
     * @method set
     * @returns {string}
     */
    public set(): void {
        let _nextTheme: string = ''
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
    NONE,
}

// FAB state types
enum fabStates {
    SHOW,
    HIDE,
    NONE,
}

class UIController {
    // Manage header state
    private _headerPast = window.scrollY
    private _headerActive = false
    private _headerState = headerStates.NONE
    private _headerPresent = true

    /**
     * Controls header state
     * @method header
     * @returns {void}
     */
    public header(): void {
        if (!this._headerPresent) return
        if (this.overscrollDeadZone()) return

        let headerEle = document.getElementsByTagName('header')[0]

        if (typeof headerEle === 'undefined') {
            alert("nahhh you didn't just remove the header 💀")
            console.error(
                'Header not present on page -- disabled UI header controller'
            )
            this._headerPresent = false
            return
        }

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
    private _fabActive = false
    private _fabState = fabStates.NONE
    private _fabPresent = true

    /**
     * Controls FAB (floating action button) state
     * @method fab
     * @returns {void}
     */
    public fab(): void {
        if (!this._fabPresent) return

        let fabEle = document.getElementsByClassName('fab-scroll')[0]

        if (typeof fabEle === 'undefined') {
            console.error(
                'FAB not present on page -- disabled UI FAB controller'
            )
            this._fabPresent = false
            return
        }

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
    public scroll(ele: string): void {
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
    public offset(ele: HTMLElement): OffsetProps {
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

    /**
     * Determine the dead zone to use when overscrolling (Safari-specific quirk)
     * @method overscrollDeadZone
     * @returns {boolean}
     */
    private overscrollDeadZone(): boolean {
        let result = true
        let deadZone = 0

        let currentPosition = window.scrollY
        let overallHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight

        let difference = overallHeight - currentPosition

        /**
         * MDN deems navigator.platform deprecated and instead is in favour of
         * NavigatorUAData.platform, which frankly is just ridiculous
         * as it's only supported in chromium-based browsers
         * (I get that there are a lot of those sort of browsers around, but
         * it doesn't mean that other web engines don't exist).
         */
        let platformType = window.navigator.platform ?? ''
        if (platformType === 'iPhone') {
            deadZone = 110
        }

        if (difference > deadZone) {
            result = false
        }

        return result
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
    public create(event: InputHybridEvent): void {
        event.preventDefault()

        const _button = event.currentTarget as HTMLElement

        const _circle = document.createElement('span')
        const _diameter = Math.max(_button.clientWidth, _button.clientHeight)
        const _radius = _diameter / 2

        let _inputKeyboard = false

        let _inputDetail = event.detail
        let _inputPointerId = event.pointerId
        // Imagine if Firefox paid attention to standards
        let _inputMozSrc = event.mozInputSource

        if (typeof event.pageX === 'undefined') {
            event.pageX = 0
        }

        if (typeof event.pageY === 'undefined') {
            event.pageY = 0
        }

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

        _button.appendChild(_circle)

        let _targetClass = _button.classList.item(0)

        setTimeout(function () {
            switch (_targetClass) {
                case 'card':
                case 'button-link':
                    location.href = _button.getAttribute('href') ?? ''
                    break
                case 'fab-scroll':
                    uiController.scroll('body')
                    break
                case 'theme-invert':
                    theme.set()
                    break
            }

            // Clean up ripples
            document.querySelectorAll('.ripple').forEach(function (ele) {
                ele.remove()
            })
        }, 350)
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
    private audioGen(frequency: number, type: OscillatorType): void {
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

    private payload = (): void => {
        this.audioGen(87.31, 'triangle')

        var audioController = new Audio('data/bg_audio.mp3')
        audioController.volume = 0.5
        setTimeout(function () {
            audioController.play()
        }, 1000)
    }

    private _pressedKeys: string

    /**
     * Easter egg -- wait, this shouldn't be documented...
     * @method init
     * @param event {KeyboardEvent} Event information from the keyboard
     * @returns {void}
     */
    public init = (event: KeyboardEvent): void => {
        var eventKeyData: string = event.key
        if (eventKeyData.length === 1) {
            eventKeyData = event.key.toUpperCase()
        }
        this._pressedKeys += eventKeyData
        if (
            this._pressedKeys.match(
                /ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightBAEnter$/g
            )
        ) {
            document.removeEventListener('keydown', this.init)
            this.payload()
        }
    }
}

const egg = new Egg()

class SplashMsg {
    // List of messages to potentially go with by random
    // Slight technical details, roasts, and (internet cultural) references.
    private splashList: Array<string> = [
        // General commentary
        'Wow, how modern',
        'Light theme inadvertently looks better than dark',
        'Admiring the auto-hiding header',
        'Seamless theme transition',
        // Web services
        'It works!',
        'Proudly served by Nginx',
        // Transport cryptography
        'gTLD naturally HTTPS enforced',
        "Transport secured with Let's Encrypt and best practices",
        // Cloud services
        '🇫🇷 Hébergé en Fr*nce 🇫🇷',
        'ARM inside',
        'Accessible through IPv6',
        // DNS services
        'DNS anycasted with over 30 POPs',
        "It's not always DNS",
        // Programming
        'Can\'t spell "PowerShell" without "hell"',
        'Electron is why computers need more resources these days',
        // Programming but with JavaScript
        'Don\'t ask JavaScript what "[] + {}" and "{} + []" are equal to',
        'JavaScript has the "completely detached from reality" type system',
        'JavaScript modules: including unnecessary modules of their ' +
            'own such as "is-odd"',
        'For every JavaScript problem that is encountered, ' +
            'a new JavaScript framework is made',
        // Programming but with Rust
        'Rust? Programming socks and Blåhaj at the ready',
        '🦀 Rustaceans, assemble 🦀',
        '"Did you know that Rust is memory safe?," ' +
            'the Rust dev asked the JavaScript dev',
        // Tech tips
        'Placing user input into a LIKE SQL query as a field string?' +
            '<br>' +
            'Escape the wildcard (%), unless you intend ' +
            'for the user to.. well.. use it',
        'Modern web search engines support search operators ' +
            'that can help narrow down specific results',
        // Functionality
        'Entirely keyboard navigable? As standard',
        'JavaScript not required, unlike some websites',
        'I can neither confirm or deny to there being an easter egg',
        // Browsers & web engines
        'Chrome: I can use so much RAM' + '<br>' + 'Firefox: Hold my beer',
        'Edge is just as bad as Chrome',
        'Opera ""free"" ""VPN""',
        'There is no escape from Chromium',
        // Knowledge
        'Sometimes, the cost of knowledge is to also ' +
            'carry the weight of cursed knowledge',
        // Digital art / image editing
        'Oops, wrong layer',
        // Operating systems
        '.DS_Store my beloved',
        'Windows try to not maintain impractical amounts of backwards ' +
            "compatibility at the user's expense (instant fail)",
        'Is it the year of Linux on desktop yet?',
        'btw i use arch',
    ]

    constructor() {
        if (theme.get() === 'light') {
            this.splashList.push('A decent light theme')
        }
    }

    /**
     * Pick out a random string from the `msgList` array
     * @method getRand
     * @returns {string}
     */
    private getRand(): string {
        let res = ''
        res = this.splashList[(Math.random() * this.splashList.length) | 0]
        return res
    }

    /**
     * Set a message as the splash message
     * @method set
     * @returns {void}
     */
    public set(): void {
        let initDes = document.getElementsByClassName('splash-des')
        if (initDes.length === 0) return
        initDes[0].innerHTML = this.getRand()
    }
}

const splashMsg = new SplashMsg()

window.onload = function () {
    // Set initial random message
    splashMsg.set()

    // Set up listener
    document.querySelectorAll(ripple.selector).forEach(function (ele) {
        ele.addEventListener('click', ripple.create)
    })

    // Build list of themes
    document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach(function (ele) {
            originalThemeColors.push(ele.getAttribute('content') ?? '')
        })

    // Initiate and listen to header & FAB
    uiController.header()
    uiController.fab()
    window.onscroll = function () {
        uiController.header()
        uiController.fab()
    }

    // Unhide option if there is JavaScript enabled
    document.querySelectorAll('.theme-invert').forEach(function (ele) {
        ele.classList.remove('hide')
    })

    document.addEventListener('keydown', egg.init)
}
