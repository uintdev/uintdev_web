// Store theme color data
let themeOriginalColors: string[] = []

interface NodeInterface extends Node {
    getAttribute: Function
}

class Theme {
    public readonly themeMeta = 'meta[name="theme-color"]'
    private readonly themeOverride = 'color-scheme'
    private readonly themeDark: string = 'dark'
    private readonly themeLight: string = 'light'
    private readonly themeDefault: string = this.themeDark
    private readonly schemeType: Function = (schemeColor: string) => {
        return '(prefers-color-scheme: ' + schemeColor + ')'
    }

    /**
     * Gather current theme
     * @method get
     * @returns {string}
     */
    private get(): string {
        let result: string
        if (document.documentElement.hasAttribute(this.themeOverride)) {
            result =
                document.documentElement.getAttribute(this.themeOverride) ??
                this.themeDefault
        } else if (window.matchMedia) {
            if (window.matchMedia(this.schemeType(this.themeDark)).matches) {
                result = this.themeDark
            } else if (
                window.matchMedia(this.schemeType(this.themeLight)).matches
            ) {
                result = this.themeLight
            } else {
                result = this.themeDefault
            }
        } else {
            result = this.themeDefault
        }

        return result
    }

    /**
     * Set theme
     * @method set
     * @returns {string}
     */
    public set(): void {
        let themeNext: string = 'unknown'
        let themeAuto: boolean = false
        let themeCurrent: string = this.get()

        if (themeCurrent === this.themeDark) {
            themeNext = this.themeLight
        } else if (themeCurrent === this.themeLight) {
            themeNext = this.themeDark
        }

        if (window.matchMedia) {
            if (
                window.matchMedia(this.schemeType(this.themeDark)).matches &&
                themeNext === this.themeDark
            ) {
                document.documentElement.removeAttribute(this.themeOverride)
                themeAuto = true
            } else if (
                window.matchMedia(this.schemeType(this.themeLight)).matches &&
                themeNext === this.themeLight
            ) {
                document.documentElement.removeAttribute(this.themeOverride)
                themeAuto = true
            }

            if (themeAuto) {
                let themeIndex: number = 0
                let themeData: string
                document
                    .querySelectorAll(this.themeMeta)
                    .forEach(function (element) {
                        themeData = themeOriginalColors[themeIndex]
                        element.setAttribute('content', themeData)
                        themeIndex++
                    })
            }
        }

        if (!themeAuto) {
            let themeColor: string
            let themeIndex: number = 0

            if (themeNext === this.themeDark) {
                themeIndex = 0
            } else if (themeNext === this.themeLight) {
                themeIndex = 1
            }

            document.documentElement.setAttribute(this.themeOverride, themeNext)
            themeColor = themeOriginalColors[themeIndex]

            document
                .querySelectorAll(this.themeMeta)
                .forEach(function (element) {
                    element.setAttribute('content', themeColor)
                })
        }
    }

    private readonly executionRate: number = 250
    private executionLast: number = 0

    public rateLimit(): boolean {
        let timeCurrent: number = Date.now()
        let timeDifference = timeCurrent - this.executionLast

        if (timeDifference <= this.executionRate) return true

        this.executionLast = timeCurrent

        return false
    }
}

const theme = new Theme()

// Header state types
enum headerStates {
    SHOW,
    HIDE,
    ONLOAD,
}

class UIController {
    // Manage header state
    private headerPast: number = window.scrollY
    private headerActive: boolean = false
    private headerState: headerStates = headerStates.ONLOAD
    private headerPresent: boolean = true
    private headerDeadZone: number = 50
    private readonly headerHideClass = 'hide'
    // Check for MobileSafari
    private readonly platformMobileSafari: boolean =
        !CSS.supports('user-select: none') &&
        !window.matchMedia('(hover: hover)').matches

