**Sons Roofing Solutions Mobile App**  
***product requirement document***

**Executive Summary:**

The Sons Home Helper mobile app is a customer-facing marketplace that transforms how homeowners and commercial clients access Sons Roofing's services across the Dallas-Fort Worth area. Customers will be able to browse service categories (roofing, siding, gutters, windows, solar, emergency services), submit detailed service requests with photos and property information, schedule appointments, and track project status—all from their smartphone without phone calls or sales rep visits. 

This platform eliminates friction in the customer journey by providing 24/7 access to request services, real-time project updates, and transparent communication throughout the service lifecycle. The app seamlessly integrates with Sons Roofing's existing CRM system, ensuring that customer requests and project data flow directly into their daily operations without manual data entry or duplicate work.

By modernizing the customer experience while honoring Sons Roofing's 40-year legacy of treating customers like family, the app positions the company as an innovative leader in the DFW roofing market and creates new revenue opportunities through streamlined lead generation and improved conversion rates.

---

**Personas:**

1. Sons Roofing Acculynx User (external)  
2. Residential User (Internal)  
3. Commercial (Internal)  
* Owner or tenant of commercial building  
* Property Manager




**Features List:**

| Feature | Importance |  |  |
| :---- | :---- | ----- | ----- |
| On-Demand Service Order | **Must have** |  |  |
| Job Type Selection | **Must have**  |  |  |
| Image Upload & Notes | **Must have**  |  |  |
| Unique Job Request Creation | **Must have**  |  |  |
| User Account Management | **Must have**  |  |  |
| Acculynx Integration (API) | **Must have**  |  |  |
| Acculynx Integration (Webhook) | **Must have**  |  |  |
| Mobile Push Notifications | **Must have**  |  |  |
| Sons Master Admin | **Nice to have**  |  |  |
| Reward system  | **Optional** |  |  |
| AI Text/Caller \*\* | **Optional** |  |  |
| Sync Acculynx Photo Upload | **Nice to have**  |  |  |

**User Stories (Must Have Features):**

1. ## **On-Demand Service Order**

**1.1. As a** Residential Property Owner, **I want to** submit a service request 24/7 from my phone, **so that** I can get help immediately after discovering damage without waiting for business hours.

**1.2. As a** Commercial Property Manager, **I want to** request services at any time, **so that** I can address building issues promptly without disrupting my work schedule.

**1.3. As a** Residential Property Owner, **I want to** see confirmation that my request was received, **so that** I have peace of mind that Sons Roofing knows I need help.

**1.4. As a** Commercial Property Manager, **I want to** submit multiple service requests for different properties, **so that** I can efficiently manage maintenance across my portfolio.

---

1. **\#\# \*\*Job (Trade) Type Selection\*\***

2.1 **As a** Residential Property Owner, **I want to** choose from a list of common services (roof patch, leak inspection, gutter replacement), **so that** I can quickly describe what I need without writing a long explanation.

2.2 **As a** Commercial Property Manager, **I want to** select whether my property is residential or commercial, **so that** Sons Roofing can assign the right team and pricing for my project.

2.3 **As a** Residential Property Owner, **I want to** see clear descriptions of each service type, **so that** I can select the option that best matches my problem.

2.4 **As a** Commercial Property Manager, **I want to** select commercial-specific services, **so that** I receive appropriate service for larger-scale building maintenance needs.

---

## 

## **3\. Image Upload**

**3.1. As a** Residential Property Owner, **I want to** upload a photo of the damage, **so that** Sons Roofing can see the problem before visiting and come prepared.

---

## **4\.  Notes**

**4.1. As a** Residential Property Owner, **I want to** add notes with roof specifications (type, material, story height), **so that** the estimator has all necessary information upfront.

**4.2. As a** Commercial Property Manager, **I want to** provide detailed notes about the issue and building access requirements, **so that** the service team is fully prepared for the visit.

**4.3. As a** Residential Property Owner, **I want to** see helpful prompts for what information to include, **so that** I don't forget important details that might delay my service.

