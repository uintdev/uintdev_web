// Store theme color data
let originalThemeColors: string[] = []

interface NodeExt extends Node {
    getAttribute: Function
}

class Theme {
    private readonly fallbackTheme: string = 'dark'

    /**
     * Gather current theme
     * @method get
     * @returns {string}
     */
    public get(): string {
        if (document.documentElement.hasAttribute('color-scheme')) {
            return document.documentElement.getAttribute('color-scheme')
        } else if (window.matchMedia) {
            let _schemeDark: string = '(prefers-color-scheme: dark)'
            let _schemeLight: string = '(prefers-color-scheme: light)'
            if (window.matchMedia(_schemeDark).matches) {
                return 'dark'
            } else if (window.matchMedia(_schemeLight).matches) {
                return 'light'
            } else {
                return this.fallbackTheme
            }
        } else {
            return this.fallbackTheme
        }
    }

    /**
     * Set theme
     * @method set
     * @returns {string}
     */
    public set(): void {
        let nextTheme: string = ''
        let autoTheme: boolean = false
        let currentTheme: string = this.get()

        if (currentTheme === 'dark') {
            nextTheme = 'light'
        } else if (currentTheme === 'light') {
            nextTheme = 'dark'
        }

        if (window.matchMedia) {
            let schemeDark: string = '(prefers-color-scheme: dark)'
            let schemeLight: string = '(prefers-color-scheme: light)'
            if (window.matchMedia(schemeDark).matches && nextTheme === 'dark') {
                document.documentElement.removeAttribute('color-scheme')
                autoTheme = true
            } else if (
                window.matchMedia(schemeLight).matches &&
                nextTheme === 'light'
            ) {
                document.documentElement.removeAttribute('color-scheme')
                autoTheme = true
            }

            if (autoTheme) {
                let themeIndex: number = 0
                let themeData: string
                document
                    .querySelectorAll('meta[name="theme-color"]')
                    .forEach(function (ele) {
                        themeData = originalThemeColors[themeIndex]
                        ele.setAttribute('content', themeData)
                        themeIndex++
                    })
            }
        }

        if (!autoTheme) {
            let colorTheme: string
            if (nextTheme === 'dark') {
                document.documentElement.setAttribute('color-scheme', 'dark')
                colorTheme = originalThemeColors[0]
            } else if (nextTheme === 'light') {
                document.documentElement.setAttribute('color-scheme', 'light')
                colorTheme = originalThemeColors[1]
            }
            document
                .querySelectorAll('meta[name="theme-color"]')
                .forEach(function (ele) {
                    ele.setAttribute('content', colorTheme)
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

class UIController {
    // Manage header state
    private headerPast: number = window.scrollY
    private headerActive: boolean = false
    private headerState: headerStates = headerStates.NONE
    private headerPresent: boolean = true

    /**
     * Controls header state
     * @method header
     * @returns {void}
     */
    public header(): void {
        if (!this.headerPresent) return
        if (this.overscrollDeadZone()) return

        let headerEle: HTMLElement = document.getElementsByTagName('header')[0]

        if (typeof headerEle === 'undefined') {
            console.error('Header is gone -- disabled UI header controller')
            this.headerPresent = false
            return
        }

        if (!this.headerActive && window.scrollY <= this.headerPast) {
            this.headerPast = window.scrollY
            if (this.headerState !== headerStates.SHOW) {
                this.headerState = headerStates.SHOW
                headerEle.classList.remove('hide')
                this.headerActive = true
            }
        } else if (
            this.headerActive &&
            window.scrollY > 50 &&
            window.scrollY > this.headerPast
        ) {
            if (this.headerState !== headerStates.HIDE) {
                this.headerState = headerStates.HIDE
                headerEle.classList.add('hide')
                this.headerActive = false
            }
        } else if (!this.headerActive && window.scrollY > 0) {
            if (this.headerState !== headerStates.ONLOAD) {
                this.headerState = headerStates.ONLOAD
                headerEle.classList.add('hide')
            }
        }
        this.headerPast = window.scrollY
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
        let eleObj: HTMLElement =
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

    public scrollHander(event: Event) {
        event.preventDefault()
        this.scroll('body')
    }

    /**
     * Determine offsets of element
     * @method offset
     * @param ele {HTMLElement} HTML element
     * @returns {OffsetProps}
     */
    public offset(ele: HTMLElement): OffsetProps {
        let rect: DOMRect = ele.getBoundingClientRect()
        let scrollLeft: number =
            window.pageXOffset || document.documentElement.scrollLeft
        let scrollTop: number =
            window.pageYOffset || document.documentElement.scrollTop

        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft,
        }
    }

    /**
     * Determine the dead zone to use when overscrolling (Safari-specific quirk)
     * @method overscrollDeadZone
     * @returns {boolean}
     */
    private overscrollDeadZone(): boolean {
        let result: boolean = true
        let deadZone: number = 0

        let currentPosition: number = window.scrollY
        let overallHeight: number =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight

        let difference: number = overallHeight - currentPosition

        /**
         * MDN deems navigator.platform deprecated and instead is in favour of
         * NavigatorUAData.platform, which frankly is just ridiculous
         * as it's only supported in chromium-based browsers
         * (I get that there are a lot of those sort of browsers around, but
         * it doesn't mean that other web engines don't exist).
         */
        let platformType: string = window.navigator.platform ?? ''
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
    detail?: number
    pointerId?: number
    mozInputSource?: number
    pageX?: number
    pageY?: number
}

class Ripple {
    public readonly selector = '.fab-scroll, .button-link, .card, .theme-invert'

    /**
     * Create ripple effect
     * @method create
     * @param event {InputHybridEvent} Mouse, keyboard and touch input event
     * @returns {void}
     */
    public create(event: InputHybridEvent): void {
        event.preventDefault()

        const button = event.currentTarget as HTMLElement

        const circle: HTMLSpanElement = document.createElement('span')
        const diameter: number = Math.max(
            button.clientWidth,
            button.clientHeight
        )
        const radius: number = diameter / 2

        let inputKeyboard: boolean = false

        let inputDetail: number = event.detail
        let inputPointerId: number = event.pointerId
        // Imagine if Firefox paid attention to standards
        let inputMozSrc: number = event.mozInputSource

        if (typeof event.pageX === 'undefined') {
            event.pageX = 0
        }

        if (typeof event.pageY === 'undefined') {
            event.pageY = 0
        }

        let firefoxBrowser: boolean =
            typeof inputMozSrc !== 'undefined' && inputMozSrc === 6
        let normalBrowser: boolean = inputPointerId === -1 && inputDetail === 0

        if (firefoxBrowser || normalBrowser) {
            inputKeyboard = true
        }

        circle.style.width = circle.style.height = diameter.toString() + 'px'

        if (!inputKeyboard) {
            circle.style.left =
                (
                    event.pageX.valueOf() -
                    button.offsetLeft -
                    radius
                ).toString() + 'px'
            circle.style.top =
                (
                    event.pageY.valueOf() -
                    uiController.offset(button).top -
                    radius
                ).toString() + 'px'
        } else {
            circle.style.left = '0px'
            circle.style.top = '0px'
        }

        circle.classList.add('ripple')

        button.appendChild(circle)

        let targetClass: string = button.classList.item(0)

        setTimeout(function (): void {
            switch (targetClass) {
                case 'card':
                case 'button-link':
                    location.href = button.getAttribute('href') ?? ''
                    break
                case 'theme-invert':
                    theme.set()
                    break
            }

            // Clean up ripples
            document.querySelectorAll('.ripple').forEach(function (ele): void {
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
        let oscillator: OscillatorNode = context.createOscillator()
        let gain: GainNode = context.createGain()

        oscillator.type = type
        oscillator.connect(gain)
        oscillator.frequency.value = frequency
        gain.connect(context.destination)
        oscillator.start(0)

        gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 1)
    }

    private payload = (): void => {
        this.audioGen(87.31, 'triangle')

        let audioController: HTMLAudioElement = new Audio('data/bg_audio.mp3')
        audioController.volume = 0.5
        setTimeout(function (): void {
            audioController.play()
        }, 1000)
    }

    private pressedKeys: string

    /**
     * Easter egg -- wait, this shouldn't be documented...
     * @method init
     * @param event {KeyboardEvent} Event information from the keyboard
     * @returns {void}
     */
    public init = (event: KeyboardEvent): void => {
        let eventKeyData: string = event.key
        if (eventKeyData.length === 1) {
            eventKeyData = event.key.toUpperCase()
        }
        this.pressedKeys += eventKeyData

        if (
            this.pressedKeys.match(
                /ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightBAEnter$/g
            )
        ) {
            document.removeEventListener('keydown', this.init)
            this.payload()
        }
    }
}

const egg = new Egg()

class DialogController {
    /**
     * Compose a dialog box
     * @method open
     * @param event {MouseEvent} Event
     * @param ele {HTMLElement} HTML element
     * @returns {void}
     */
    public open(event: MouseEvent, ele: HTMLElement): void {
        event.preventDefault()

        let dialogClose: HTMLElement = document.querySelector('dialog .close')
        let dialog: HTMLDialogElement = document.querySelector('dialog')

        let title: string = ele.innerHTML
        let details: string = ele.title
        if (details !== '') {
            details = details.replaceAll('"', '&quot;')
            details = details.replaceAll('\n', '<br>')
        } else {
            details = 'No details currently available for this entry'
        }
        dialog.getElementsByClassName('header')[0].innerHTML = title
        dialog.getElementsByClassName('body')[0].innerHTML = details

        dialog.showModal()

        /**
         * Avoid focusing on button by default
         * Yes, this doesn't work without setTimeout.
         * It seems as though asynchronous execution is what's allowing
         * for it to function as intended. Average browser behaviour.
         */
        setTimeout((): void => {
            dialogClose.blur()
        }, 0)
    }

    /**
     * Close dialog box
     * @method open
     * @param event {MouseEvent} Event
     * @returns {void}
     */
    public close(event: MouseEvent): void {
        event.preventDefault()

        let dialog: HTMLDialogElement = document.querySelector('dialog')
        dialog.close()
    }
}

const dialogController = new DialogController()

window.onload = function (): void {
    // Unhide option if there is JavaScript enabled
    document.querySelector('.theme-invert').classList.remove('hide')

    // Set up listener
    document.querySelectorAll(ripple.selector).forEach(function (ele) {
        ele.addEventListener('click', ripple.create)
    })

    // Build list of themes
    document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach(function (ele: NodeExt) {
            originalThemeColors.push(ele.getAttribute('content') ?? '')
        })

    // Initiate and listen to header
    uiController.header()
    window.onscroll = (): void => {
        uiController.header()
    }

    // Listen for title interaction, for scrolling up
    document
        .querySelector('header .title')
        .addEventListener('click', (event): void => {
            uiController.scrollHander(event)
        })

    // Listen for pill input
    document
        .querySelectorAll('.pill')
        .forEach(function (ele: HTMLElement): void {
            ele.addEventListener('click', (event): void => {
                dialogController.open(event, ele)
            })
        })

    // Allow dialog to be closed
    document
        .querySelector('dialog .close')
        .addEventListener('click', dialogController.close)

    document.addEventListener('keydown', egg.init)
}
