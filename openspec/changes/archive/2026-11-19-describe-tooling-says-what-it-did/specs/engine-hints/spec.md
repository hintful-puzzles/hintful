## ADDED Requirements

### Requirement: The length lint reads a supplied word at the word list's lengths

`npm run describe` SHALL read a word a game supplies (a technique's
`{ supplied: words }` term, a step's `word` term) at the word list's
shortest length for a wording's shortest reading, and at its longest for the
longest reading, three words for a list, taking the lengths from the word
list itself.

#### Scenario: A sentence long with any real word

- **WHEN** a Wordtrail wording runs past the limit with a three-letter word
  but not with a one-character placeholder
- **THEN** `npm run describe` refuses it, quoting the sentence with the word
  at three letters