    /**
     * Controls header state
     * @method header
     * @returns {void}
     */
    public header(): void {
        if (!this.headerPresent) return
        if (this.overscrollDeadZone()) return

        let headerElement: HTMLElement | undefined =
            document.getElementsByTagName('header')[0]

        if (typeof headerElement === 'undefined') {
            console.error('Header missing -- suspending header UI controller')
            this.headerPresent = false
            return
        }

        if (!this.headerActive && window.scrollY <= this.headerPast) {
            // Show header if scrolling up
            this.headerPast = window.scrollY
            if (this.headerState !== headerStates.SHOW) {
                this.headerState = headerStates.SHOW
                headerElement.classList.remove(this.headerHideClass)
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
                headerElement.classList.add(this.headerHideClass)
                this.headerActive = false
            }
        } else if (!this.headerActive && window.scrollY > 0) {
            // Hide header if it should be hidden after page load
            if (this.headerState !== headerStates.ONLOAD) {
                this.headerState = headerStates.ONLOAD
                headerElement.classList.add(this.headerHideClass)
            }
        }
        this.headerPast = window.scrollY
    }

    /**
     * Smooth scroll transition
     * @method scroll
     * @param element {string} HTML element ID or query selector
     * @returns {void}
     */
    public scroll(element: string): void {
        let reduceMotion: boolean =
            !!window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion)').matches
        let scrollBehavior: ScrollBehavior
        let elementObject: HTMLElement | null =
            document.getElementById(element) ??
            document.querySelector(element) ??
            null

        if (elementObject === null) {
            console.error('Cannot scroll to nonexistent element: ' + element)
        } else {
            scrollBehavior = reduceMotion
                ? ('instant' as ScrollBehavior)
                : ('smooth' as ScrollBehavior)
            window.scrollTo({
                top: elementObject.offsetTop,
                behavior: scrollBehavior,
            })
        }
    }

    public scrollHandler(event: Event) {
        event.preventDefault()
        this.scroll('body')
    }

    /**
     * Determine the dead zone to use when overscrolling (Safari mobile specific quirk)
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

        if (this.platformMobileSafari) {
            deadZone = 110
        }

        if (difference > deadZone) result = false

        return result
    }
}

const uiController = new UIController()

class EventController {
    public readonly selector: string =
        '.fab-scroll, .button-link, .card, .theme-invert'

    /**
     * Initiate input event
     * @method init
     * @param event {Event} Event data to utilise
     * @returns {void}
     */
    public init(event: Event): void {
        event.preventDefault()

        const buttonElement = event.currentTarget as HTMLElement

        let targetClass: string = buttonElement.classList.item(0) ?? ''

        if (targetClass === '') return

        switch (targetClass) {
            case 'card':
            case 'button-link':
                location.href = buttonElement.getAttribute('href') ?? ''
                break
            case 'theme-invert':
                if (theme.rateLimit()) return
                theme.set()
                break
        }
    }
}

const eventController = new EventController()

class DialogController {
    /**
     * Compose a dialog box
     * @method open
     * @param title {string} Title of dialog
     * @param body {string} Body of dialog
     * @returns {void}
     */
    public open(title: string, body: string): void {
        let dialogMain: HTMLDialogElement | null =
            document.querySelector('dialog')

        if (dialogMain === null)
            return console.error(
                'Cannot build message without dialog being present'
            )

        let dialogClose: HTMLElement | null = dialogMain.querySelector('.close')

        let dialogTitle: string = title
        let dialogDetails: string = body

        // Escape and convert special characters/bytes
        dialogDetails = dialogDetails.replaceAll('"', '&quot;')
        dialogDetails = dialogDetails.replaceAll('\n', '<br>')

        if (
            typeof dialogMain.getElementsByClassName('header')[0] !==
            'undefined'
        ) {
            dialogMain.getElementsByClassName('header')[0].innerHTML =
                dialogTitle
        }
        if (
            typeof dialogMain.getElementsByClassName('body')[0] !== 'undefined'
        ) {
            dialogMain.getElementsByClassName('body')[0].innerHTML =
                dialogDetails
        }

        dialogMain.showModal()

        if (dialogClose === null)
            return console.error('Dialog missing close button')

        dialogClose.blur()
    }

