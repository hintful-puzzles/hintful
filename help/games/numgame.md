# Target

You are given six numbers and a target from 100 to 999. Combine the numbers two at a time with +, −, × and ÷ until one of them is the target.

Combining two numbers replaces them with their result, which you can combine again. Every result must be a positive whole number: you cannot subtract a number from one that is not larger, nor divide where there would be a remainder. Each number is used at most once, and you need not use them all.

Every target can be made exactly.

## Controls

{{controls}}

The smaller number slides onto the larger, and the result takes the larger's place and says how it was made beneath its value. Which of the two you pick first makes no difference: − and ÷ always take the smaller number from or into the larger. Once a number and an operator are picked, the numbers they cannot combine with are grayed out.

You can also pick an operator with its key: +, −, * (or x) and /. With no number picked, the key picks the number under the cursor as well, so from the keyboard a move is a number, an operator's key and Enter on the second number. Escape puts down the number you picked. Undo takes back a combination.

## Where the puzzle comes from

This is the numbers round of the British television quiz *Countdown*, where the six numbers are drawn from cards: two each of 1 to 10, and one each of 25, 50, 75 and 100.

## Hints

**Hint** gives you one combination and no more: how few operations the target still needs from the numbers you have now, and one of them, starting with the work on the biggest number. "952 needs at least 5 operations. One of them: 100 + 3 = 103." The rest of the way is yours to find, and the next hint picks up from wherever you are.

{{hint-marks}}

If the numbers you have left can no longer make the target, the hint says so, and Undo takes you back to where they could.

## Target parameters

{{parameters}}
