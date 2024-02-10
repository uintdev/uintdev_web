// Store theme color data
let themeOriginalColors: string[] = []

interface NodeInterface extends Node {
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
        if (document.documentElement.hasAttribute(this.themeOverride)) {
            return (
                document.documentElement.getAttribute(this.themeOverride) ??
                this.themeDefault
            )
        } else if (window.matchMedia) {
            if (window.matchMedia(this.schemeType(this.themeDark)).matches) {
                return this.themeDark
            } else if (
                window.matchMedia(this.schemeType(this.themeLight)).matches
            ) {
                return this.themeLight
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

    private readonly executionRate: number = 450
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

    /**
     * Controls header state
     * @method header
     * @returns {void}
     */
    public header(): void {
        if (!this.headerPresent) return
        if (this.overscrollDeadZone()) return

        let headerElement: HTMLElement =
            document.getElementsByTagName('header')[0]

        if (typeof headerElement === 'undefined') {
            console.error('Header had gone out to get some milk')
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
            console.error(
                'Cannot scroll to an element that does not exist: ' + element
            )
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

    public scrollHander(event: Event) {
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

        let platformType: number = window.navigator.userAgent.indexOf('(iPhone')
        if (platformType > -1) {
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

        let targetClass: string | null = buttonElement.classList.item(0)

        if (targetClass === null) return

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
        this.audioGen()

        let audioController: HTMLAudioElement = new Audio(this.audioFile)
        audioController.volume = 0.5
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

        let indexMatch: string = this.keysCombo[this.keysPressed.length - 1]

        if (typeof indexMatch === 'undefined' || indexMatch !== keyEventData) {
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

class DialogController {
    /**
     * Compose a dialog box
     * @method open
     * @param event {MouseEvent} Event
     * @param element {HTMLElement} HTML element
     * @returns {void}
     */
    public open(event: Event, element: HTMLElement): void {
        event.preventDefault()

        let dialogTitle: string = element.innerHTML
        let dialogDetails: string = element.title
        if (dialogDetails === '') {
            dialogDetails = 'No details yet'
        }

        // Proficiency levels
        let proficiencyLevelResult: string
        let proficiencyLevelType: string
        let proficiencyLevelStore: string | undefined = element.dataset.level
        let proficiencyLevelFallback = 'Unknown'

        let proficiencyLevel: number = Number(proficiencyLevelStore)

        if (isNaN(proficiencyLevel)) {
            proficiencyLevelType = proficiencyLevelFallback
        } else {
            proficiencyLevelType = ProficiencyType[proficiencyLevel - 1]
            if (typeof proficiencyLevelType === 'undefined') {
                proficiencyLevelType = proficiencyLevelFallback
            }
        }

        proficiencyLevelResult =
            'Proficiency level: ' + proficiencyLevelType + '<br><br>'

        this.build(dialogTitle, proficiencyLevelResult + dialogDetails)
    }

    /**
     * Compose a dialog box
     * @method build
     * @param title {string} Title of dialog
     * @param body {string} Body of dialog
     * @returns {void}
     */
    public build(title: string, body: string): void {
        let dialogClose: HTMLElement | null =
            document.querySelector('dialog .close')
        let dialogMain: HTMLDialogElement | null =
            document.querySelector('dialog')

        if (dialogMain === null)
            return console.error(
                'Cannot build message without dialog being present'
            )

        let dialogTitle: string = title
        let dialogDetails: string = body

        dialogDetails = dialogDetails.replaceAll('"', '&quot;')
        dialogDetails = dialogDetails.replaceAll('\n', '<br>')

        dialogMain.getElementsByClassName('header')[0].innerHTML = dialogTitle
        dialogMain.getElementsByClassName('body')[0].innerHTML = dialogDetails

        dialogMain.showModal()

        /**
         * Avoid focusing on button by default
         * Yes, this doesn't work without setTimeout.
         * It seems as though asynchronous execution is what's allowing
         * for it to function as intended. This is a WebKit bug.
         */
        setTimeout((): void => {
            if (dialogClose === null)
                return console.error('Dialog is missing close button')

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

        let dialogMain: HTMLDialogElement | null =
            document.querySelector('dialog')

        if (dialogMain === null)
            return console.error('Dialog not present while attempting to close')

        dialogMain.close()

        dialogMain.getElementsByClassName('header')[0].innerHTML = ''
        dialogMain.getElementsByClassName('body')[0].innerHTML = ''
    }
}

const dialogController = new DialogController()

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
            uiController.scrollHander(event)
        })
    }

    // Listen for pill input
    document
        .querySelectorAll('.pill')
        .forEach(function (value: Element, _, __): void {
            value.addEventListener('click', (event): void => {
                dialogController.open(event, value as HTMLElement)
            })
        })

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
