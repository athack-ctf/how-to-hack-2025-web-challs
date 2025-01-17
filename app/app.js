const express = require("express");
const nunjucks = require('nunjucks');
const cookieParser = require('cookie-parser');
const path = require("path");

const PORT = 2025;
const app = express();

// ---------------------------------------------------------------------------------------------------------------------
// Middlewares
// ---------------------------------------------------------------------------------------------------------------------

app.use(express.static(path.join(__dirname, "public")));

nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app,
    // Watch files for changes (useful for development)
    watch: true,
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

const challenges = {};

// ---------------------------------------------------------------------------------------------------------------------
// Stegano Chall: the-right-to-inspect
// ---------------------------------------------------------------------------------------------------------------------

challenges["hidden-in-plain-sight"] = {
    title: 'Hidden in Plain Sight',
    description: 'I can\'t see anything without my glasses...',
    files: [{
        location: "stegano/ww.jpg",
        name: "ww.jpg",
    }],
    type: "stegano",
};

// ---------------------------------------------------------------------------------------------------------------------
// Stegano Chall: the-right-to-inspect
// ---------------------------------------------------------------------------------------------------------------------

challenges["diggy-diggy-hole"] = {
    title: 'Diggy Diggy Hole',
    description: 'Walter desperately needs your help... he sent you a picture, it seems there is more to it... ' +
        'You gotta do some digging around to find the flag!',
    files: [{
        location: "stegano/ww.jpg",
        name: "ww.jpg",
    }],
    type: "stegano",
};

// ---------------------------------------------------------------------------------------------------------------------
// Web Chall: the-right-to-inspect
// ---------------------------------------------------------------------------------------------------------------------

challenges["the-right-to-inspect"] = {
    title: 'The right (click) to inspect',
    description: 'Show us your browser inspection skills!',
    type: "web",
};

app.get(`/challs/the-right-to-inspect`, (req, res) => {
    res.render('the-right-to-inspect/index.twig');
});

app.get(`/challs/the-right-to-inspect/humans.txt`, (req, res) => {

    const cookie = 'the-right-to-inspect-hint';
    const nextHint = 'We_are_now_following_RFC_9116._Since_the_flag_is_of_security_concerns_we_moved_it_there...';
    res.cookie(cookie, nextHint, {
        httpOnly: true,
        secure: true
    });

    const hint = "# Hint: why don't you check your cookies?";
    res.type('text/plain').send(hint);
});

// ---------------------------------------------------------------------------------------------------------------------
// Web Chall: this feature is off
// ---------------------------------------------------------------------------------------------------------------------

challenges["this-feature-is-off"] = {
    title: 'This feature is off',
    description: 'Can you use features that are off?',
    type: "web",
};

app.get(`/challs/this-feature-is-off`, (req, res) => {
    res.render('this-feature-is-off/index.twig');
});


app.get(`/challs/this-feature-is-off/get-flag`, (req, res) => {
    return res.redirect("/challs/this-feature-is-off");
});

app.post(`/challs/this-feature-is-off/get-flag`, (req, res) => {

    const {number} = req.body;

    let flag;

    // Ensure number is provided and is greater than 2025
    if (!!number && !isNaN(parseFloat(number)) && parseFloat(number) > 2025) {
        flag = 'HOWTOHACK{y0u_kn0w_html_5tuff}';
    } else {
        flag = '?';
    }

    return res.render("this-feature-is-off/get-flag.twig", {flag: flag});
});

// ---------------------------------------------------------------------------------------------------------------------
// Web Chall: bad authentication
// ---------------------------------------------------------------------------------------------------------------------

challenges["bad-authentication"] = {
    title: 'Bad Authentication',
    description: 'Can you login and get the flag?',
    type: "web",
};

app.get(`/challs/bad-authentication`, (req, res) => {
    res.render('bad-authentication/index.twig');
});

app.get(`/challs/bad-authentication/get-flag`, (req, res) => {
    res.render('bad-authentication/get-flag.twig');
});

// ---------------------------------------------------------------------------------------------------------------------
// Web Chall: another bad authentication
// ---------------------------------------------------------------------------------------------------------------------

challenges["another-bad-authentication"] = {
    title: 'Another Bad Authentication',
    description: 'Can you login (again) and get the flag?',
    type: "web",
};

app.get(`/challs/another-bad-authentication`, (req, res) => {
    res.render('another-bad-authentication/index.twig', {
        is_auth: req.cookies.is_auth === "true",
        is_admin: req.cookies.is_admin === "true"
    });
});

// Handle login POST request
app.post('/challs/another-bad-authentication/login', (req, res) => {
    const {username, password} = req.body;

    // Hardcoded admin credentials (who cares?)
    const adminUsername = 'admin';
    const adminPassword = '#!adminadmin123';

    // Check if the login is for admin
    if (username === adminUsername && password === adminPassword) {
        res.cookie('is_auth', 'true', {httpOnly: true});
        res.cookie('is_admin', 'true', {httpOnly: true});
        return res.redirect("/challs/another-bad-authentication/");
    }

    // Check if the login is for guest
    const guestUsername = 'guest';
    const guestPassword = 'secret';

    if (username === guestUsername && password === guestPassword) {
        res.cookie('is_auth', 'true', {httpOnly: true});
        res.cookie('is_admin', 'false', {httpOnly: true});
        return res.redirect("/challs/another-bad-authentication/");
    }

    return res.redirect("/challs/another-bad-authentication/?error");
});

// Handle logout (clear cookies)
app.post('/challs/another-bad-authentication/logout', (req, res) => {
    res.clearCookie('is_auth');
    res.clearCookie('is_admin');
    return res.redirect("/challs/another-bad-authentication/");
});

// ---------------------------------------------------------------------------------------------------------------------
// Challs menu
// ---------------------------------------------------------------------------------------------------------------------

// Adding name attribute to each chall
Object.entries(challenges).forEach(([name, chall]) => {
    chall.name = name
});

app.get("/", (req, res) => {
    res.render('index/index.twig', {
        steganoChalls: Object.values(challenges).filter(chall => chall.type === "stegano"),
        webChalls: Object.values(challenges).filter(chall => chall.type === "web"),
    });
});

// ---------------------------------------------------------------------------------------------------------------------
// Running the server
// ---------------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
