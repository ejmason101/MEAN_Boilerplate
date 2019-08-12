import { Component, OnInit } from '@angular/core';

// For shared confirmation-dialog component
import { MatDialogConfig, MatDialog, MatTableDataSource } from '@angular/material';
import { NewDeptInfoDialogComponent } from 'src/app/shared-components/new-dept-info-dialog/new-dept-info-dialog.component';
import { MessageService, Message } from 'primeng/api';
import { ManageDeptService } from './manage-depts.service';
import { Subscription } from 'rxjs';

import { NgForm } from '@angular/forms';

import { DeptInfo, PMessage, BuisnessHoursOverride } from '../../../assets/interfaces';

import { Moment } from 'moment';
import { ConfirmationDialogComponent } from 'src/app/shared-components/confirmation-dialog/confirmation-dialog.component';



@Component({
  selector: 'app-manage-depts',
  templateUrl: './manage-depts.component.html',
  styleUrls: ['./manage-depts.component.css'],
  providers: [MessageService]
})
export class ManageDeptsComponent implements OnInit {


  isLoading = false;

  // CONTROLS FOR MODIFY PANEL PARTS
  showModifyPanel = false; // render or dont render
  editDeptMode = false;   // if either editing an existing dept or creating a new one



  public weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Every Day'];
  modifyPanelDeptIndex: number;       // Holds the index of current deptInfo in the deptInfo array
  modifyPanelDeptInfo: DeptInfo;  // Holds the values of the current deptInfo, if modifying existing dept
  modifyPanelDeptId: string;

  //* Variables For The ModifyPanel Form
  /*
    What needs to happen is that the form will only be bound to these variables

    When a new dept is created, it is just bound and then a DeptInfo object created with these variables

    When an existing dept is modifyied, first the entry has all values copied to these variables
      On form submit, these values will be 
        1. Sane time checked
        2. Make
  */
  public deptFormName: String;

  // public timeSelectFormData:FormTimesData[] = [];

  public mondayOpenStatus: boolean;
  public mondayOpenTime: Date;
  public mondayCloseTime: Date;

  public tuesdayOpenStatus: boolean;
  public tuesdayOpenTime: Date;
  public tuesdayCloseTime: Date;

  public wednesdayOpenStatus: boolean;
  public wednesdayOpenTime: Date;
  public wednesdayCloseTime: Date;

  public thursdayOpenStatus: boolean;
  public thursdayOpenTime: Date;
  public thursdayCloseTime: Date;

  public fridayOpenStatus: boolean;
  public fridayOpenTime: Date;
  public fridayCloseTime: Date;

  public saturdayOpenStatus: boolean;
  public saturdayOpenTime: Date;
  public saturdayCloseTime: Date;

  public sundayOpenStatus: boolean;
  public sundayOpenTime: Date;
  public sundayCloseTime: Date;


  //-----MANAGE BUISNESS HOURS OVERRIDES CONTROLS
  showEditOverrides = false; // controls if the modify panel is shown
  editOverrideMode = false; // default to create new override panel rendering
  editOverridesId: string = ''; // ID of the override rule being edited
  currentOverrideEdit: BuisnessHoursOverride;
  // Variables for the buisness hours override form
  public buisnessHoursOverrideReason: string;
  public rangeDates: Date[];
  public overrideStartDate: Date;
  public overrideEndDate: Date;
  public dayOfWeek: number;
  public altOpenTime: Date;
  public altCloseTime: Date;
  public isOpen: boolean;


  // PrimeNG p-messages
  msgs: Message[] = [];
  private messagesUpdatedSub: Subscription;

  // Holding DeptInfo Data and subscription
  deptInfo: DeptInfo[] = [];
  private deptInfoUpdatedSub: Subscription;


