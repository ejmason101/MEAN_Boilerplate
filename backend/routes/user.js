const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const User = require("../models/user");
const ResetPassword = require("../models/resetPassword");


const helpers = require("../utils/helpers");

/*
 _   _ _____ ___________   _     _____ _____ _____ _   _
| | | /  ___|  ___| ___ \ | |   |  _  |  __ \_   _| \ | |
| | | \ `--.| |__ | |_/ / | |   | | | | |  \/ | | |  \| |
| | | |`--. \  __||    /  | |   | | | | | __  | | | . ` |
| |_| /\__/ / |___| |\ \  | |___\ \_/ / |_\ \_| |_| |\  |
 \___/\____/\____/\_| \_| \_____/\___/ \____/\___/\_| \_/
*/
// :/api/user/login
router.post("/login", (req, res, next) => {
    console.log('/api/user/login');
    // console.log(req.body.email);
    // validate credentials
    // if email exists
    let fetchedUser;
    User.findOne({
        email: req.body.email
    })
        .then(user => {
            // user exists, email exists
            // console.log(user);
            if (!user) {
                // user does not exist
                // console.log('User email does not exist');
                return res.status(401).json({
                    message: "Auth Failed! No Email exists!"
                })
            }
            // user was found
            // compare the passwords
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            console.log(result);
            // console.log(user);
            // true if they are the same passws
            if (!result) {
                // passwords dont match
                console.log('Password mismatch');
                return res.status(401).json({
                    message: "Auth Failed! Password Mismatch"
                });
            }
            // we have valid password
            // give them a valid json token
            const token = jwt.sign({
                email: fetchedUser.email,
                userId: fetchedUser._id,
            }, "kitt kats make me walk like im listening to bass music bro", {
                    expiresIn: "1h"
                });

            console.log("Result from attempt at login:");
            console.log(fetchedUser);

            res.status(200).json({
                token: token,
                expiresIn: 3600,        // Set token to expire in an hour
                loggedInUser: fetchedUser.toClient(),
                message: "User Auth Successful!"
            })
        })
        .catch(err => {
            // catch any errors
            // console.log(err);
            console.log('final catch');
            return res.status(401).json({
                message: "Auth Failed! No User Email Found"
            });
        });
});

/*
 _____  _____ _____            _   _ _____ ___________   _____ _   _ ______ _____
|  __ \|  ___|_   _|          | | | /  ___|  ___| ___ \ |_   _| \ | ||  ___|  _  |
| |  \/| |__   | |    ______  | | | \ `--.| |__ | |_/ /   | | |  \| || |_  | | | |
| | __ |  __|  | |   |______| | | | |`--. \  __||    /    | | | . ` ||  _| | | | |
| |_\ \| |___  | |            | |_| /\__/ / |___| |\ \   _| |_| |\  || |   \ \_/ /
 \____/\____/  \_/             \___/\____/\____/\_| \_|  \___/\_| \_/\_|    \___/
*/
// GET @ /api/user/getInfo/:id
router.get("/getInfo", checkAuth, (req, res, next) => {
    console.log("Searching and returing sanatized user Info");

    User.findOne({ _id: req.body.userId })
        .then(userInfo => {
            console.log("unsanatized user inf");
            console.log(userInfo);
        })
        .catch(err => {
            console.log("error retreiving sanatized user info");
            console.log(err);
        })
})



/* ==================================================

    Start the User Password Reset Workflow

    GET @ /api/user/startPasswordReset
==================================================*/
router.get("/startPasswordReset/:userEmail", (req, res, next) => {
    console.log('\nPOST@/api/user/startPasswordReset');
    // console.log(req.params.uid);
    console.log('Email for account reset: ');
    console.log(req.params.userEmail);


    // New Workflow
    /*
        1. Find the user with that email
            if exists, create the reset token

            if no exists, send error message back
    */
    User.findOne({ email: req.params.userEmail })
        .then(result => {

            console.log('Result from Userfind one: ' + result);
            
            if (!result) {
                // console.log("no account found with email: " + req.params.userEmail);

            }

            const newResetToken = new ResetPassword({
                uid: result._id
            })


            newResetToken.save(
                { new: true }    // return the saved entry with the _id
            )
                .then(results => {
                    console.log('password reset token successfully saved');


                    /*
                        Using an env variable for the hostname of the server

                        if there is no openshift mongodb url, then it sets the 
                        resetPasswordLink to localhost:4200

                        if there is an openshift mongodb url, 
                        resetPasswordLink is set to http://fjlrs.origin.uark.edu
                    */

                    let emailBody = {
                        to: req.params.userEmail,
                        subject: 'FJLRS - Reset Password Request',
                        html: 'Please click on ' + process.env.resetPasswordLink + req.params.uid + ' to reset your password!'
                    }

                    // Pass along the rest of this request to be handled by the email call
                    helpers.sendEmailFromAlertAdminAccount(emailBody, res); // will return a res.status

                })
                .catch(err => {
                    console.log('error creating the password reset token!');
                    console.log(err);
                    return res.status(200).json({
                        message: {
                            severity: 'error',
                            summary: 'ResetPassword token failed to create!',
                            detail: 'Possibility that this user already has an open password reset active'
                        }
                    })
                })


        })
        .catch(err => {
            console.log('!!! Error on User.findOne with email as search');
            console.log(err);
        })

})

