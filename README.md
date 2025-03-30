# Data Tracking Plugin

A Firefox browser extension that monitors and displays how Facebook ID and  Google Analytics ID are shared across 
websites. This plugin provides a floating dashboard at the bottom of the page, showing which domains receive these 
identifiers, with clickable domains to copy the last request to your clipboard.

## Features

- **Tracks Multiple Identifiers**:
    - **Facebook ID**: Monitors the `_fbp` cookie.
    - **Google Analytics ID**: Monitors the `_ga` cookie.
    
- **Real-Time Dashboard**: Displays a table with:
    - Identifier type
    - Current value of the identifier
    - Domains receiving the identifier (excluding the originating service and subdomains of the current site)
    
- **Interactive**: Click on a domain in the dashboard to copy the last request sent to that domain to your clipboard.

## Installation

### Prerequisites
- Mozilla Firefox browser
- Basic understanding of browser extensions (optional, for development)

### Steps to Install

1. **Clone or Download the Repository**:
    - Clone this repository to your local machine:
      ```bash
      git clone https://github.com/your-username/data-tracking-plugin.git
      ```

2. **Load the Extension in Firefox**:
   - Open Firefox.
   - Navigate to `about:debugging#/runtime/this-firefox` in the address bar.
   - Click on "Load Temporary Add-on…".
   - Select the `manifest.json` file from the cloned or extracted folder.
   - The extension will load temporarily and remain active until you restart Firefox.
   
3. Verify Installation:
   - Visit any website. The dashboard should appear at the bottom of the page, displaying tracking data if the 
     relevant cookies (`_fbp`, `_ga`) are present.

### Development

**Files**:

  - `manifest.json`: Defines the extension’s metadata and permissions.
  - `background.js`: Handles tracking logic and communicates with the content script.
  - `content.js`: Manages the dashboard UI and user interactions.

**Modify and Reload**:
  - Edit the source files in the repository.
  - Reload the extension in about:debugging#/runtime/this-firefox by clicking "Reload" next to the extension.

**LLM Code Maintenance**
This code has been generated with Grok3. We recommend using this model to make any further modifications to the code.

### Contributing
Feel free to fork this repository, submit issues, or create pull requests with improvements or bug fixes.

### License
This project is licensed under the MIT License - see the  file for details.