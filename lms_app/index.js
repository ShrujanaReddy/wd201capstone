const express = require('express');
const app = express();
const {Course,Chapter,Page,User}=require('./models')
const path=require('path')
const bodyParser=require('body-parser')
const passport=require('passport')
const connectEnsureLogin=require('connect-ensure-login')
const session=require('express-session')
const LocalStrategy=require('passport-local')
const bcrypt=require('bcrypt')

app.set("view engine","ejs")
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.json())

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
        res.render('index')
    } else {
        res.json(allCourses)
    }
})
app.get("/educator",connectEnsureLogin.ensureLoggedIn(),async (req,res)=>{
    const allCourses=await Course.getCourses()
    if(req.accepts("html")) {
        res.render('educator',{
            allCourses
        })
    } else {
        res.json(allCourses)
    }
})
app.get("/student",connectEnsureLogin.ensureLoggedIn(),async (req,res)=>{
    const allCourses=await Course.getCourses()
    if(req.accepts("html")) {
        res.render('student',{
            allCourses
        })
    } else {
        res.json(allCourses)
    }
})
app.use(express.static(path.join(__dirname,'public')))
// Educator Routes

//View all courses
app.get("/educators/courses",connectEnsureLogin.ensureLoggedIn(),async (req,res)=>{
    try {
        const courses=await Course.getmyCourses(req.user.id)
        return res.json(courses)
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
})
app.get('/createcourse',connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    // Render the course creation page
    res.render('createcourse.ejs');
})
app.get('/createchapter',connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    // Render the course creation page
    res.render('createchapter.ejs');
})
app.get('/createpage',connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    // Render the course creation page
    res.render('createpage.ejs');
})
//View the course chapters
app.get("/educators/courses/:courseId/chapters",connectEnsureLogin.ensureLoggedIn(),async (req,res)=>{
    try {
        const course = await Course.findByPk(req.params.courseId);
        if (!course) {
            throw new Error('Course not found'); // Handle the case where the course doesn't exist
        }
        else{
        const chapters=await Chapter.getChapters(req.params.courseId)
        return res.json(chapters)
        }
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
})
//View pages in a chapter
app.get("/educators/courses/:courseId/chapters/:chapterId/pages",connectEnsureLogin.ensureLoggedIn(),async (req,res)=>{
    try {
        const course = await Course.findByPk(req.params.courseId);
        if (!course) {
            throw new Error('Course not found'); // Handle the case where the course doesn't exist
        }
        const chapter = await Chapter.findByPk(req.params.chapterId);
        if (!chapter) {
        throw new Error('Chapter not found');
        }
        else{
        const pages=await Page.getPages({courseId:req.params.courseId,chapterId:req.params.chapterId})
        return res.json(pages)
        }
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
})
// Create a new course
app.post("/educators/courses/create",connectEnsureLogin.ensureLoggedIn(),async (req, res) => {
    // Handle course creation here
    try {
        const course=await Course.createCourse({title:req.body.title,description:req.body.description,educator_id:req.user.id})
        return res.json(course)
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
});

// Add chapters to a course
app.post("/educators/courses/:courseId/chapters/create",connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);

    if (!course) {
      throw new Error('Course not found'); // Handle the case where the course doesn't exist
    }

    const chapter = await Chapter.addChap({ title: req.body.title, courseId: req.params.courseId });
    return res.json(chapter);
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: error.message });
  }
});


// Add pages to a chapter in a course
app.post("/educators/courses/:courseId/chapters/:chapterId/pages/create",connectEnsureLogin.ensureLoggedIn(),async (req, res) => {
    // Handle adding pages here
    try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const chapter = await Chapter.findByPk(req.params.chapterId);
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const page = await Page.addPage({
      title: req.body.title,
      content: req.body.content,
      chapterId: req.params.chapterId,
      courseId:req.params.courseId
    });

    return res.json(page);
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: error.message });
  }
});

// Student Routes
//View all available courses
app.get("/students/courses",connectEnsureLogin.ensureLoggedIn(),async (req,res)=>{
    try {
        const courses=await Course.getCourses()
        return res.json(courses)
    } catch(error) {
        console.log(error)
        return res.status(422).json(error)
    }
})
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
    })
    } catch(error) {
        console.log(error)
    }
})
app.get("/signup", (req, res) => {
    // Handle student signup here
    res.render('signup')
});

// Returning students can log in
app.get("/signin", (req, res) => {
    // Handle student login here
    res.render('signin')
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
app.post("/students/enroll/:courseId",connectEnsureLogin.ensureLoggedIn(), (request, response) => {
    // Handle course enrollment here
});

// Get the list of chapters in a course before enrolling
app.get("/students/courses/:courseId/chapters",connectEnsureLogin.ensureLoggedIn(),async (req, res) => {
    // Handle getting chapter list here
    try {
    const course = await Course.findByPk(req.params.courseId);

    if (!course) {
      throw new Error('Course not found'); // Handle the case where the course doesn't exist
    }

    const chapter = await Chapter.addChap({ title: req.body.title, courseId: req.params.courseId });
    return res.json(chapter);
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: error.message });
  }
});

// Student Dashboard Routes

// Display a list of courses the student is enrolled in
app.get("/students/courses",connectEnsureLogin.ensureLoggedIn(), (request, response) => {
    // Handle displaying enrolled courses here
});

// Allow students to mark pages as complete
app.post("/students/courses/:courseId/pages/:pageId/mark-complete",connectEnsureLogin.ensureLoggedIn(), (request, response) => {
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
