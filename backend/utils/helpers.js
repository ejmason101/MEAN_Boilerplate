const EmailHistory = require("../models/emailHistory");
const EmailAccount = require("../models/email");

const nodemailer = require("nodemailer"); // for sendEmailFromAlertAdminAccount()

function getAllEmailHistory(callback){
  console.log("emailHistoryHelper.getAllEmailHistory()");

  EmailHistory.find()
    .then(documents => {
      console.log("Email History Items: ");
      console.log(documnets);

      callback(null, documnets);
    })
    .catch(err => {
      console.log('!!! Error getting EmailHistory items from db...');
      console.log(err);

      callback(err, null);
    })
}


function saveEmailHistoryItem(mailOptions, responseCode, callback) {
  console.log("\n SAVING EMAIL SENT -- emailHistoryHelper.saveEmailHistoryItem()");
  console.log(mailOptions);
  console.log(responseCode);

  var currentdate = new Date();
var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

  let newEmailItem = new EmailHistory({
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
    sendDate: datetime,
    rc: responseCode
  })

  newEmailItem.save()
    .then(savedHistoryItem => {
      console.log("Email History Item saved successfully...");
      // console.log(savedHistoryItem);
      callback(null, savedHistoryItem);

    })
    .catch(err => {
      console.log("ERROR! saving email history item to the db");
      console.error(err);
      callback(err, savedHistoryItem);

      // TODO send an alert email to DBA for Database Save faileure

    })
}



function sendEmailFromAlertAdminAccount(emailBody, res) {
  console.log('Helpers::sendEmailFromAlertAdminAccount()');
  console.log(emailBody);

  EmailAccount.findOne({ type: "alertadmin" }).then(result => {
      console.log("Result from getting sys app email: ");
      console.log(result);
  
      if (!result) {
        // the result is null
        return res.status(200).json({
          severity: "warn",
          summary: "Failed!",
          detail:
            "Transporter email account failed Authentication, Make sure a valid System Alert Email Address Exists"
        });
      }
      // TODO make the service custom to the email that is in the db
      // do some splitting
  
      // // Getting the 'service' programatically
      // let fullEmail = result.email;
      // fullEmail = fullEmail.split("@");
      // fullEmail = fullEmail[1].split(".");
      // let service = fullEmail[0];
      // // Not using this right now as I was trouble shooting the email server
  
      // Create the transport object
      var transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        auth: {
          user: result.email,
          pass: result.password
        }
      });
  
      // Temp for the offloading of sending
      // var mailOptions = emailBody;
      // var emailBody = {
      //   from: result.email,
      //   to: emailBody.to,
      //   subject: emailBody.subject,
      //   html: emailBody.html
      // };

      emailBody.from = result.email; // append a field for from
  
      console.log("Email attempting to be sent....");
      console.log(emailBody);
      transporter.sendMail(emailBody, function(error, info) {
        if (error) {
          console.log("\n!!!! ERROR response from transporter.sendMail");
          console.log(error.response);
          console.log(info);
  
          // Save This Email to the EmailHistoryDB
          // helpers.saveEmailHistoryItem( emailBody, error.response);
  
          transporter.close();
          if ("Username and Password not accepted." in error) {
            return res.status(200).json( {message: {
              severity: "error",
              summary: "Error!",
              detail: "Username and Password not accpeted"
            }});
          }
          return res.status(200).json({message:{
            severity: "error",
            summary: "Error!",
            detail: error.response
          }});
        } else {
          console.log("!!!Email was sent successfully: " + info.response);
          // helpers.saveEmailHistoryItem( emailBody, info.response);
          console.log("\tattempting to save the email history item...");
  
          saveEmailHistoryItem(emailBody, info.response, function(
            err,
            historySavedStatus
          ) {
            if (err) {
              console.log("Error with saving history item...");
              return res.status(200).json({message: {
                severity: "error",
                summary: "Email API Server",
                detail: "Error... :"
              }});
            }
  
            console.log("Response from saving email history item in helpers::sendEmailFromAlertAdminAccount");
            console.log(historySavedStatus);
  
            transporter.close();
  
            return res.status(200).json( {message: {
              severity: "success",
              summary: "Success!",
              detail:
                "Email sent to " +
                emailBody.to +
                " with returnCode: " +
                historySavedStatus.rc
            }});
          });
        }
      });
    });

};
// TODO add the sendemail helper here, 
// ? Matter of fact offload all shared items here

exports.saveEmailHistoryItem = saveEmailHistoryItem;

exports.sendEmailFromAlertAdminAccount = sendEmailFromAlertAdminAccount;