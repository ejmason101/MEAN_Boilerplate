import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

import { MessageService, ConfirmationService } from 'primeng/api';
import { MatDialog } from '@angular/material';
import { NewemailaccountComponent } from 'src/app/shared-components/newemailaccount/newemailaccount.component';
import { UserService } from 'src/app/admin/manage-users/user.service';

// Confirm dialog


// @ViewChild('sidenav')
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [MessageService, ConfirmationService]
})
export class LoginComponent implements OnInit, OnDestroy {
    isLoading = false;

    public myNav: any;

    private authStatusSub: Subscription;

    private pMessageSub: Subscription;

    // Subscription for trying to authenticate
    private authSub: Subscription;

    // For the reset password button to be able to grab value of the email field
    emailInput: string;


    // inject so we can use the auth.service.js
    constructor(public authService: AuthService,
                public userService: UserService,
                private messageService: MessageService,
                private confirmationService: ConfirmationService,
                private dialog: MatDialog){}

    ngOnInit() {
        this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
            authStatus => {
                this.isLoading = false;
            }
        ); 

        this.pMessageSub = this.authService.getPMessageUpdateListener().subscribe(
            newMsg => {
                console.log('PMessages updated from authService call!');
                console.log(newMsg);
                this.messageService.add({
                    severity: newMsg.severity,
                    summary: newMsg.summary,
                    detail: newMsg.detail
                });
            }
        );

    }


    getEmailForPasswdReset() {
        // Form is valid in this case if there is an email
        console.log('Checking if email present to begin password reset workflow...');
        console.log();        // If no email passed when this button clicked, then give error message saying
        
        console.log('NewEmailAccount Dialog for new admin email account...');
        // this.msgs = [];
        const dialogRef = this.dialog.open(NewemailaccountComponent, {
        width: '350px',
        data: 'Enter email address associated with your account:'
        });
        dialogRef.afterClosed().subscribe(result => {
        if (result) {
            console.log('Yes clicked');
            console.log(result);
            
            // Start the password reset workflow
            this.userService.startPasswordResetWorkflow(result.data); // result is the email input from popup form
        }
        });

    }

    onLogin(form: NgForm) {
        console.log(form.value);
        if(form.invalid) {
            return;
        }

        // alert("Currently in BETA");
        this.authService.loginUser(form.value.email, form.value.password);


        // CONFIRM BANNER FOR BETA VERSION HERE

        // Will only allow an attempt at loggin in if they accept the Beta Disclaimer
        // this.confirmationService.confirm({
        //     header: 'BETA Testing Notification',
        //     message: '<h1>BETA v0.1.7</h1> <li>Some features might be broken</li><li>Break During Use</li><li>Not Work as expected</li><li>If you encounter a problem, please submit a bug request via the link in the menu!</li><li>Thank you!</li>',
        //     acceptLabel: 'Accept',
        //     rejectLabel: 'DENY',
        //     accept: () => {
        //         this.isLoading = true;
        //         this.messageService.add({
        //             severity: 'success',
        //             summary: 'Beta Disclaimer',
        //             detail: 'Accepted Disclaimer!'
        //         });
        //         this.authService.loginUser(form.value.email, form.value.password);
        //     },
        //     reject: () => {
        //         this.messageService.add({
        //             severity: 'info',
        //             summary: 'Beta Disclaimer',
        //             detail: 'You must accept Beta Disclaimer to be alloed to login'
        //         });

        //         // Maybe redirect to a help page/whatever
        //     }
        // })
        // This immedieatly returns? no promise

    }

    ngOnDestroy() {
        this.authStatusSub.unsubscribe();
    }
}