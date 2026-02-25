// Store theme color data
let themeOriginalColors: string[] = [];

enum ThemeType {
  LIGHT = "light",
  DARK = "dark",
  UNKNOWN = "unknown",
}

class Theme {
  public readonly themeMeta: string = 'meta[name="theme-color"]';
  private readonly themeOverride: string = "color-scheme";
  private readonly themeDefault: string = ThemeType.DARK;
  private readonly schemeType: Function = (schemeColor: string): string => {
    return "(prefers-color-scheme: " + schemeColor + ")";
  };

  /**
   * Get current theme
   * @method get
   * @returns {string} Current theme value
   */
  private get(): string {
    if (document.documentElement.hasAttribute(this.themeOverride)) {
      return (
        document.documentElement.getAttribute(this.themeOverride) ??
        this.themeDefault
      );
    }

    if (window.matchMedia) {
      if (window.matchMedia(this.schemeType(ThemeType.DARK)).matches) {
        return ThemeType.DARK;
      }

      if (window.matchMedia(this.schemeType(ThemeType.LIGHT)).matches) {
        return ThemeType.LIGHT;
      }
    }

    return this.themeDefault;
  }

  /**
   * Toggle between light and dark themes
   * @method set
   */
  public set(): void {
    const currentTheme: string = this.get();
    const nextTheme: ThemeType =
      currentTheme === ThemeType.DARK ? ThemeType.LIGHT : ThemeType.DARK;

    const useSystemTheme: boolean =
      window.matchMedia &&
      window.matchMedia(this.schemeType(nextTheme)).matches;

    if (useSystemTheme) {
      document.documentElement.removeAttribute(this.themeOverride);

      themeOriginalColors.forEach((color, index) => {
        const element: HTMLElement | null =
          document.querySelectorAll<HTMLElement>(this.themeMeta)[index];
        if (element) {
          element.setAttribute("content", color);
        }
      });
    } else {
      // Use explicit theme override
      document.documentElement.setAttribute(this.themeOverride, nextTheme);

      // Apply theme color to all meta elements
      const themeColorIndex = nextTheme === ThemeType.DARK ? 0 : 1;
      const themeColor: string = themeOriginalColors[themeColorIndex];

      document
        .querySelectorAll<HTMLElement>(this.themeMeta)
        .forEach((element) => {
          element.setAttribute("content", themeColor);
        });
    }
  }

  private readonly executionRate: number = 250;
  private executionLast: number = 0;

  /**
   * Throttle theme toggle
   * @returns {string}
   */
  public rateLimit(): boolean {
    let timeCurrent: number = Date.now();
    let timeDifference: number = timeCurrent - this.executionLast;

    if (timeDifference <= this.executionRate) return true;

    this.executionLast = timeCurrent;

    return false;
  }
}

const theme: Theme = new Theme();

// Header state types
enum HeaderState {
  SHOW,
  HIDE,
  ONLOAD,
}

class UIController {
  // Manage header state
  private headerPast: number = window.scrollY;
  private headerActive: boolean = false;
  private headerState: HeaderState = HeaderState.ONLOAD;
  private headerPresent: boolean = true;
  private headerDeadZoneTop: number = 100;
  private readonly headerHideClass: string = "hide";
  // Check for MobileSafari
  private readonly platformMobileSafari: boolean =
    !CSS.supports("user-select: none") &&
    !window.matchMedia("(hover: hover)").matches;

