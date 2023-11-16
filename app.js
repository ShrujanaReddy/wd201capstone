const express = require('express');
const app = express();
const {Course,Chapter,Page,User,Enrollment}=require('./models')
const path=require('path')
const bodyParser=require('body-parser')
const passport=require('passport')
const connectEnsureLogin=require('connect-ensure-login')
const session=require('express-session')
const LocalStrategy=require('passport-local')
const bcrypt=require('bcrypt')
var cookieParser=require("cookie-parser")
var csrf=require("csurf")

app.set("view engine","ejs")
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.json())
app.use(cookieParser("ssh! some secret string"))
app.use(csrf({cookie:true}))

app.use(session({
    secret:"my-super-secret-key-2121323131312",
    cookie:{
        maxAge:24*60*60*1000 //24hrs
    }
}))
app.use(passport.initialize())
app.use(passport.session())

const saltRounds=10;
passport.use(new LocalStrategy({
  usernameField:'email',
  passwordField:'password'
},(username,password,done)=>{
  User.findOne({where:{email:username}})
  .then(async (user)=>{
    const result=await bcrypt.compare(password,user.password)
    if(result)
    return done(null,user)
    else
    return done(null,false,{message:"Invalid password"})
  }).catch((error)=>{
    return done(error)
  })
}))
passport.serializeUser((user,done)=>{
  console.log("Serializing user in session",user.id)
  done(null,user.id)
})
passport.deserializeUser((id,done)=>{
  User.findByPk(id)
  .then(user=>{
    done(null,user)
  }).catch(error=>{
    done(error,null)
  })
})

app.get("/",async (req,res) => {
    const allCourses=await Course.getCourses()
    if(req.accepts("html")) {
        res.render('index',{
            csrfToken:req.csrfToken()
        })
    } else {
        res.json(allCourses)
    }
})
app.get("/educator",connectEnsureLogin.ensureLoggedIn(),async (req,res)=>{
    const allCourses=await Course.getCourses()
    if(req.accepts("html")) {
        res.render('educator',{
            allCourses,
            csrfToken:req.csrfToken()
        })
    } else {
        res.json(allCourses)
    }
})
app.get("/student", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    const studentId = req.user.id;
    try {
        // Fetch all courses
        const allCourses = await Course.getCourses();

        // Fetch enrolled courses for the student
        const enrolledCourses = await Enrollment.findAll({
            where: {
                studentId: studentId,
            },
            include: [{ model: Course, as: 'course' }],
        });

        // Extract courseIds of enrolled courses
        const enrolledCourseIds = enrolledCourses.map(enrollment => enrollment.course.id);

        // Filter not enrolled courses
        const notEnrolledCourses = allCourses.filter(course => !enrolledCourseIds.includes(course.id));

        if (req.accepts("html")) {
            res.render('student', {
                allCourses,
                notEnrolledCourses,
                enrolledCourses,
                csrfToken: req.csrfToken()
            });
        } else {
            res.json(notEnrolledCourses);
        }
    } catch (error) {
        console.log(error);
        return res.status(422).json(error);
    }
})

app.use(express.static(path.join(__dirname,'public')))
// Educator Routes