router.get("/verifyCanResetPassword/:uid", (req, res, next) => {

    ResetPassword.findOne({ uid: req.params.uid })
        .then(result => {
            console.log('ResetPassword token search successful');
            console.log(result);

            // Might need to check and make sure that something returned
            if (!result) {
                // If there were no results
                return res.status(200).json({
                    message: {
                        severity: 'warn',
                        summary: 'No ResetPassword token found',
                        detail: 'Unable to allow password reset. Contact system administrator if you believe this to be in error'
                    },
                    isValid: false
                })
            }

            return res.status(200).json({
                message: {
                    severity: 'success',
                    summary: 'Valid Session',
                    detail: 'Reset password link valid!'
                },
                isValid: true
            })
        })
        .catch(err => {
            console.log("ERROR searching for a valid ResetPassword token for uid");
            console.log(err);
            return res.status(200).json({
                message: {
                    severity: 'warn',
                    summary: 'No ResetPassword token found.',
                    detail: 'Unable to allow password reset.  Contact system administrator if you believe this to be in error'
                },
                isValid: false
            })
        })
})

router.get("/passwdUpdate/:uid/:newPasswd", (req, res, next) => {
    // Update the password
    // then remove the PasswordReset token
    console.log("GET@/api/user/passwdUpdate/:uid/:newPasswd");
    console.log("uid: " + req.params.uid);
    console.log("newPasswd: " + req.params.newPasswd);

    // First hash the new password with bcrypt
    bcrypt.hash(req.params.newPasswd, 10)
        .then(hash => {
            console.log('setting users password to hash: ' + hash);

            // First make sure that there is still a valid token
            ResetPassword.findOneAndDelete({ uid: req.params.uid })
                .then(result => {

                    // Check if there was actually a token deleted
                    if (!result) {
                        // There were no tokens that matched to delete
                        return res.status(200).json({
                            message: {
                                severity: 'error',
                                summary: 'Error!',
                                detail: 'No valid ResetPassword tokens for user account!'
                            }
                        });
                    }

                    // There was a token that was deleted
                    // Make request to hash and update the password field
                    User.findByIdAndUpdate({ _id: req.params.uid }, { password: hash })
                        .then(result => {
                            console.log("User account password updated successfully!");
                            console.log(result);

                            return res.status(200).json({
                                message: {
                                    severity: 'success',
                                    summary: 'Password updated!',
                                    detail: 'User account password successfully updated'
                                }
                            });
                        })
                        .catch(err => {
                            console.log("User account password FAILED UPDATE!");
                            console.log(err);

                            return res.status(200).json({
                                message: {
                                    severity: 'error',
                                    summary: 'Password Update Failed!',
                                    detail: err
                                }
                            });
                        })

                })
                .catch(err => {
                    console.log('!!! error removing reset token');
                    console.log(err);
                    return res.status(200).json({
                        message: {
                            severity: 'error',
                            summary: 'RestPassword Token Removal Error',
                            detail: err
                        }
                    });
                })

        }) // end of hasing callback


})

/*
______ _____ _____ _____            _   _  _____ _    _   _   _ _____ ___________
| ___ \  _  /  ___|_   _|          | \ | ||  ___| |  | | | | | /  ___|  ___| ___ \
| |_/ / | | \ `--.  | |    ______  |  \| || |__ | |  | | | | | \ `--.| |__ | |_/ /
|  __/| | | |`--. \ | |   |______| | . ` ||  __|| |/\| | | | | |`--. \  __||    /
| |   \ \_/ /\__/ / | |            | |\  || |___\  /\  / | |_| /\__/ / |___| |\ \
\_|    \___/\____/  \_/            \_| \_/\____/ \/  \/   \___/\____/\____/\_| \_|
*/
// create new user
router.post("/signup", (req, res, next) => {
    // create new user and store to database

    console.log("create user data");
    console.log(req.body);

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: hash,
                studentID: req.body.studentID,
                phone: req.body.phone,
                userLevel: req.body.userLevel
            });
            console.log("user being saved to db");
            console.log(user);
            user.save()
                .then(result => {
                    console.log("created new user successfully");
                    res.status(201).json({
                        message: "User Created Successfull!",
                        result: result
                    });
                })
                .catch(err => {
                    console.log("new user create failed");
                    res.status(500).json({ message: "User Email Alread Exists" })
                });
        })




});


