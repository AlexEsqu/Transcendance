# Welcome to TRANSCENDANTAL PONG
This is 42's first project in web-development, a mulktiplayer game website !

## MANDATORY PART

### Overview

A Website with a nice user interface and real-time multiplayer capabilities allowing you to play Pong with friends.

### Technologies
- [ ] Single Page Application (SPA):
	The user can navigate from page to page using the back and forth button, without triggering a refresh of the page
- [ ] FrontEnd in Typescript
- [ ] Compatible with Firefox
- [ ] Running on Docker

### Game
- [ ] Users can participate in a live Pong Game, using the same keyboard.
- [ ] Players can face off against another
- [ ] Players can face off during tournament where multipe users take turn against each other.
- [ ] Matchmaking allows players to be matched against other player
- [ ] Users can input an alias before a game
- [ ] All players, including the IA, have the same rules (paddle speed...)
- [ ] The game must still capture the essence of the original Pong

### Security
- [ ] All password stored in hashed with a strong algorithm
- [ ] Protection against SQL injesctions
- [ ] HTTPS connection
- [ ] Validation mechanism for forms and user inputs, both on front and server side
- [ ] Protect API routes
- [ ] All credentials, API keys, env variables are saved locally in a .env file and ignored by git


## Modules

- For 100%: 7 major modules
- 2 minor modules = 1 large module
- For 125%: +5pts/minor & +10pts/major

### Web Modules

#### Major: Backend with a Framework
- [ ] Use Fastify for the Backend

#### Minor: Frontend with a Framework
- [ ] Use Tailwind CSS as sole framework for the FrontEnd (Tailwind CSS isn't a framework...)

#### Minor: Database in the Backend
- [ ] All DB instances use SQLite


### User Management

#### Major: Standard User Management
- [ ] Users can securely subscribe to the website
- [ ] Registered users can log in
- [ ] User can select a display name
- [ ] Users can update their information
- [ ] Users can upload avatars, with a default option
- [ ] Users can add other as friends and view their online status
- [ ] Users profiles diplays stats such as wins and losses
- [ ] Each user has a MAtch History including 1v1 games, dates and relevant details

#### Major: Remote Authentication
- [ ] Implement securte external authentication using OAuth 2.0 with any provider (42 Intra)


### Gameplay

#### Major: Remote Players
- [ ] Two players can play the same Pong game from different computer


### Algorythm

#### Major: Ai Opponent
- [ ] AI opponent providing a challenging and engaging gameplay for users
- [ ] AI replicates human beghavior, simulating keyvoard input, only refreshing view once per second, anticipating bouncs
- [ ] AI makes intelligent and strategic moves

#### Minor: GameStats Dashboard
- [ ] User Friendly dashboard with insight on gaming statistics
- [ ] Separate dashboard for game sessions, showing detailed statistics, outcomes, and historical fata for each match
- [ ] Implement data visualisation techniques such as charts and graphs to present statistics in clear manner

### Cybersecurity

#### Minor: GDPR Compliance
- [ ] Users can request deletion of their data in a streamline manner
- [ ] Users can modify their data
- [ ] Inform users on the use of their data, with accessible options to exercises their rights (Data Protection Policy with contact)

### Graphics

#### Major: 3D Techniques
- [ ] Implement 3D graphics usnig Babylon.JS

### Accessibility

#### Minor: Support on all devices
- [ ] Website works on all types of devices
- [ ] Responsibe to different screen sizes & orientation
- [ ] Users can navigate the website on all devices

#### Minor: Browser compatibility
- [ ] Website works on an additional web browser

#### Minor: Accessibility for Visually Impaired Users
- [ ] Support for screen readers
- [ ] Alt text for images
- [ ] High Contrast
- [ ] Keyboard navigation and focus management
- [ ] adjusting text size

### Server-Side

#### Major: ServerSide Pong
- [ ] Server side logic for the Pong Game to handle gameplay
- [ ] Create API exposing the necessary endpoits to interact with the Pong Game wiva CLI and web interface
- [ ] Server side Pong is responsive and engaging
- [ ] integrate server-side Pong with the web application