    /**
     * Close dialog box
     * @method open
     * @param event {MouseEvent} Event
     * @returns {void}
     */
    public close(event: MouseEvent): void {
        event.preventDefault()

        let dialogMain: HTMLDialogElement | null =
            document.querySelector('dialog')

        if (dialogMain === null)
            return console.error('Dialog not present while attempting to close')

        dialogMain.close()

        if (
            typeof dialogMain.getElementsByClassName('header')[0] !==
            'undefined'
        ) {
            dialogMain.getElementsByClassName('header')[0].innerHTML = ''
        }
        if (
            typeof dialogMain.getElementsByClassName('body')[0] !== 'undefined'
        ) {
            dialogMain.getElementsByClassName('body')[0].innerHTML = ''
        }
    }
}

const dialogController = new DialogController()

class Egg {
    private readonly audioFile: string = 'data/bg_audio.mp3'
    private readonly initAudioDuration: number = 1000

    /**
     * Generate audio
     * @method audioGen
     * @param frequency {number} Frequency to be used
     * @param type {OscillatorType} Oscillator to use
     * @returns {void}
     */
    private audioGen(): void {
        let audioContext: AudioContext = new AudioContext()
        let createOscillator: OscillatorNode = audioContext.createOscillator()
        let createGain: GainNode = audioContext.createGain()

        createOscillator.type = 'triangle'
        createOscillator.connect(createGain)
        createOscillator.frequency.value = 90
        createGain.connect(audioContext.destination)
        createOscillator.start(0)

        createGain.gain.exponentialRampToValueAtTime(
            0.00001,
            audioContext.currentTime + this.initAudioDuration / 1000
        )
    }

    private payload = (): void => {
        dialogController.open('Egg', 'Here is some audio.')
        this.audioGen()

        let audioController: HTMLAudioElement = new Audio(this.audioFile)
        audioController.volume = 0.6

        setTimeout(function (): void {
            audioController.play()
        }, this.initAudioDuration)
    }

    private keysPressed: string[] = []
    private readonly keysCombo: string[] = [
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

    /**
     * Easter egg
     * @method init
     * @param event {KeyboardEvent} Event information from the keyboard
     * @returns {void}
     */
    public initiate = (event: KeyboardEvent): void => {
        let keyEventData: string = event.key
        if (keyEventData.length === 1) {
            keyEventData = event.key.toUpperCase()
        }

        this.keysPressed.push(keyEventData)

        let indexMatch: string =
            this.keysCombo[this.keysPressed.length - 1] ?? ''

        if (indexMatch === '' || indexMatch !== keyEventData) {
            this.keysPressed = []
            return
        }

        let keysPressedCombined: string = this.keysPressed.join('')
        let keysComboCombined: string = this.keysCombo.join('')

        if (keysPressedCombined.match(keysComboCombined)) {
            this.keysPressed = []
            document.removeEventListener('keydown', this.initiate)
            this.payload()
        }
    }
}

const egg = new Egg()

window.onload = function (): void {
    // Unhide option if there is JavaScript enabled
    let revealToggle: Element | null = document.querySelector('.theme-invert')
    if (revealToggle === null) {
        console.error('Unable to unhide theme toggle')
    } else {
        revealToggle.classList.remove('hide')
    }

    // Set up listener
    document
        .querySelectorAll(eventController.selector)
        .forEach(function (element) {
            element.addEventListener('click', eventController.init)
        })

    // Build list of themes
    document
        .querySelectorAll(theme.themeMeta)
        .forEach(function (element: NodeInterface) {
            themeOriginalColors.push(element.getAttribute('content') ?? '')
        })

    // Initiate and listen to header
    uiController.header()
    window.onscroll = (): void => {
        uiController.header()
    }

    // Listen for title interaction, for scrolling up
    let headerScroll: Element | null = document.querySelector('header .title')
    if (headerScroll === null) {
        console.error('Failed to initiate header scroll event listener')
    } else {
        headerScroll.addEventListener('click', (event): void => {
            uiController.scrollHandler(event)
        })
    }

    // Allow dialog to be closed
    let dialogCloseOpt: Element | null = document.querySelector('dialog .close')
    if (dialogCloseOpt === null) {
        console.error('Failed to initiate dialog closure event listener')
    } else {
        dialogCloseOpt.addEventListener('click', (event): void => {
            dialogController.close(event as MouseEvent)
        })
    }

    document.addEventListener('keydown', egg.initiate)
}
