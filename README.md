# Learning Management System (LMS)

The Learning Management System (LMS) is a web application built using Express.js and Sequelize ORM, providing functionalities for educators to create courses, chapters, and pages, and for students to enroll in courses, view content, and track progress.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Routes](#routes)
  
## Introduction

The Learning Management System (LMS) is designed to facilitate online learning by allowing educators to create courses, chapters, and pages, and students to enroll in courses, access course content, mark chapters as complete, and track their progress.

## Features

- **Educator Features:**
  - Create courses with descriptions.
  - Add chapters and pages to courses.
  - View and manage own courses.

- **Student Features:**
  - Enroll in courses.
  - View enrolled and available courses.
  - View chapters and pages of enrolled courses.
  - Mark chapters as complete.

## Installation

To run the LMS locally, follow these steps:

1. Clone the repository: `git clone https://github.com/ShrujanaReddy/wd201capstone`
2. Navigate to the project directory: `cd lms`
3. Install dependencies: `npm install`
4. Start the application: `npm start`

## Usage

Once the application is running, access it in your web browser at `http://localhost:3000`.

## Routes

- `/` - Home page displaying available courses for all users.
- `/educator` - Dashboard for educators to manage courses.
- `/student` - Dashboard for students to view enrolled and available courses.
- `/signup` - Register as a new user (educator or student).
- `/login` - Log in as an existing user.
- `/signout` - Log out from the system.
- `/students/enroll/:courseId` - Enroll in a specific course.
- `/students/:courseId/chapters` - View chapters of an enrolled course.
- `/students/:courseId/chapters/:chapterId/pages` - View pages of a chapter in an enrolled course.
- `/students/:courseId/mark-complete` - Mark chapters as complete.

More detailed information about API routes and educator-specific routes are available in the codebase.

