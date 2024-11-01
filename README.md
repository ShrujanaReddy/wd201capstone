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



![Screenshot 2024-11-01 123100](https://github.com/user-attachments/assets/51f395f9-fbe2-47cf-bca4-84a3aaff9c95)
![Screenshot 2024-11-01 123118](https://github.com/user-attachments/assets/04e5da02-9260-4a0f-b1b5-243f011684a9)
![Screenshot 2024-11-01 123134](https://github.com/user-attachments/assets/715ef5f3-3a61-4261-9d23-64b5cf5d1d9b)
![Screenshot 2024-11-01 123250](https://github.com/user-attachments/assets/a14bd02e-930a-443f-9f96-7d46a313eff3)
![Screenshot 2024-11-01 123313](https://github.com/user-attachments/assets/c309792a-255b-4d2c-8592-e614f6f3763f)
![Screenshot 2024-11-01 123331](https://github.com/user-attachments/assets/dcd37e71-918a-4b62-bf1f-0107566d4c5f)
![Screenshot 2024-11-01 123350](https://github.com/user-attachments/assets/e40b5a28-e26f-4863-9e34-dcb467ddadd3)
![Screenshot 2024-11-01 123441](https://github.com/user-attachments/assets/e7c39e02-3ef7-4e5a-8cb2-69f1a8ad3221)
![Screenshot 2024-11-01 123456](https://github.com/user-attachments/assets/7de731f2-5439-41e5-bdf3-472bc8901288)
![Screenshot 2024-11-01 123529](https://github.com/user-attachments/assets/09353ea4-ba3a-48d5-96d5-9a28b124bb3e)
![Screenshot 2024-11-01 123619](https://github.com/user-attachments/assets/20f077f1-30ef-4991-b685-045c9af43fbc)
![Screenshot 2024-11-01 123628](https://github.com/user-attachments/assets/d3ec91a5-2473-49b3-8534-903ad5eb13a4)
![Screenshot 2024-11-01 123646](https://github.com/user-attachments/assets/19dcc48f-33e9-466e-9819-ae5918eb1a41)

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