  /**
   * Controls header state based on scroll position
   * @method header
   * @returns {void}
   */
  public header(): void {
    if (!this.headerPresent || this.overscrollDeadZone()) return;

    const headerElement: HTMLElement | null =
      document.querySelector<HTMLElement>("header");

    if (!headerElement) {
      console.error("Header missing -- suspending header UI controller");
      this.headerPresent = false;
      return;
    }

    const currentScroll: number = window.scrollY;
    const scrollUp: boolean = currentScroll <= this.headerPast;
    const scrollDownPastThreshold: boolean =
      currentScroll > this.headerDeadZoneTop && currentScroll > this.headerPast;

    // Show header when scrolling up
    if (!this.headerActive && scrollUp) {
      this.headerState = HeaderState.SHOW;
      headerElement.classList.remove(this.headerHideClass);
      this.headerActive = true;
    }
    // Hide header when scrolling down past threshold
    else if (this.headerActive && scrollDownPastThreshold) {
      this.headerState = HeaderState.HIDE;
      headerElement.classList.add(this.headerHideClass);
      this.headerActive = false;
    }
    // Hide header on initial scroll after page load
    else if (
      !this.headerActive &&
      currentScroll > 0 &&
      this.headerState !== HeaderState.ONLOAD
    ) {
      this.headerState = HeaderState.ONLOAD;
      headerElement.classList.add(this.headerHideClass);
    }

    this.headerPast = currentScroll;
  }

