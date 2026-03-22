# Portfolio

My personal portfolio site, built with HTML, CSS, and JavaScript. Hosted on GitHub Pages at [jisungl.github.io](https://jisungl.github.io).

## Pages

- **Home** — featured projects, in-progress work, and a basketball shooting game built on HTML canvas
- **About** — bio, technical skills, photo gallery
- **Projects** — development work and sports data analysis articles, with a second instance of the basketball game
- **Contact** — links to email, LinkedIn, and GitHub

## Features

**Navigation** — animated bubble indicator that tracks the active page and transitions between nav links using cubic-bezier easing. The bubble's position initializes based on the referring page so the animation plays correctly on page load, not just on click.

**Animated background** — CSS gradient animation with a 400% background size, cycling through a purple palette on an 8-second loop with a 60px blur filter.

**Modal system** — two modal types: an iframe-based modal for embedding full articles, and a content modal for article notes. Both support URL-based deep linking with `history.pushState` so direct URLs to articles resolve correctly. Modals close on backdrop click, escape key, or close button, and navigation state is preserved through `popstate` events.

**Article embedding** — sports data articles (built separately with D3.js on ObservableHQ) are embedded in iframe modals with custom styling, responsive formatting, and print stylesheets. Each article also has an associated notes modal with background context, embedded YouTube videos, and commentary.

**Basketball game** — a canvas-based shooting game with drag-to-aim trajectory preview, projectile physics (gravity, bounce damping), rim and backboard collision detection, score tracking, and a make/attempt percentage display. Rendered at 60fps via `requestAnimationFrame`.

## Tech Stack

- HTML, CSS, JavaScript
- GitHub Pages
- D3.js and ObservableHQ (for embedded articles)