/*


______ _____ _____ _____             ___ _________  ________ _   _   _   _ _____ ___________
| ___ \  _  /  ___|_   _|           / _ \|  _  \  \/  |_   _| \ | | | | | /  ___|  ___| ___ \
| |_/ / | | \ `--.  | |    ______  / /_\ \ | | | .  . | | | |  \| | | | | \ `--.| |__ | |_/ /
|  __/| | | |`--. \ | |   |______| |  _  | | | | |\/| | | | | . ` | | | | |`--. \  __||    /
| |   \ \_/ /\__/ / | |            | | | | |/ /| |  | |_| |_| |\  | | |_| /\__/ / |___| |\ \
\_|    \___/\____/  \_/            \_| |_/___/ \_|  |_/\___/\_| \_/  \___/\____/\____/\_| \_|



*/

// Development route to create new admin user
router.get("/createAdminUser", (req, res, next) => {
    console.log("create new admin user with email admin@uark.edu and password test");

    bcrypt.hash("test", 10)
        .then(hash => {
            const user = new User({
                firstname: "ADMIN",
                lastname: "USER",
                email: "admin@uark.edu",
                password: hash,
                studentID: "000000000",
                phone: "000000000",
                userLevel: "admin",
                laserLab01: true,
                laserLab02: true,
                woodShop01: true,
                woodShop02: true,
                woodShop03: true,
                plotters: true,
                projectors: true
            });
            user.save()
                .then(result => {
                    console.log("created new admin user successfully");
                    res.status(201).json({
                        message: "User Created Successfull!",
                        result: result
                    });
                })
                .catch(err => {
                    console.log("new user create failed");
                    res.status(500).json({ message: "User Email Alread Exists" })
                });
        })
}); // end create admin user

/*
______ _____ _____ _____            ________  _________   _   _ _____ ___________
| ___ \  _  /  ___|_   _|          |  ___|  \/  || ___ \ | | | /  ___|  ___| ___ \
| |_/ / | | \ `--.  | |    ______  | |__ | .  . || |_/ / | | | \ `--.| |__ | |_/ /
|  __/| | | |`--. \ | |   |______| |  __|| |\/| ||  __/  | | | |`--. \  __||    /
| |   \ \_/ /\__/ / | |            | |___| |  | || |     | |_| /\__/ / |___| |\ \
\_|    \___/\____/  \_/            \____/\_|  |_/\_|      \___/\____/\____/\_| \_|
*/
router.get("/createEmployeeUser", (req, res, next) => {
    console.log("create new Employee user with email Employee@uark.edu and password test");

    bcrypt.hash("test", 10)
        .then(hash => {
            const user = new User({
                firstname: "Employee",
                lastname: "User",
                email: "employee@uark.edu",
                password: hash,
                studentID: "1212121212",
                phone: "000000000",
                userLevel: "employee",
                laserLab01: true,
                laserLab02: true,
                woodShop01: true,
                woodShop02: true,
                woodShop03: true,
                plotters: true,
                projectors: true
            });
            user.save()
                .then(result => {
                    console.log("created new admin user successfully");
                    res.status(201).json({
                        message: "User Created Successfull!",
                        result: result
                    });
                })
                .catch(err => {
                    console.log("new user create failed");
                    res.status(500).json({ message: "User Email Alread Exists" })
                });
        })
}); // end create admin user

/*
______ _____ _____ _____            _____ ___________   _   _ _____ ___________
| ___ \  _  /  ___|_   _|          /  ___|_   _|  _  \ | | | /  ___|  ___| ___ \
| |_/ / | | \ `--.  | |    ______  \ `--.  | | | | | | | | | \ `--.| |__ | |_/ /
|  __/| | | |`--. \ | |   |______|  `--. \ | | | | | | | | | |`--. \  __||    /
| |   \ \_/ /\__/ / | |            /\__/ / | | | |/ /  | |_| /\__/ / |___| |\ \
\_|    \___/\____/  \_/            \____/  \_/ |___/    \___/\____/\____/\_| \_|
*/
router.get("/createStudentUser", (req, res, next) => {
    console.log("create new student user with email student@uark.edu and password test");

    bcrypt.hash("test", 10)
        .then(hash => {
            const user = new User({
                firstname: "Student",
                lastname: "User ",
                email: "student@uark.edu",
                password: hash,
                studentID: "123456789",
                phone: "000000000",
                userLevel: "student",
                laserLab01: true,
                laserLab02: false,
                woodShop01: true,
                woodShop02: false,
                woodShop03: false,
                plotters: false,
                projectors: false
            });
            user.save()
                .then(result => {
                    console.log("created new admin user successfully");
                    res.status(201).json({
                        message: "User Created Successfull!",
                        result: result
                    });
                })
                .catch(err => {
                    console.log("new user create failed");
                    res.status(500).json({ message: "User Email Alread Exists" })
                });
        })
}); // end create admin user