  constructor(
    private deptService: ManageDeptService,
    private messageService: MessageService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {

    // TODO Get initial data needed here
    this.deptService.getDepartments();

    this.clearModifyPanel(); // hide the create/edit panel and show default info box

    // Setup Update Subscriptions
    this.deptInfoUpdatedSub = this.deptService.getDepartmentsUpdatedListener()
      .subscribe((newDeptInfo: DeptInfo[]) => {
        console.log('ManageDeptComponent::deptInfoUpdatedSub updated with new values --->');
        console.log(newDeptInfo);

        // Clear the modify panel
        // Initialize the modify panel to have default values

        // Prepares the buisnessHours panel to default values
        this.onShowModifyPanelNew();
        // Prepares the buisnessHoursOverride panle to have default values
        this.onShowCreateNewOverrideCard();
        // Then hide the panel
        // this.clearModifyPanel();

        this.deptInfo = [];
        this.deptInfo = newDeptInfo;

        let deptInfoUpdatedMessage = {
          severity: 'success',
          summary: 'DeptInfo Subscription updated!',
          detail: 'New DeptInfo data'
        };

        // this.messageService.clear();
        this.messageService.add(deptInfoUpdatedMessage);

      });

    // Setup PMessages Subscription
    this.messagesUpdatedSub = this.deptService.getMessagesUpdatedListener()
      .subscribe((newPMessages: any[]) => {
        console.log('new pmessages from manage-depts component...');
        console.log(newPMessages);

        this.messageService.clear();
        newPMessages.forEach(elem => {
          this.messageService.add(elem);
        });
        // this.messageService.addAll(newPMessages);
      });



    this.isLoading = false;
  }

  clearOverrideRuleForm() {
    // Clear the Override rule form
    // set display to false

  }


  /*
    ___  ______________ _____________   __ ______  ___   _   _  _____ _ 
    |  \/  |  _  |  _  \_   _|  ___\ \ / / | ___ \/ _ \ | \ | ||  ___| |
    | .  . | | | | | | | | | | |_   \ V /  | |_/ / /_\ \|  \| || |__ | |
    | |\/| | | | | | | | | | |  _|   \ /   |  __/|  _  || . ` ||  __|| |
    | |  | \ \_/ / |/ / _| |_| |     | |   | |   | | | || |\  || |___| |____
    \_|  |_/\___/|___/  \___/\_|     \_/   \_|   \_| |_/\_| \_/\____/\_____/

  */

  clearModifyPanel() {
    this.showModifyPanel = false;

    // Set all of the opening times 
    // this.mondayOpenTime
    // this.tuesdayOpenTime
    // this.wednesdayOpenTime
    // this.thursdayOpenTime
    // this.fridayOpenTime
    // this.saturdayCloseTime
    // this.sundayCloseTime
    // // Set all of the closing times
    // this.mondayOpenTime
    // this.tuesdayOpenTime
    // this.wednesdayOpenTime
    // this.thursdayOpenTime
    // this.fridayOpenTime
    // this.saturdayCloseTime
    // this.sundayCloseTime

  }

  /*
    Will Load the DeptInfo Entry with the passed ID
      Allow user to update
        Dept Name
        Buisness Hours
        On 
  */
  onShowModifyPanel(modifyDeptId: string) {
    this.isLoading = true;
    this.showModifyPanel = false;
    // Clear all data

    // Check if this is a new department or modifying
    this.editDeptMode = true;

    this.showModifyPanel = true;
    console.log('Loading Dept ' + modifyDeptId + ' to modifyPanel...');
    // Set the ID of the DeptInfo entry to load for editing

    // Get the index in the DeptInfo Array
    let editDeptIndex = this.deptInfo.findIndex(n => n.id === modifyDeptId);

    // Load that index as the modifyDeptInfo
    this.modifyPanelDeptInfo = this.deptInfo[editDeptIndex];
    this.modifyPanelDeptIndex = editDeptIndex;
    this.modifyPanelDeptId = this.deptInfo[editDeptIndex].id;

    // Make a copy of the current values to the variables in the form


    console.log(this.modifyPanelDeptInfo);




    this.deptFormName = this.modifyPanelDeptInfo.deptName;
    // Since this is modifying, copy the current vars to the form bound vars
    // then the time changes can be validated to make sense as well
    this.mondayOpenStatus = this.modifyPanelDeptInfo.buisnessHours[0].isOpen;
    this.mondayOpenTime = new Date(this.modifyPanelDeptInfo.buisnessHours[0].openTime);
    this.mondayCloseTime = new Date(this.modifyPanelDeptInfo.buisnessHours[0].closeTime);

    this.tuesdayOpenStatus = this.modifyPanelDeptInfo.buisnessHours[1].isOpen;
    this.tuesdayOpenTime = new Date(this.modifyPanelDeptInfo.buisnessHours[1].openTime);
    this.tuesdayCloseTime = new Date(this.modifyPanelDeptInfo.buisnessHours[1].closeTime);

    this.wednesdayOpenStatus = this.modifyPanelDeptInfo.buisnessHours[2].isOpen;
    this.wednesdayOpenTime = new Date(this.modifyPanelDeptInfo.buisnessHours[2].openTime);
    this.wednesdayCloseTime = new Date(this.modifyPanelDeptInfo.buisnessHours[2].closeTime);

    this.thursdayOpenStatus = this.modifyPanelDeptInfo.buisnessHours[3].isOpen;
    this.thursdayOpenTime = new Date(this.modifyPanelDeptInfo.buisnessHours[3].openTime);
    this.thursdayCloseTime = new Date(this.modifyPanelDeptInfo.buisnessHours[3].closeTime);

    this.fridayOpenStatus = this.modifyPanelDeptInfo.buisnessHours[4].isOpen;
    this.fridayOpenTime = new Date(this.modifyPanelDeptInfo.buisnessHours[4].openTime);
    this.fridayCloseTime = new Date(this.modifyPanelDeptInfo.buisnessHours[4].closeTime);

    this.saturdayOpenStatus = this.modifyPanelDeptInfo.buisnessHours[5].isOpen;
    this.saturdayOpenTime = new Date(this.modifyPanelDeptInfo.buisnessHours[0].openTime);
    this.saturdayCloseTime = new Date(this.modifyPanelDeptInfo.buisnessHours[0].closeTime);

    this.sundayOpenStatus = this.modifyPanelDeptInfo.buisnessHours[6].isOpen;
    this.sundayOpenTime = new Date(this.modifyPanelDeptInfo.buisnessHours[0].openTime);
    this.sundayCloseTime = new Date(this.modifyPanelDeptInfo.buisnessHours[0].closeTime);

    this.isLoading = false;


  }

  /*
    Render the ModifyPanel for a new Dept creation
  */
  onShowModifyPanelNew() {
    // Set Render Variable to true
    this.showModifyPanel = true;
    // Set variable for creating new Dept
    this.editDeptMode = false;

    // Since this is a new entry, values do not need to be loaded into the binded variables on the form
    const defaultOpenTime = new Date();
    defaultOpenTime.setHours(9);
    const defaultCloseTime = new Date();
    defaultCloseTime.setHours(22);

    console.log('Default open time: ' + defaultOpenTime);
    console.log('Default close time: ' + defaultCloseTime);

    // Set all of the opening times
    this.mondayOpenTime = defaultOpenTime;
    this.tuesdayOpenTime = defaultOpenTime;
    this.wednesdayOpenTime = defaultOpenTime;
    this.thursdayOpenTime = defaultOpenTime;
    this.fridayOpenTime = defaultOpenTime;
    this.saturdayOpenTime = defaultOpenTime;
    this.sundayOpenTime = defaultOpenTime;
    // Set all of the closing times
    this.mondayCloseTime = defaultCloseTime;
    this.tuesdayCloseTime = defaultCloseTime;
    this.wednesdayCloseTime = defaultCloseTime;
    this.thursdayCloseTime = defaultCloseTime;
    this.fridayCloseTime = defaultCloseTime;
    this.saturdayCloseTime = defaultCloseTime;
    this.sundayCloseTime = defaultCloseTime;
    // Set all of the isOpen status to false
    this.mondayOpenStatus = false;
    this.tuesdayOpenStatus = false;
    this.wednesdayOpenStatus = false;
    this.thursdayOpenStatus = false;
    this.fridayOpenStatus = false;
    this.saturdayOpenStatus = false;
    this.sundayOpenStatus = false;
    // Set the name to nothing
    this.deptFormName = '';


  }





  /*
    ______ ___________  ___  ______ ________  ___ _____ _   _ _____ 
    |  _  \  ___| ___ \/ _ \ | ___ \_   _|  \/  ||  ___| \ | |_   _|
    | | | | |__ | |_/ / /_\ \| |_/ / | | | .  . || |__ |  \| | | |
    | | | |  __||  __/|  _  ||    /  | | | |\/| ||  __|| . ` | | |
    | |/ /| |___| |   | | | || |\ \  | | | |  | || |___| |\  | | |
    |___/ \____/\_|   \_| |_/\_| \_| \_/ \_|  |_/\____/\_| \_/ \_/
  */


  /*
    If the Department already exists and is being modifyied
  */
  onUpdateModifyPanel(form: NgForm) {
    if (form.invalid) {
      console.log("Form is invalid...");
      return;
    }
    console.log("UPDATING BASED ON FORM VALUES?");
    const value = form.value;
    // Create the new DeptInfo object
    // this.deptService.updateDepartment(this.modifyPanelDeptIndex)
    console.log(form.value);
  }




  /*
_____  _   _ _________________ ___________ _____ _____ 
|  _  || | | |  ___| ___ \ ___ \_   _|  _  \  ___/  ___|
| | | || | | | |__ | |_/ / |_/ / | | | | | | |__ \ `--. 
| | | || | | |  __||    /|    /  | | | | | |  __| `--. \
\ \_/ /\ \_/ / |___| |\ \| |\ \ _| |_| |/ /| |___/\__/ /
\___/  \___/\____/\_| \_\_| \_|\___/|___/ \____/\____/
*/
  onSaveOverrideRule(form: NgForm) {
    console.log('Saving New Buisness Hours Override with form:');
    console.log(form.value);

    // Create the new buisnessHoursOverrides rule
    const newOverrideRule = {
      deptInfoIdToUpdate: this.modifyPanelDeptId,
      overrideReason: this.buisnessHoursOverrideReason,
      overrideStartDate: this.overrideStartDate,
      overrideEndDate: this.overrideEndDate,
      dayOfWeek: this.dayOfWeek,
      altOpenTime: this.altOpenTime,
      altCloseTime: this.altCloseTime,
      isOpen: this.isOpen
    };

    // Check if this is modifying a rule, or creating a new rule
    if(this.editOverrideMode) {
      this.deptService.updateOverrideRule(this.modifyPanelDeptId, newOverrideRule);
    } else {
      this.deptService.createNewHourOverrideRule(this.modifyPanelDeptId, newOverrideRule);
    }

  }



  onLoadOverrideForEdit(overrideRule: BuisnessHoursOverride) {
    console.log('Loading Override rule for edit...');
    console.log(overrideRule);

    this.onShowEditOverrideCard(); // set the edit view to true, editOverrideMode true
    // Current department being modified is modifyPanelDeptInfoId
    // const overrideIndex = this.modifyPanelDeptInfo.buisnessHoursOverrides.findIndex(n => n.id === overrideRuleId);
    // const buisnessOverrideToEdit = this.modifyPanelDeptInfo.buisnessHoursOverrides[overrideIndex];
    // this.currentOverrideEdit = buisnessOverrideToEdit; // saving the component var

    // Variables for the buisness hours override form
    this.buisnessHoursOverrideReason = overrideRule.overrideReason;
    this.overrideStartDate = new Date(overrideRule.overrideStartDate);
    this.overrideEndDate = new Date(overrideRule.overrideEndDate);
    this.dayOfWeek = overrideRule.dayOfWeek;
    this.altOpenTime = new Date(overrideRule.altOpenTime);
    this.altCloseTime = new Date(overrideRule.altCloseTime);
    this.isOpen = overrideRule.isOpen;


  }

  onRemoveOverrideRule(overrideRuleId: string){
    console.log('onRemoveOverrideRule()');
    console.log(overrideRuleId);

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: 'Are you sure you want to delete this BuisnessHoursOverride rule?'
      });

