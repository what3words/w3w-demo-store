# What3words Demo Store

This repository contains the checkout page of an E-commerce site designed exclusively for demo purposes.

## Getting Started

To set up the project locally, follow these steps:

### Install Dependencies

If you’re running the project for the first time, install the necessary JavaScript packages by running:

    npm install

### Start the Project

Once dependencies are installed, you can start the project using:

    npm start

### Setting Up Styles with Sass

This project uses Sass for styling. Ensure you have Sass installed globally to compile .scss files into .css.

To install Sass globally, run:

    npm install -g sass

### Compile Sass Stylesheets

After making changes to the Sass files or if running the project for the first time, compile the main Sass file into CSS by running:

    sass css/scss/styles.scss css/styles.css

This command will create or update styles.css in the css directory, ensuring the project has the latest compiled styles.

### Additional Notes

- Development Mode: Ensure sass --watch is running for automatic compilation during development. You can do this with:

        sass --watch css/scss/styles.scss css/styles.css

- What3words Integration: This project integrates what3words API functionality, allowing users to validate and convert traditional addresses and what3words addresses.

