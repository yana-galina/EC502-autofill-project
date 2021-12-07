# EC521-autofill-project
ENG EC521 Project Fall 2021

## Overview

This repository contains code for Chrome and Firefox browser extensions which are able to detect if there is a potential autofill attack occuring on a given page. It also contains a server with pages that showcase a variety of autofill phishing attacks. 

## Getting Started 

### Installing the Chrome Extension 

To install this extension on Google Chrome, clone the repository and then navigate to chrome://extensions/ in a Chrome browser. Click "load unpacked", and then choose the "chrome-extension" folder from this repository. This should load the extension within your browser. 

### Installing the Firefox Extension

To install this extension on Firefox, clone the repository and then navigate to about:debugging/ in a Firefox browser. Click "This Firefox", and then "Load Temporary Add-on". Choose any file in the "firefox-extension" folder from this repository. 


### Running the server

First, install NodeJS at https://nodejs.org/en/ if you do not have it already installed. Make sure you have this repository cloned. Then, in a command terminal, navigate to server/src in this repository and run ```node server.js```. This should start the server. Navigate to "localhost:3000" in a browser to see the pages. 