//View all courses
app.get("/educators/courses",connectEnsureLogin.ensureLoggedIn(),async (req,res)=>{
    try {
        const allCourses=await Course.getmyCourses(req.user.id)
        const educatorCourses = await Course.getEducatorCourses(req.user.id);
        return res.render('courses',{allCourses,educatorCourses,csrfToken:req.csrfToken()})
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
})
app.get('/createcourse',connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    // Render the course creation page
    res.render('createcourse.ejs',{csrfToken:req.csrfToken()})
})
app.get('/createchapter',connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    // Render the course creation page
    const course_id = req.query.course_id
    res.render('createchapter.ejs',{course_id,csrfToken:req.csrfToken()})
})
app.get('/createpage',connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    // Render the course creation page
    const course_id = req.query.course_id
    const chapter_id = req.params.chapter_id
    res.render('createpage.ejs',{course_id,chapter_id,csrfToken:req.csrfToken()})
})
//View the course chapters
app.get("/educators/courses/:courseId/chapters", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        const courseId = req.params.courseId;

        const course = await Course.findByPk(courseId);
        if (!course) {
            throw new Error('Course not found'); // Handle the case where the course doesn't exist
        } else {
            const chapters = await Chapter.getChapters(courseId);
            const allCourses = await Course.getCourses()
            //console.log(chapters)
            // Render the "chapters.ejs" template to display chapters in a new page
            res.render('chapters', { chapters,allCourses,courseId,csrfToken:req.csrfToken()});
        }
    } catch (error) {
        console.error(error);
        return res.status(422).json(error);
    }
});

//View pages in a chapter
app.get("/educators/courses/:courseId/chapters/:chapterId/pages", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const chapterId = req.params.chapterId;

        const course = await Course.findByPk(courseId);
        if (!course) {
            throw new Error('Course not found'); // Handle the case where the course doesn't exist
        }

        const chapter = await Chapter.findByPk(chapterId);
        if (!chapter) {
            throw new Error('Chapter not found');
        } else {
            const pages = await Page.getPages({ courseId, chapterId })
            //console.log(pages)
            // Render the "pages.ejs" template to display pages in a new page
            res.render('pages', { pages,csrfToken:req.csrfToken()})
        }
    } catch (error) {
        console.error(error);
        return res.status(422).json(error);
    }
});

// Create a new course
app.post("/educators/courses/create",connectEnsureLogin.ensureLoggedIn(),async (req, res) => {
    // Handle course creation here
    try {
        const course=await Course.createCourse({title:req.body.title,description:req.body.description,educator_id:req.user.id})
        res.redirect(`/educators/courses/${course.id}/chapters/create?course_id=${course.id}&educator_id=${req.user.id}`)
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
});

// Add chapters to a course
app.get('/educators/courses/:courseId/chapters/create', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    // Get the course ID from the route parameters
    const course_id = req.params.courseId;

    // Render the "createchapter.ejs" template and pass the course_id
    res.render('createchapter.ejs', { course_id,csrfToken:req.csrfToken()});
});

app.post("/educators/courses/:courseId/chapters/create",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);

    if (!course) {
      throw new Error('Course not found'); // Handle the case where the course doesn't exist
    }

    const chapter = await Chapter.addChap({ title: req.body.title, courseId: req.params.courseId });
    res.redirect(`/educators/courses/${course.id}/chapters/${chapter.id}/pages/create?educator_id=${req.user.id}`)
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: error.message });
  }
});


// Add pages to a chapter in a course
app.get('/educators/courses/:courseId/chapters/:chapterId/pages/create', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    // Get course ID and chapter ID from route parameters
    const courseId = req.params.courseId;
    const chapterId = req.params.chapterId;
    const course = await Course.findByPk(courseId);
    const chapter = await Chapter.findByPk(chapterId);

    // Render the "createpage.ejs" template and pass the course and chapter information
    res.render('createpage.ejs', { courseTitle: course.title,
        chapterTitle: chapter.title,courseId, chapterId,csrfToken:req.csrfToken()});
})
app.post("/educators/courses/:courseId/chapters/:chapterId/pages/create",connectEnsureLogin.ensureLoggedIn(),async (req, res) => {
    // Handle adding pages here
    try {
        const courseId = req.params.courseId;
        const chapterId = req.params.chapterId;
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const chapter = await Chapter.findByPk(chapterId);
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const page = await Page.addPage({
      title: req.body.title,
      content: req.body.content,
      chapterId,
      courseId
    })
    const pages=await Page.getPages({courseId,chapterId})
    return res.render("pages",{pages,csrfToken:req.csrfToken()})
  } catch (error) {
    console.error(error)
    return res.status(422).json({ error: error.message })
  }
})

