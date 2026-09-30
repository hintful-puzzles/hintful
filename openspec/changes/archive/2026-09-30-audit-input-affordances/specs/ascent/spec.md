## ADDED Requirements

### Requirement: Ascent offers a number keypad
Ascent SHALL offer an on-screen keypad of the digits `1`–`9` and `0` and a Clear key, so that a number can be written into any empty square by a pointer alone: a tap on the square, the number's digits on the keypad, and a tap anywhere to confirm it, as typing on the keyboard does. Clear SHALL rub out the last digit typed, as Backspace does.

A tap otherwise places only the number before or after a highlighted one, beside it, and the hint places numbers no chain of taps reaches; the keypad is what lets a touch player make every move the hint explains.

#### Scenario: A missing number is written by taps and the keypad alone
- **WHEN** the player taps an empty square, presses the keypad digits of a number missing from the board, presses a wrong digit and Clear, and taps another square
- **THEN** the square holds that number