---

## **5\. Unique Job Request Creation**

**5.1. As a** Residential Property Owner, **I want to** receive a unique job reference number after submitting my request, **so that** I can easily track and reference my service request.

**5.2. As a** Commercial Property Manager, **I want to** see a unique job ID for each request( ex: \#SR-12345), **so that** I can track multiple projects and communicate clearly with Sons Roofing staff.

**5.3. As a** Residential Property Owner, **I want to** see an estimated response time after booking, **so that** I know when to expect contact from Sons Roofing.

**5.4 As a** Sons Roofing Admin, **I want to** ensure every customer request generates a unique identifier, **so that** we can track all jobs accurately without confusion.

---

## **6\. User Account Management**

**6.1. As a** Residential Property Owner, **I want to** create an account with my contact information, **so that** I don't have to re-enter my details for future service requests.

**6.2. As a** Commercial Property Manager, **I want to** save multiple property addresses to my account, **so that** I can quickly request services for any of my buildings.

**6.3. As a** Residential Property Owner, **I want to** view my service request history, **so that** I can see past work and warranty information.

**6.4. As a** Residential Property Owner, **I want to** reset my password if I forget it, **so that** I can regain access to my account and order history.

**6.5. As a** Commercial Property Manager, **I want to** update my profile information (phone, email, addresses), **so that** Sons Roofing always has my current contact details.

**6.6. As a** Residential Property Owner, **I want to** sign up quickly with minimal required fields, **so that** I can book urgent services without lengthy registration.

---

## **7\. AccuLynx Integration (API)**

**7.1. As a** Sons Roofing Acculynx Admin, **I want to** automatically create jobs in AccuLynx when customers submit app requests, **so that** our team can process them immediately without manual data entry.

**7.2. As a** Sons Roofing Acculynx Admin, **I want to** create a contact for customers that are not currently in our system **so that we** can create jobs for a specific contact.

**7.3. As a** Sons Roofing Acculynx Admin, **I want to** receive photos that customers uploaded from the app side **so that** I can update the job with photos  .

---

## **8\. AccuLynx Integration (Webhooks/Zapier)**

**8.1. As a** Residential Property Owner, **I want to** see automatic status updates in the app when my job progresses in AccuLynx, **so that** I stay informed without having to call or email for updates.

**8.2. As a** Commercial Property Manager, **I want to** receive real-time status changes for all my projects, **so that** I can coordinate building access and plan accordingly.

**8.3. As a** Residential Property Owner, **I want to** know immediately when my job is approved and scheduled, **so that** I can be home or make arrangements for the service visit.

**8.4. As a** Sons Roofing Admin, **I want to** have job status automatically sync from AccuLynx to the app via webhooks, **so that** customers always see current information without staff manually updating both systems.

**8.5. As a** Residential Property Owner, **I want to** be notified when my invoice is ready, **so that** I can review and pay it promptly.

**8.6. As a** Commercial Property Manager, **I want to** see when payment has been processed, **so that** I can close out my records and confirm the project is complete.

---

## 

## 

## **9\. Mobile Push Notifications**

**9.1. As a** Residential Property Owner, **I want to** receive a push notification when Sons Roofing receives my request, **so that** I have immediate confirmation that my submission was successful.

**9.2. As a** Residential Property Owner, **I want to** get notified when my job is scheduled, **so that** I can prepare for the service appointment.

**9.3. As a** Commercial Property Manager, **I want to** receive alerts when any of my jobs change status, **so that** I can stay on top of multiple projects without constantly checking the app.

**9.4. As a** Residential Property Owner, **I want to** be notified when my job is completed, **so that** I know the work is done and can inspect it.

**9.5. As a** Residential Property Owner, **I want to** receive a notification when my invoice is sent, **so that** I can pay promptly and close out the project.

**9.6. As a** Residential Property Owner, **I want to** control which notifications I receive, **so that** I'm not overwhelmed with alerts but still get important updates.

---

**Core User Flows:**

**Core User Flow \#1: Existing User**

1. **Application Access \- View and Navigation**  
   A. Upon accessing the application's home page, the user is presented with navigation tabs (Bypassing traditional authentication \- sign in)

2. **Service Selection**  
   A. The user selects the desired service, which corresponds to the work type in acculynx.  
   B. The user specifies the property type.  
   	i. Residential  
   	ii. Commercial  
   C. The user completes the required contact and location information fields \- autopopulating fields because the user is existing.   
   	i. First Name  
   	ii. Last Name  
   	iii. Email Address  
   	iv. Phone Number  
   	v. Address  
   1. Select existing address  
      2. Add new address   
3. **Photo Upload** (Limited to a single image)  
4. **Service Notes**  
   A. This is a free-form, mandatory text field. The required format includes a parenthetical note specifying details such as “(roof type, material, how many stories).”  
5. **Service Scheduling**  
   A. The user selects a preferred time window & date.  
   	i. Morning  
   	ii. Afternoon  
   	iii. Evening   
6. **Review and Submission**  
7. **Confirmation**  
   A. The service request is successfully booked and is displayed within the “My Orders” tab.  
8. Receive unique job identification number 

**\[Acculynx Integration and Status Flow\]**

1. **Job Receipt**  
   A. The job information is received within the Acculynx system as an unassigned lead  
2. **Acculynx Workflow Stages**  
   A. The job progresses through five major stages within the Acculynx environment.  
   i. Lead  
   ii. Prospect  
   iii. Approved; Ready for Scheduling  
   1\. The order status must be updated within the mobile application.  
   iv. Completed; Job Finished  
   1\. The order status must be updated within the mobile application.  
   v. Invoiced  
   1\. A notification must be sent to the user confirming the invoice has been issued.  
   vi. Closed  
   1\. QuickBooks updates the status in Acculynx.  
   2\. Acculynx then transmits an update to the mobile application, confirming the order is Finished (Payment Finalized).  
   3\. The order status must be updated within the mobile application.  
   1. Moved to past orders

---

**Core flow \#2: Track Order Status :**

**Access App \- Navigate to Orders**

1. User opens app (already logged in from previous session)  
   2. Taps "Orders" tab in bottom navigation  
2. **View Active Orders**  
   1. Screen displays list of active service requests  
   2. Each order shows:  
      1. Service type  
      2. Property address  
      3. Current status   
         1. Received   
         2. Scheduled  
         3. Job In Progress  
         4. Job Complete   
         5.  Finished (Payment Finalized)  
      4. Job reference number  
      5. Submission date  
3. **Select Order for Details**  
   1. User taps on specific order  
   2. Order detail screen displays:  
      1. Full service information  
      2. Uploaded photo  
      3. Notes/special instructions  
      4. Selected time window  
      5. Current status with timeline  
4. **Receive Real-Time Push Notification**  
   1. AccuLynx status changes from "Prospect" to "Approved"  
   2. User receives push notification:  
      1. "Your roof repair job has been approved and scheduled\!"  
   3. Notification includes:  
      1. Job reference number  
      2. Tap to view details  
5. **Check Updated Status**  
   1. User taps notification OR refreshes order screen  
   2. Status automatically updates to "Scheduled"  
   3. New information displayed:  
      1. Scheduled appointment date/time  
      2. Estimated crew arrival  
      3. Project manager contact info  
6. **Completion Notification Received**  
   1. When job marked "Completed" in AccuLynx  
   2. User receives push notification:  
      1. "Your roof repair is complete\!"  
   3. Order status updates in app  
   4. Displays completion date  
7. **Invoice Notification**  
   1. AccuLynx marks job as "Invoiced"  
   2. User receives notification:  
      1. "Your invoice is ready"  
   3. Order screen shows:  
      1. Invoice amount (if available)  
      2. Payment instructions  
      3. "Invoice Sent" status  
8. **Payment Confirmation**  
   1. After payment processed in QuickBooks → AccuLynx  
   2. Final notification received:  
      1. "Payment received. Thank you\!"  
   3. Order marked as "Finished (Payment Finalized)"  
   4. Marked as Finished in the orders tab

---

## **Core Flow 3: First-Time User Account Creation & Service Request**

### **User Journey: New Customer Discovers Sons Roofing After Storm Damage**

1. **Download & Launch App**  
   * User downloads "Sons Property Solutions" from App Store/Google Play  
   * Opens app for first time  
   * Welcome screen displayed with:  
     * Sons Roofing logo  
     * Brief description: "Request roofing services 24/7"  
     * First Name  
     * Last Name  
     * Email  
     * Phone Number  
     * Password  
     * Confirm Password  
     * "Get Started" button — (submit button)  
2. **Choose Entry Point**  
   * User sees two options:  
     * **"Create Account"** (save info for future)  
       1. This can be pre populated when they are booking a service  
3. **Guest Service Request Flow Begins**  
   * User taken directly to service selection screen  
   * Banner at top: "Create account after booking to track your order"  
4. **Select Service Type**  
   * User taps "Emergency Services"  
   * Then selects specific issue: "Roof Leak"  
5. **Choose Property Type**  
   * User selects: "Residential"  
6. **Enter Contact Information**  
   * Form displays:  
     * First name: \[Required\]  
     * Last name: \[Required\]  
     * Email: \[Required\]  
     * Phone number: \[Required\]  
     * Property address: \[Required \- with autocomplete\]  
   * User fills out all fields  
   * Address autocomplete suggests matches as user types  
7. **Upload Photo & Add Notes**  
   * User taps "Add Photo"  
   * Takes photo of leak using phone camera OR selects from gallery  
   * Photo preview shown  
   * User enters notes: "Leak in master bedroom ceiling, shingle roof, 2-story home"  
   * Helper text visible: "(Include: roof type, material, story height)"  
8. **Select Time Window**  
   * User chooses: "Morning" (wants fastest response)  
   * Option to add specific instructions (optional)  
9. **Review Submission**  
   * Summary screen shows:  
     * Service (work type): Roof Leak  
     * Property type: Residential  
     * Contact: \[Name, email, phone\]  
     * Address: \[Full address\]  
     * Photo: \[Thumbnail preview\]  
     * Notes: \[Roof specifications\]  
     * Time preference: Morning  
   * "Submit Request" button at bottom  
10. **Submit Request**  
    * User taps "Submit Request"  
    * Loading indicator: "Submitting your request..."  
    * Backend processes:  
      * Saves request to Database  
      * Uploads photo to Storage  
      * Calls AccuLynx API to create job  
      * Generates unique job reference number  
11. **Confirmation Screen**  
    * Success message: "Your emergency request has been received\!"  
    * Displays:  
      * Job reference number: \#SR-{123…}  
      * Confirmation: "A Sons Roofing representative will contact you within 2 hours"  
      * Contact info if urgent: \[Phone number\]  
    * Confirmation email sent to user's email  
12. **Prompt to Create Account**  
    * Screen shows: "Create an account to track your order"  
    * Benefits listed:  
      * Track order status in real-time  
      * Receive notifications  
      * Save address for future requests  
      * View service history  
    * Two buttons:  
      * "Create Account" (pre-fills with entered info)  
      * "Skip for Now"  
13. **User Creates Account**  
    * User taps "Create Account"  
    * Form pre-filled with contact info already entered  
    * Only needs to add:  
      * Password: \[Required, min 8 characters\]  
      * Confirm password  
    * User agrees to Terms & Conditions (checkbox)  
    * Taps "Create Account"  
14. **Account Created & Email Verification**  
    * Account created successfully  
    * Verification email sent  
    * User can immediately use app (verification optional for basic features)  
    * User auto-logged in  
    * Redirected to "My Orders" tab  
15. **View New Order in Dashboard**  
    * Order \#SR-12345 visible in "My Orders"  
    * Status shows: "Submitted \- In Review"  
    * User can now receive push notifications for this order  
    * Address saved to profile for future use

## 