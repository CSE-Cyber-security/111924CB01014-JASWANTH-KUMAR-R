# Password Strength Analyser

A small, dependency-free password strength checker built with plain HTML, CSS and JavaScript. It runs entirely in the browser, so nothing you type is sent anywhere.

## Features

- Four-level strength meter (Weak, Fair, Good, Strong) and a score out of 100
- Entropy estimate in bits and an approximate crack time
- Checks for length, upper and lower case, numbers, symbols, common passwords, repeated characters and keyboard or alphabet sequences
- Tips on how to improve a weak password
- Show / Hide toggle for the password field
- Responsive layout with automatic light and dark mode

## Project structure

```
password-analyser/
├── index.html   # page structure
├── style.css    # styling (light and dark themes)
├── script.js    # analysis logic and UI updates
└── README.md
```

## How to run

1. Download the three files (`index.html`, `style.css`, `script.js`) into the same folder.
2. Open `index.html` in any modern browser. No build step or server is needed.

## How it works

1. **Character pool:** the size of the set the password draws from (lowercase 26, uppercase 26, digits 10, symbols 33).
2. **Entropy:** `length x log2(pool size)`.
3. **Penalties:** entropy is reduced for repeated characters, sequences like `1234` or `qwerty`, and low character variety. Passwords on the built-in common list are capped at a very low value.
4. **Score:** entropy is scaled against 80 bits to give a 0 to 100 score, which maps to the four strength levels.
5. **Crack time:** `2^entropy / 2 / 10^10` seconds, assuming an attacker making 10 billion guesses per second.

## Customising

- **Common password list:** edit the `COMMON` array in `script.js`, or load a larger wordlist.
- **Thresholds:** change the score cut-offs in `analyse()` to make the levels stricter or more lenient.
- **Guess rate:** change `1e10` in `analyse()` to model a slower or faster attacker.
- **Colours:** edit the CSS variables at the top of `style.css`.

## Limitations

The entropy and crack time are rough estimates that assume random guessing. Real attackers try dictionary words, leaked passwords and common patterns first. For production use, consider a library such as [zxcvbn](https://github.com/dropbox/zxcvbn), and always combine strong passwords with a password manager and two-factor authentication.

## License

Free to use and modify for learning and personal projects.
