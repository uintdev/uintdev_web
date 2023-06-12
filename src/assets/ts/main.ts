// Store theme color data
let themeOriginalColors: string[] = []

interface NodeExt extends Node {
    getAttribute: Function
}

enum ProficiencyType {
    'Beginner',
    'Intermediate',
    'Competent',
    'Proficient',
    'Expert',
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
    private get(): string {
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

        let targetClass: string = buttonElement.classList.item(0)

        switch (targetClass) {
            case 'card':
            case 'button-link':
                location.href = buttonElement.getAttribute('href') ?? ''
                break
            case 'theme-invert':
                theme.set()
                break
        }
    }
}

const eventController = new EventController()

class Egg {
    private readonly initAudioDuration: number = 1000

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

        gain.gain.exponentialRampToValueAtTime(
            0.00001,
            context.currentTime + this.initAudioDuration / 1000
        )
    }

    private payload = (): void => {
        this.audioGen()

        let audioController: HTMLAudioElement = new Audio('data/bg_audio.mp3')
        audioController.volume = 0.5
        setTimeout(function (): void {
            audioController.play()
        }, this.initAudioDuration)
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

        // Proficiency levels
        let proficiencyLevelResult: string
        let proficiencyLevelType: string
        let proficiencyLevelStore: string = ele.dataset.level
        let proficiencyLevelFallback = 'Unknown'

        if (isNaN(Number(proficiencyLevelStore))) {
            proficiencyLevelType = proficiencyLevelFallback
        } else {
            let proficiencyLevel: number = Number(proficiencyLevelStore)
            proficiencyLevelType = ProficiencyType[proficiencyLevel - 1]
            if (typeof proficiencyLevelType === 'undefined') {
                proficiencyLevelType = proficiencyLevelFallback
            }
        }

        proficiencyLevelResult =
            'Proficiency level: ' + proficiencyLevelType + '<br><br>'

        dialogMain.getElementsByClassName('header')[0].innerHTML = dialogTitle

        dialogMain.getElementsByClassName('body')[0].innerHTML =
            proficiencyLevelResult
        dialogMain.getElementsByClassName('body')[0].innerHTML += dialogDetails

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
    document.querySelectorAll(eventController.selector).forEach(function (ele) {
        ele.addEventListener('click', eventController.init)
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
