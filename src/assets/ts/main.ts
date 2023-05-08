// Store theme color data
let themeOriginalColors: string[] = []

interface NodeExt extends Node {
    getAttribute: Function
}

class Theme {
    private readonly themeDefault: string = 'dark'
    private readonly schemeDark: string = '(prefers-color-scheme: dark)'
    private readonly schemeLight: string = '(prefers-color-scheme: light)'

    /**
     * Gather current theme
     * @method get
     * @returns {string}
     */
    public get(): string {
        if (document.documentElement.hasAttribute('color-scheme')) {
            return document.documentElement.getAttribute('color-scheme')
        } else if (window.matchMedia) {
            if (window.matchMedia(this.schemeDark).matches) {
                return 'dark'
            } else if (window.matchMedia(this.schemeLight).matches) {
                return 'light'
            } else {
                return this.themeDefault
            }
        } else {
            return this.themeDefault
        }
    }

    /**
     * Set theme
     * @method set
     * @returns {string}
     */
    public set(): void {
        let themeNext: string
        let themeAuto: boolean = false
        let themeCurrent: string = this.get()

        if (themeCurrent === 'dark') {
            themeNext = 'light'
        } else if (themeCurrent === 'light') {
            themeNext = 'dark'
        }

        if (window.matchMedia) {
            if (
                window.matchMedia(this.schemeDark).matches &&
                themeNext === 'dark'
            ) {
                document.documentElement.removeAttribute('color-scheme')
                themeAuto = true
            } else if (
                window.matchMedia(this.schemeLight).matches &&
                themeNext === 'light'
            ) {
                document.documentElement.removeAttribute('color-scheme')
                themeAuto = true
            }

            if (themeAuto) {
                let themeIndex: number = 0
                let themeData: string
                document
                    .querySelectorAll('meta[name="theme-color"]')
                    .forEach(function (ele) {
                        themeData = themeOriginalColors[themeIndex]
                        ele.setAttribute('content', themeData)
                        themeIndex++
                    })
            }
        }

        if (!themeAuto) {
            let themeColor: string
            let themeIndex: number

            if (themeNext === 'dark') {
                themeIndex = 0
            } else if (themeNext === 'light') {
                themeIndex = 1
            }

            document.documentElement.setAttribute('color-scheme', themeNext)
            themeColor = themeOriginalColors[themeIndex]

            document
                .querySelectorAll('meta[name="theme-color"]')
                .forEach(function (ele) {
                    ele.setAttribute('content', themeColor)
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
    private headerDeadZone: number = 50

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
            // Show header if scrolling up
            this.headerPast = window.scrollY
            if (this.headerState !== headerStates.SHOW) {
                this.headerState = headerStates.SHOW
                headerEle.classList.remove('hide')
                this.headerActive = true
            }
        } else if (
            this.headerActive &&
            window.scrollY > this.headerDeadZone &&
            window.scrollY > this.headerPast
        ) {
            // Hide header if scrolling down beyond the header dead zone
            if (this.headerState !== headerStates.HIDE) {
                this.headerState = headerStates.HIDE
                headerEle.classList.add('hide')
                this.headerActive = false
            }
        } else if (!this.headerActive && window.scrollY > 0) {
            // Hide header if it should be hidden after page load
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
     * @param element {HTMLElement} HTML element
     * @returns {OffsetProps}
     */
    public offset(element: HTMLElement): OffsetProps {
        let rectBounding: DOMRect = element.getBoundingClientRect()
        let scrollLeft: number =
            window.pageXOffset || document.documentElement.scrollLeft
        let scrollTop: number =
            window.pageYOffset || document.documentElement.scrollTop

        return {
            top: rectBounding.top + scrollTop,
            left: rectBounding.left + scrollLeft,
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

        const buttonElement = event.currentTarget as HTMLElement

        const rippleElement: HTMLSpanElement = document.createElement('span')
        const diameter: number = Math.max(
            buttonElement.clientWidth,
            buttonElement.clientHeight
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

        let browserFirefox: boolean =
            typeof inputMozSrc !== 'undefined' && inputMozSrc === 6
        let browserNormal: boolean = inputPointerId === -1 && inputDetail === 0

        if (browserFirefox || browserNormal) {
            inputKeyboard = true
        }

        rippleElement.style.width = rippleElement.style.height =
            diameter.toString() + 'px'

        if (!inputKeyboard) {
            rippleElement.style.left =
                (
                    event.pageX.valueOf() -
                    buttonElement.offsetLeft -
                    radius
                ).toString() + 'px'
            rippleElement.style.top =
                (
                    event.pageY.valueOf() -
                    uiController.offset(buttonElement).top -
                    radius
                ).toString() + 'px'
        } else {
            rippleElement.style.left = '0px'
            rippleElement.style.top = '0px'
        }

        rippleElement.classList.add('ripple')

        buttonElement.appendChild(rippleElement)

        let targetClass: string = buttonElement.classList.item(0)

        setTimeout(function (): void {
            switch (targetClass) {
                case 'card':
                case 'button-link':
                    location.href = buttonElement.getAttribute('href') ?? ''
                    break
                case 'theme-invert':
                    theme.set()
                    break
            }

            // Clean up ripples
            document
                .querySelectorAll('.ripple')
                .forEach(function (ele: Element): void {
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
    private audioGen(): void {
        let context: AudioContext = new AudioContext()
        let oscillator: OscillatorNode = context.createOscillator()
        let gain: GainNode = context.createGain()

        oscillator.type = 'triangle'
        oscillator.connect(gain)
        oscillator.frequency.value = 90
        gain.connect(context.destination)
        oscillator.start(0)

        gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 1)
    }

    private payload = (): void => {
        this.audioGen()

        let audioController: HTMLAudioElement = new Audio('data/bg_audio.mp3')
        audioController.volume = 0.5
        setTimeout(function (): void {
            audioController.play()
        }, 1000)
    }

    private keysPressed: string[] = []

    /**
     * Easter egg -- wait, this shouldn't be documented...
     * @method init
     * @param event {KeyboardEvent} Event information from the keyboard
     * @returns {void}
     */
    public init = (event: KeyboardEvent): void => {
        let keyEventData: string = event.key
        if (keyEventData.length === 1) {
            keyEventData = event.key.toUpperCase()
        }

        let keysCombo: string[] = [
            'ArrowUp',
            'ArrowUp',
            'ArrowDown',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'ArrowLeft',
            'ArrowRight',
            'B',
            'A',
            'Enter',
        ]

        this.keysPressed.push(keyEventData)

        let indexMatch: string = keysCombo[this.keysPressed.length - 1]

        if (typeof indexMatch === 'undefined' || indexMatch !== keyEventData) {
            this.keysPressed = []
            return
        }

        let keysPressedCombined: string = this.keysPressed.join('')
        let keysComboCombined: string = keysCombo.join('')

        if (keysPressedCombined.match(keysComboCombined)) {
            this.keysPressed = []
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
        let dialogMain: HTMLDialogElement = document.querySelector('dialog')

        let dialogTitle: string = ele.innerHTML
        let dialogDetails: string = ele.title
        if (dialogDetails !== '') {
            dialogDetails = dialogDetails.replaceAll('"', '&quot;')
            dialogDetails = dialogDetails.replaceAll('\n', '<br>')
        } else {
            dialogDetails = 'No details currently available for this entry'
        }
        dialogMain.getElementsByClassName('header')[0].innerHTML = dialogTitle
        dialogMain.getElementsByClassName('body')[0].innerHTML = dialogDetails

        dialogMain.showModal()

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

        let dialogMain: HTMLDialogElement = document.querySelector('dialog')
        dialogMain.close()
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
            themeOriginalColors.push(ele.getAttribute('content') ?? '')
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
