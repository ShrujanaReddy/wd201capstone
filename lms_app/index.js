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
        const allCourses=await Course.getCourses()
        // Fetch the enrolled courses for the student, including the Course model with alias 'course'
        const enrolledCourses = await Enrollment.findAll({
            where: {
                studentId: studentId,
            },
            include: [{ model: Course, as: 'course' }], // Specify the alias 'course'
        });

        if (req.accepts("html")) {
            res.render('student', {
                allCourses,
                enrolledCourses,
                csrfToken: req.csrfToken()
            });
        } else {
            res.json(enrolledCourses);
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
        return res.render('courses',{allCourses,csrfToken:req.csrfToken()})
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
        const enrollment = await Enrollment.create({
            courseId: courseId,
            studentId: studentId,
        });

        res.redirect(`/students/${courseId}/chapters`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Get the list of chapters in a course before enrolling
// View chapters
app.get('/students/:courseId/chapters', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.user.id; // Get the user's ID from the logged-in session

        // Check if the user is enrolled in the course with the given courseId
        const isEnrolled = await Enrollment.findOne({
            where: {
                studentId: userId,
                courseId: courseId,
            },
        });

        if (isEnrolled) {
            // If the user is enrolled, fetch the chapters for the course and render the chapters page
            const chapters = await Chapter.getChapters({ courseId });
            res.render('stu_chapters', { chapters, courseId, userIsEnrolled: true, csrfToken: req.csrfToken() });
        } else {
            // If the user is not enrolled
            res.render('stu_chapters', { courseId, userIsEnrolled: false, csrfToken: req.csrfToken() });
        }
    } catch (error) {
        console.error(error);
        return res.status(422).json(error);
    }
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
});

// Student Dashboard Routes

// Display a list of courses the student is enrolled in
app.get("/students/courses",connectEnsureLogin.ensureLoggedIn(), (request, response) => {
    // Handle displaying enrolled courses here
});

// Allow students to mark pages as complete
app.post("/students/courses/:courseId/mark-complete",connectEnsureLogin.ensureLoggedIn(), (request, response) => {
    // Handle marking pages as complete here
});

// Progress Tracking Routes

// Show the progress status, possibly as a completion percentage
app.get("/students/courses/:courseId/progress",connectEnsureLogin.ensureLoggedIn(), (request, response) => {
    // Handle progress tracking here
});

app.listen(3000, () => {
    console.log("Started express server at port 3000");
});