/*


 _____  _____ _____             ___   _      _       _   _ _____ ___________  _____
|  __ \|  ___|_   _|           / _ \ | |    | |     | | | /  ___|  ___| ___ \/  ___|
| |  \/| |__   | |    ______  / /_\ \| |    | |     | | | \ `--.| |__ | |_/ /\ `--.
| | __ |  __|  | |   |______| |  _  || |    | |     | | | |`--. \  __||    /  `--. \
| |_\ \| |___  | |            | | | || |____| |____ | |_| /\__/ / |___| |\ \ /\__/ /
 \____/\____/  \_/            \_| |_/\_____/\_____/  \___/\____/\____/\_| \_|\____/



*/
// GET@ /api/users
router.get("", checkAuth, (req, res, next) => {
    console.log('GET @ /api/users');
    console.log('returning list of all users');

    User.find().then(result => {
        console.log('User.find() results');
        console.log(result);
        result = result.map(elem => {
            return elem.toClient(); // mongoose schema function to rename _id to id
        });


        console.log(result);

        res.status(201).json({
            message: "All Users fetched successfully",
            users: result
        });
    })
})


/*================================
    Update training levels for user


______ _____ _____ _____            ___________ _   _ _____   _     _   _ _
| ___ \  _  /  ___|_   _|          |_   _| ___ \ \ | |  __ \ | |   | | | | |
| |_/ / | | \ `--.  | |    ______    | | | |_/ /  \| | |  \/ | |   | | | | |
|  __/| | | |`--. \ | |   |______|   | | |    /| . ` | | __  | |   | | | | |
| |   \ \_/ /\__/ / | |              | | | |\ \| |\  | |_\ \ | |___\ \_/ / |____
\_|    \___/\____/  \_/              \_/ \_| \_\_| \_/\____/ \_____/\___/\_____/




    POST @ /api/user/updateUser
    ================================*/
router.post("/updateUserTraining", checkAuth, (req, res, next) => {
    console.log("\n\nPOST @ /api/user/updateUser");
    console.log(req.body);


    User.findOneAndUpdate(
        { _id: req.body.userId },
        {
            laserLab01: req.body.laserLab01,
            laserLab02: req.body.laserLab02,
            woodShop01: req.body.woodShop01,
            woodShop02: req.body.woodShop02,
            woodShop03: req.body.woodShop03,
            plotters: req.body.plotters,
            projectors: req.body.projectors
        },
        { new: true }
    )
        .then(result => {
            console.log("\nResult from updating User training levels mongod:");
            console.log(result);

            console.log("!!! returning status of 200 to client");
            return res.status(200).json({ message: "Successfully updated user training levels!" });
        })
        .catch(err => {
            console.log("Error on updating user training levels in mongoDB");
            console.log(err);
        })
})





/* ================================

    Get All the users history items and notes -- for use in rendering user in admin-panel

    GET @ /api/users/getHistoryAndNotes/:id

    1. make sure UID exists
    2. Query all history elements
    3. query printerJobs from history elements
    4. get all printerJobs that belong to the UID

    5. Query all userNotes for UID TODO MAKE USER NOTES




 _____  _____ _____            _   _ _____ _____ _____ _____________   __
|  __ \|  ___|_   _|          | | | |_   _/  ___|_   _|  _  | ___ \ \ / /
| |  \/| |__   | |    ______  | |_| | | | \ `--.  | | | | | | |_/ /\ V /
| | __ |  __|  | |   |______| |  _  | | |  `--. \ | | | | | |    /  \ /
| |_\ \| |___  | |            | | | |_| |_/\__/ / | | \ \_/ / |\ \  | |
 \____/\____/  \_/            \_| |_/\___/\____/  \_/  \___/\_| \_| \_/




===================================*/
router.get("/getHistoryAndNotes/:id", checkAuth, (req, res, next) => {
    console.log('\n\n========== Get history and notes for UID: ' + req.params.id + " =============");


})

module.exports = router;