// Student Routes
// New students can sign up
app.post("/users",async (req,res) => {
    //console.log(req.body)
    const hashedPwd=await bcrypt.hash(req.body.password,saltRounds)
    console.log(hashedPwd)
    try {
        const user=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:hashedPwd,
        role:req.body.role
    })
    req.login(user,(err)=>{
        if(err)
        console.log(err)
        if(req.body.role==='educator')
        res.redirect("/educator")
        else if(req.body.role==='student')
        res.redirect("/student")
        else 
        res.redirect("/")
    })
    } catch(error) {
        console.log(error)
    }
})
app.get("/signup", (req, res) => {
    // Handle student signup here
    res.render('signup',{csrfToken:req.csrfToken()})
});

// Returning students can log in
app.get("/login", (req, res) => {
    // Handle student login here
    res.render('signin',{csrfToken:req.csrfToken()})
});

app.post("/session",passport.authenticate('local',{failureRedirect:"/signup"}),(req,res)=>{
    console.log(req.user)
    if(req.user.role==="educator")
    res.redirect("/educator")
    else if(req.user.role==="student")
    res.redirect("/student")
})
// All students can log out
app.get("/signout", (req, res, next) => {
    // Handle student logout here
    req.logout((err)=>{
    if(err) 
    return next(err)
    res.redirect("/")
  })
});

// Course Enrollment Routes

// Enroll in a course
app.post("/students/enroll/:courseId", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const studentId = req.user.id; // Get the student's user ID from the logged-in user

        // Check if the student is already enrolled in this course
        const existingEnrollment = await Enrollment.findOne({
            where: {
                courseId: courseId,
                studentId: studentId,
            },
        });

        if (existingEnrollment) {
            // The student is already enrolled, you can handle this as needed
            return res.status(400).json({ message: 'Student is already enrolled in this course' });
        }

        // Create a new enrollment record for the student
      const chapters = await Chapter.findAll({
        where: {
          courseId: courseId,
        },
      })
        const enrollment = await Enrollment.enrollStudent({
            courseId: courseId,
            studentId: studentId,
            chapters:chapters
        })
        res.redirect('/student')
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})

// Get the list of chapters in a course before enrolling
// View chapters
app.get('/students/:courseId/chapters', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.user.id; // Get the user's ID from the logged-in session

        // Fetch the chapters for the course
        const chapters = await Chapter.getChapters(courseId);

        // Fetch completed chapters for the user in the course
        const completedEnrollments = await Enrollment.findAll({
            where: {
                studentId: userId,
                courseId: courseId,
                completed: true,
            },
        });
        const completedChaptersCount = await Enrollment.count({
            where: {
                courseId: courseId,
                studentId: userId,
                completed: true, // Filter by completed chapters
            },
        });

        // Fetch the total number of chapters in the course (for reference)
        const totalChaptersCount = await Chapter.count({
            where: {
                courseId: courseId,
            },
        });


        // Check if the user is enrolled in the course
        const userIsEnrolled = await Enrollment.findOne({
            where: {
                studentId: userId,
                courseId: courseId,
            },
        });

        // Calculate progress percentage
        const progressPercentage = (completedChaptersCount / totalChaptersCount) * 100;

        // Render the chapters page
        if(userIsEnrolled) {
        res.render('stu_chapters', {
            chapters,
            courseId,
            userIsEnrolled: true,
            completedEnrollments,
            totalChaptersCount: totalChaptersCount,
            completedChaptersCount: completedChaptersCount,
            progressPercentage: progressPercentage,
            csrfToken: req.csrfToken(),
        })
        }
        else {
            res.render('stu_chapters', {
            chapters,
            courseId,
            userIsEnrolled:false, 
            completedEnrollments,
            totalChaptersCount: totalChaptersCount,
            completedChaptersCount: completedChaptersCount,
            progressPercentage: progressPercentage,
            csrfToken: req.csrfToken(),
        })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/changepassword',connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        const studentId = req.user.id; 
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const user = await User.findByPk(req.user.id);
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).send('Current password is incorrect');
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).send("New password and confirm password don't match");
        }
        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        await User.changePassword({password:hashedNewPassword,id:studentId});
        if(user.role==='educator')
        res.redirect("/educator")
        else if(user.role==='student')
        res.redirect("/student")
    } catch(err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/students/changePassword', (req, res) => {
    res.render('changePassword',{csrfToken:req.csrfToken()})
});