  /**
   * Smooth scroll transition
   * @method scroll
   * @param element {string} HTML element ID or query selector
   * @returns {void}
   */
  public scroll(element: string): void {
    const reduceMotion: boolean =
      window.matchMedia?.("(prefers-reduced-motion)")?.matches ?? false;
    const elementObject: HTMLElement | null =
      document.getElementById(element) ??
      document.querySelector<HTMLElement>(element);

    if (!elementObject) {
      console.error("Cannot scroll to nonexistent element: " + element);
      return;
    }

    window.scrollTo({
      top: elementObject.offsetTop,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  }

  public scrollHandler(event: Event): void {
    event.preventDefault();
    this.scroll("body");
  }

  /**
   * Determine if overscroll should be prevented (Safari mobile specific quirk)
   * @method overscrollDeadZone
   * @returns {boolean} true if overscroll should be prevented
   */
  private overscrollDeadZone(): boolean {
    const currentPosition: number = window.scrollY;
    const scrollHeight: number = document.documentElement.scrollHeight;
    const clientHeight: number = document.documentElement.clientHeight;
    const scrollableHeight: number = scrollHeight - clientHeight;

    const deadZone: number = this.platformMobileSafari ? 110 : 0;
    const distanceToBottom: number = scrollableHeight - currentPosition;

    return distanceToBottom <= deadZone;
  }
}

const uiController: UIController = new UIController();

class EventController {
  public readonly selector: string = ".card, .button-link, .theme-invert";

  /**
   * Handle click events on interactive elements
   * @method init
   * @param event {Event} Click event
   * @returns {void}
   */
  public init(event: Event): void {
    event.preventDefault();

    const buttonElement = event.currentTarget as HTMLElement;
    const firstClass: string = buttonElement.classList[0];

    if (!firstClass) return;

    switch (firstClass) {
      case "card":
      case "button-link": {
        const href: string | null = buttonElement.getAttribute("href");
        if (href) location.href = href;
        break;
      }
      case "theme-invert": {
        if (!theme || theme.rateLimit()) return;
        theme.set();
        break;
      }
    }
  }
}

const eventController: EventController = new EventController();

class DialogController {
  /**
   * Compose a dialog box
   * @method open
   * @param title {string} Title of dialog
   * @param body {string} Body of dialog
   * @returns {void}
   */
  public open(title: string, body: string): void {
    const dialogMain: HTMLDialogElement | null =
      document.querySelector<HTMLDialogElement>("dialog");

    if (!dialogMain) {
      console.error("Cannot build message without dialog being present");
      return;
    }

    let dialogTitle: string = title;
    let dialogDetails: string = body;

    dialogDetails = dialogDetails
      .replaceAll('"', "&quot;")
      .replaceAll("\n", "<br>");

    const dialogClose: HTMLElement | null =
      dialogMain.querySelector<HTMLElement>(".close");
    const dialogHeader: HTMLElement | null =
      dialogMain.querySelector<HTMLElement>(".header");
    const dialogBody: HTMLElement | null =
      dialogMain.querySelector<HTMLElement>(".body");

    if (dialogHeader) {
      dialogHeader.innerHTML = dialogTitle;
    }
    if (dialogBody) {
      dialogBody.innerHTML = dialogDetails;
    }

    dialogMain.showModal();

    if (!dialogClose) {
      console.error("Dialog missing close button");
      return;
    }

    dialogClose.blur();
  }

  /**
   * Close dialog box
   * @method open
   * @param event {MouseEvent} Event
   * @returns {void}
   */
  public close(event: MouseEvent): void {
    event.preventDefault();

    const dialogMain: HTMLDialogElement | null =
      document.querySelector<HTMLDialogElement>("dialog");

    if (!dialogMain) {
      console.error("Dialog not present while attempting to close");
      return;
    }

    dialogMain.close();

    const dialogHeader: HTMLElement | null =
      dialogMain.querySelector<HTMLElement>(".header");
    const dialogBody: HTMLElement | null =
      dialogMain.querySelector<HTMLElement>(".body");

    if (dialogHeader) {
      dialogHeader.innerHTML = "";
    }
    if (dialogBody) {
      dialogBody.innerHTML = "";
    }
  }
}

const dialogController: DialogController = new DialogController();

class Egg {
  private readonly audioFile: string = "data/bg_audio.mp3";
  private readonly initAudioDuration: number = 1000;
  private keysPressed: string[] = [];
  private readonly keysCombo: string[] = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "B",
    "A",
    "Enter",
  ];

  /**
   * Generate audio tone
   * @method audioGen
   * @returns {void}
   */
  private audioGen(): void {
    const audioContext: AudioContext = new AudioContext();

    const oscillator: OscillatorNode = audioContext.createOscillator();
    const gainNode: GainNode = audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = 90;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();

    gainNode.gain.exponentialRampToValueAtTime(
      0.00001,
      audioContext.currentTime + this.initAudioDuration / 1000,
    );

    oscillator.stop(
      audioContext.currentTime + this.initAudioDuration / 1000 + 0.1,
    );
  }

  private payload(): void {
    dialogController.open("Egg", "Here is some audio.");
    this.audioGen();

    const audioController = new Audio(this.audioFile);
    audioController.volume = 0.6;

    setTimeout(async () => {
      try {
        const playPromise: Promise<void> = audioController.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (error) {
        console.warn("Audio playback failed:", error);
      }
    }, this.initAudioDuration);
  }

  /**
   * Handle easter egg key sequence detection
   * @method initiate
   * @param event {KeyboardEvent} Keyboard event
   * @returns {void}
   */
  public initiate = (event: KeyboardEvent): void => {
    const key: string =
      event.key.length === 1 ? event.key.toUpperCase() : event.key;

    this.keysPressed.push(key);

    const expectedKey: string = this.keysCombo[this.keysPressed.length - 1];
    if (!expectedKey || key !== expectedKey) {
      this.keysPressed = [];
      return;
    }

    if (this.keysPressed.join("") === this.keysCombo.join("")) {
      this.keysPressed = [];
      document.removeEventListener("keydown", this.initiate);
      this.payload();
    }
  };
}

const egg: Egg = new Egg();

document.addEventListener("DOMContentLoaded", (): void => {
  const revealToggle: HTMLElement | null =
    document.querySelector<HTMLElement>(".theme-invert");
  if (!revealToggle) {
    console.error("Unable to show theme toggle - element not found");
  } else {
    revealToggle.classList.remove("hide");
  }

  const setupEventListeners = (): void => {
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      // Handle theme toggle
      if (target.matches(eventController.selector)) {
        event.preventDefault();
        eventController.init(event);
      }

      // Handle header scroll
      if (target.matches("header .title")) {
        uiController.scrollHandler(event);
      }

      // Handle dialog close
      if (target.matches("dialog .close")) {
        dialogController.close(event as MouseEvent);
      }
    });
  };

  setupEventListeners();

  try {
    document
      .querySelectorAll<HTMLElement>(theme.themeMeta)
      .forEach((element: Element) => {
        themeOriginalColors.push(element.getAttribute("content") ?? "");
      });
  } catch (error) {
    console.error("Failed to initialize theme metadata:", error);
  }

  try {
    uiController.header();

    window.onscroll = (): void => {
      uiController.header();
    };
  } catch (error) {
    console.error("Failed to initialize UI components:", error);
  }

  document.addEventListener("keydown", egg.initiate);
});