        dialogRef.afterClosed().subscribe(result => {
        if (result) {
            console.log('Yes clicked');
            console.log(result);
            
            this.deptService.deleteOverrideRule(this.modifyPanelDeptId, overrideRuleId);

        }
      });
    

  }

  // Load the BuisnessHoursOverride Form as a new entry
  onShowCreateNewOverrideCard() {
    console.log('Rendering showEditOverrideCard in create mode');
    this.showEditOverrides = true; // Show the mat-card holding the form
    this.editOverrideMode = false;
    // Set initial values in form
    this.buisnessHoursOverrideReason = '';
    this.dayOfWeek = 7;
    this.overrideStartDate = new Date();
    this.overrideEndDate = new Date();
    this.altOpenTime = new Date();
    this.altCloseTime = new Date();

  }

  // Load the BuisnessHoursOverride Form as a new entry
  onShowEditOverrideCard() {
    console.log('Rendering showEditOverrideCard in edit mode');
    this.showEditOverrides = true; // Show the mat-card holding the form
    this.editOverrideMode = true; // set it to render the verbage for editing
    // Set initial values in form
  }

  onCloseEditOverrideCard() {
    console.log('nevermind button clicked, hiding the edit override card');
    this.showEditOverrides = false;
  }







  /*
    If the Department does not exist and is being created

    * All Validation happens in the service
  */
  onSaveModifyPanel(form: NgForm) {
    if (form.invalid) {
      console.log('Form for saving new department is invalid...');
      return;
    }

    console.log('SAVING NEW DEPARTMENT WITH FORM:');
    console.log(form.value);

    const value = form.value;

    const newDeptInfoForm = {
      id: this.modifyPanelDeptId,
      deptName: value.deptFormName,
      buisnessHours: [
        {
          id: '',
          dayOfWeek: 0,
          isOpen: this.mondayOpenStatus,
          openTime: this.mondayOpenTime,
          closeTime: this.mondayCloseTime
        },
        {
          id: '',
          dayOfWeek: 1,
          isOpen: this.tuesdayOpenStatus,
          openTime: this.tuesdayOpenTime,
          closeTime: this.tuesdayCloseTime
        },
        {
          id: '',
          dayOfWeek: 2,
          isOpen: this.wednesdayOpenStatus,
          openTime: this.wednesdayOpenTime,
          closeTime: this.wednesdayCloseTime
        },
        {
          id: '',
          dayOfWeek: 3,
          isOpen: this.thursdayOpenStatus,
          openTime: this.thursdayOpenTime,
          closeTime: this.thursdayCloseTime
        },
        {
          id: '',
          dayOfWeek: 4,
          isOpen: this.fridayOpenStatus,
          openTime: this.fridayOpenTime,
          closeTime: this.fridayCloseTime
        },
        {
          id: '',
          dayOfWeek: 5,
          isOpen: this.saturdayOpenStatus,
          openTime: this.saturdayOpenTime,
          closeTime: this.saturdayCloseTime
        },
        {
          id: '',
          dayOfWeek: 6,
          isOpen: this.sundayOpenStatus,
          openTime: this.sundayOpenTime,
          closeTime: this.sundayCloseTime
        }
      ],
      buisnessHoursOverrides: undefined // No Overrides, must create the department first and then add
    };


    // ?Check and enfore a 'sane' operating hours time, ie opening comes before the closing time
    // Use the index in the DeptInfo array
    // this.modifyPanelDeptInfo

    // editMode true for modify, false for new entry
    if (this.editDeptMode) {
      console.log('Manage Department Mode is Edit --> calling updateDepartment()');
      // Loaded object to modify, pass the index and the new info to the service
      this.deptService.updateDepartment(newDeptInfoForm);

    } else {
      // This form submit is to create a new entry in the DeptInfo Database
      console.log('Manage Department Mode is Create New --> Calling createNewDepartment()');
      this.deptService.createNewDepartment(newDeptInfoForm);
    }


  }

  /*
    Called when 'Discard Changes' button is clicked when modifyPanel is rendered
  */
  onDiscardModifyPanel() {
    // Derender the modifyPanel and disregard changes
    this.showModifyPanel = false;
  }


  onDeleteDepartment() {
    console.log('! Delete Department id: ');
    console.log(this.modifyPanelDeptId);

    // Prompt with confirm dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: 'Are you sure you want to delete the ' + this.modifyPanelDeptInfo.deptName + ' department?'
      });
      dialogRef.afterClosed().subscribe(result => {
      if (result) {
          console.log('Yes clicked');
          console.log(result);
          
          // send current modify panel dept id as id in delete request
          this.deptService.deleteDepartment(this.modifyPanelDeptId);
          // Start the password reset workflow
          // this.userService.startPasswordResetWorkflow(result.data); // result is the email input from popup form
      }
      });

    // on yes, make delete service request
    // if no, do nothing
  }

}