app.get('/educator/changePassword', (req, res) => {
    res.render('changePassword',{csrfToken:req.csrfToken()})
});

// View pages
app.get('/students/:courseId/chapters/:chapterId/pages', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const chapterId = req.params.chapterId;
        const userId = req.user.id; // Get the user's ID from the logged-in session

        // Check if the user is enrolled in the course with the given courseId
        const isEnrolled = await Enrollment.findOne({
            where: {
                studentId: userId,
                courseId: courseId,
            },
        });

        if (isEnrolled) {
            // If the user is enrolled, fetch the pages for the chapter and render the pages page
            const pages = await Page.getPages({ courseId, chapterId });
            res.render('pages', { pages, courseId, chapterId, userIsEnrolled: true, csrfToken: req.csrfToken() });
        } else {
            // If the user is not enrolled
            res.render('stu_chapters', { courseId, userIsEnrolled: false, csrfToken: req.csrfToken() });
        }
    } catch (error) {
        console.error(error);
        return res.status(422).json(error);
    }
})

// Student Dashboard Routes

// Display a list of courses the student is enrolled in
app.get("/students/courses",connectEnsureLogin.ensureLoggedIn(), (request, response) => {
    // Handle displaying enrolled courses here
});

// Allow students to mark pages as complete
app.post("/students/:courseId/mark-complete", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const studentId = req.user.id;
        // Check if the student is enrolled in this course
        const enrollment = await Enrollment.findOne({
            where: {
                courseId: courseId,
                studentId: studentId,
            },
        })
        if (!enrollment) {
            // The student is not enrolled in this course
            return res.status(400).json({ message: 'Student is not enrolled in this course' });
        }
        const chapterId = req.body.chapterId
        if (!chapterId) {
            return res.status(400).json({ message: 'ChapterId is required to mark as complete' });
        }
        // Check if the chapter is part of the enrolled course
        const isChapterInCourse = await Chapter.findOne({
            where: {
                courseId: courseId,
                id: chapterId,
            },
        })
        if (!isChapterInCourse) {
            return res.status(400).json({ message: 'Chapter is not part of the enrolled course' });
        }
        // Update the enrollment record to mark the chapter as complete
        await Enrollment.markComplete({courseId:courseId,studentId:studentId,chapterId:chapterId})
        res.redirect(`/students/${courseId}/chapters`)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})


// Progress Tracking Routes

// Show the progress status, possibly as a completion percentage
app.get("/students/courses/:courseId/progress",connectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    // Handle progress tracking here
    try {
        const courseId = request.params.courseId;
        const userId = request.user.id; // Assuming you can access the user's ID from the session

        // Calculate the number of completed chapters for the user in the specified course
        const completedChaptersCount = await Enrollment.count({
            where: {
                courseId: courseId,
                studentId: userId,
                completed: true, // Filter by completed chapters
            },
        });

        // Fetch the total number of chapters in the course (for reference)
        const totalChaptersCount = await Enrollment.count({
            where: {
                courseId: courseId,
            },
        })
        const progressPercentage = (completedChaptersCount / totalChaptersCount) * 100;

        response.render('progress', {
            courseId: courseId,
            totalChaptersCount: totalChaptersCount,
            completedChaptersCount: completedChaptersCount,
            progressPercentage: progressPercentage,
        });
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
})

module.exports=app