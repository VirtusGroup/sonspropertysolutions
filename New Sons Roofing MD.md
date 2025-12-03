\*\*Sons Roofing Solutions Mobile App\*\*    
\*\*\*product requirement document\*\*\*

\*\*Executive Summary:\*\*

The Sons Home Helper mobile app is a customer-facing marketplace that allows homeowners and property owners to request roofing and exterior services from Sons Roofing directly from their smartphone without phone calls or sales rep visits. 

This platform eliminates friction in the customer journey by providing a streamlined, self-serve experience for requesting repairs, maintenance, and upgrades, while integrating with Sons Roofing’s existing systems (Acculynx and QuickBooks) to ensure that internal operations remain organized and efficient. The main goal is to create a “modern utility app” that customers keep on their phone for all things roofing and exteriors.

By modernizing the customer experience while honoring Sons Roofing’s operational processes, the app is designed to drive long-term customer loyalty and repeat business, and to support Sons Roofing’s growth through streamlined lead generation and improved conversion rates.

\---

\*\*Personas:\*\*

1\. Sons Roofing Acculynx User (external)    
   \* Role: Sons Roofing team member using Acculynx \+ QuickBooks    
   \* Goals:    
     \* Keep all jobs organized in Acculynx    
     \* Avoid double entry of customer information    
     \* Maintain accurate job status, invoices, and payments    
   \* Pains:    
     \* Manual entry of leads and jobs from phone calls and forms    
     \* Disconnected systems for quotes, jobs, and customer communications    
     \* Difficulty tracking jobs across multiple projects and property addresses  

2\. Homeowner (Customer) – “Sons Home Helper App User”    
   \* Role: Single-family homeowner using the app to request services    
   \* Goals:    
     \* Quickly request roof inspections, repairs, and maintenance    
     \* See price estimates where possible (e.g. gutter cleaning, basic repairs)    
     \* Track job status without needing to call    
   \* Pains:    
     \* Uncertainty on pricing before talking to sales    
     \* Needing to remember previous conversations or job history    
     \* Difficulty knowing when techs are on the way or job is complete  

3\. Commercial Property Manager (Customer)    
   \* Role: Manages multiple properties or multi-family complexes    
   \* Goals:    
     \* Easily submit service requests for multiple properties    
     \* Track multiple jobs across properties    
     \* Maintain a record of all work performed    
   \* Pains:    
     \* Having to juggle email, phone, and spreadsheets    
     \* Needing clear visibility into jobs across multiple properties    
     \* Unclear status on what’s been completed or scheduled  

\---

\*\*Product Objectives:\*\*

1\. Make it frictionless for customers (homeowners and property managers) to request roofing and exterior services from Sons Roofing via mobile app.    
2\. Maintain Acculynx as the source of truth for jobs and customer records.    
3\. Use the app as a long-term customer relationship tool, not only for first-time jobs.    
4\. Provide clear, simple job statuses (Received, Scheduled, Job In Progress, Job Complete, Finished) that map back to Acculynx seamlessly.    
5\. Support future expansion into a broader marketplace of Sons services (gutters, siding, windows, etc.).  

\---

\*\*High-Level Feature List:\*\*

1\. Customer Account & Profile    
   \* Account creation and login    
   \* Profile management (name, email, phone, password)    
   \* Multiple property addresses saved to a single account  

2\. Service Request Flow    
   \* Select service type from categorized list    
   \* Upload photo(s) of the problem    
   \* Enter property address (autocomplete where possible)    
   \* Describe the issue in detail (structured \+ free text)    
   \* Price estimator for specific services where applicable    
   \* Submit request and receive confirmation with job reference number  

3\. Order Management & Status Tracking    
   \* “My Orders” view with list of active and past requests    
   \* Detail view for each service request (order)    
   \* Simple, customer-friendly statuses:    
     \* Received    
     \* Scheduled    
     \* Job In Progress    
     \* Job Complete    
     \* Finished (Payment Finalized)    
   \* Timeline / history of major events (submitted, scheduled, completed, invoiced, paid)  

4\. Notifications & Communication    
   \* Push notifications for:    
     \* Order received    
     \* Order scheduled    
     \* Tech on the way (future enhancement)    
     \* Job complete    
     \* Invoice ready    
     \* Payment processed / job finished    
   \* In-app notifications center with message list  

5\. Acculynx Integration (Backend Logic)    
   \* All service requests create or associate with a lead / job in Acculynx    
   \* Sync customer \+ property details    
   \* Status updates from Acculynx sync back to customer app    
   \* Sync invoice and payment status (via QuickBooks \+ Acculynx mapping)  

6\. Admin / Sons Internal Tools (Outside of this app’s UI in V1)    
   \* Sons team continues using Acculynx for:    
     \* Job scheduling    
     \* Crew assignment    
     \* Job notes & photos    
     \* Invoicing & payments (via QuickBooks)    
   \* Only lightweight configuration surfaces may exist in this v1 (e.g., informal toggles)  

\---

\*\*Non-Goals (for V1):\*\*

1\. Full internal CRM replacement for Sons Roofing – we will not replicate Acculynx.    
2\. Complex promotion engine or coupon system.    
3\. In-app payments (V1 may only support payment tracking; future versions may support digital payments).    
4\. Deep reporting dashboards for Sons internal team (beyond basic job sync).  

\---

\*\*System Architecture Overview (Conceptual):\*\*

1\. \*\*Mobile App (Customer-Facing)\*\*    
   \* Platform: Cross-platform (iOS & Android) via shared codebase    
   \* Responsibilities:    
     \* UI for service requests    
     \* User accounts and authentication    
     \* Viewing job status and history    
     \* Sending and receiving notifications  

2\. \*\*Backend API \+ Integration Layer\*\*    
   \* Responsibilities:    
     \* Receive service requests from app    
     \* Create leads / jobs in Acculynx    
     \* Map customer accounts to Acculynx contacts / jobs    
     \* Poll or subscribe to Acculynx changes for job status updates    
     \* Sync invoice and payment status from Acculynx / QuickBooks    
     \* Handle authentication and access control for mobile app  

3\. \*\*Acculynx \+ QuickBooks (Existing Systems)\*\*    
   \* Acculynx: Jobs, leads, scheduling, and job status    
   \* QuickBooks: Invoicing and payment status    
   \* Integration ensures there is a single source of truth for operational data  

\---

\*\*Key Integrations:\*\*

1\. \*\*Acculynx\*\*    
   \* Use case: Create jobs/leads from app submissions, track status.    
   \* Data flows:    
     \* From App → Acculynx:    
       \* New Service Request → New Lead / Job    
       \* Customer info and property address    
       \* Description of issue and attached photo(s)    
     \* From Acculynx → App:    
       \* Lead/Job status changes → App order status updates    
       \* Job completion → “Job Complete” event    
       \* Invoice linkage (via QuickBooks, if available in Acculynx data)  

2\. \*\*QuickBooks\*\*    
   \* Use case: Invoice and payment tracking.    
   \* Data flows:    
     \* From QuickBooks → App (via Acculynx mapping or direct integration):    
       \* Invoice created → “Invoice Ready” status    
       \* Payment applied → “Finished (Payment Finalized)” status  

\*Note: Exact integration details will be scoped in technical design; this PRD defines required user experience and data mapping at a conceptual level.\*

\---

\#\# Detailed Feature Requirements

\#\#\# 1\. User Account & Profile

\*\*Goal:\*\* Allow customers to create an account, manage their information, and store multiple property addresses.

\*\*Features:\*\*

1\. \*\*Account Creation:\*\*  
   \* Fields required:    
     \* First Name    
     \* Last Name    
     \* Email    
     \* Phone Number    
     \* Password    
     \* Confirm Password    
   \* Email format validation    
   \* Password rules:    
     \* Minimum 8 characters    
   \* Terms & Conditions checkbox (must be checked to create account)    
   \* Email verification flow (optional for basic use, recommended for future security)  

2\. \*\*Login:\*\*  
   \* Fields:    
     \* Email    
     \* Password    
   \* “Forgot password?” link:    
     \* Sends reset email    
     \* Reset password screen within app  

3\. \*\*Profile Management:\*\*  
   \* Accessible from “Account” tab    
   \* Fields:    
     \* First Name    
     \* Last Name    
     \* Email    
     \* Phone Number    
   \* Option to update password    
   \* Save changes button with success/error state  

4\. \*\*Property Address Management:\*\*  
   \* User can have multiple saved addresses    
   \* Each address includes:    
     \* Property nickname (e.g. “Home”, “Rental \#1”)    
     \* Street Address    
     \* City    
     \* State    
     \* Zip Code    
     \* Property Type: Residential or Commercial    
   \* Add new address flow:    
     \* Form with field validation    
   \* Edit existing address    
   \* Remove address (if no active jobs associated, or with proper warning)  

\---

\#\#\# 2\. Service Request & Order Flow

\*\*Goal:\*\* Provide an intuitive, guided flow for customers to request services for a selected property.

\*\*Core Concepts:\*\*

\- \*\*Order:\*\* A service request submitted by a user for a specific property, mapped to a lead/job in Acculynx.    
\- \*\*Service:\*\* A category or type of work, such as:    
  \* Roof inspection    
  \* Roof leak repair    
  \* Gutter cleaning    
  \* Storm damage inspection    
  \* Siding repair    
  \* Window replacement (future)  

\*\*Standard Residential Roofing Repair Scenario (Primary Flow):\*\*

1\. \*\*Open App & Sign In\*\*    
   \* User launches app    
   \* Sees sign-in screen if not already authenticated    
   \* Sign-in succeeds and user goes to home/dashboard  

2\. \*\*Choose Entry Point\*\*    
   \* User taps \*\*"Create Account"\*\* (save info for future)    
       1\. This can be pre populated when they are booking a service  

3\. \*\*Select Service Type\*\*    
   \* User taps "Emergency Services"    
   \* Then selects specific issue: "Roof Leak"  

4\. \*\*Choose Property Type\*\*    
   \* User selects: "Residential"  

5\. \*\*Enter Contact Information\*\*    
   \* Form displays:    
     \* First name: \\\[Required\\\]    
     \* Last name: \\\[Required\\\]    
     \* Email: \\\[Required\\\]    
     \* Phone number: \\\[Required\\\]    
     \* Property address: \\\[Required \- with autocomplete\\\]    
   \* User fills out all fields    
   \* Address autocomplete suggests matches as user types  

7\. \*\*Upload Photo & Add Notes\*\*    
   \* User taps "Add Photo"    
   \* Takes photo of leak using phone camera OR selects from gallery    
   \* Photo preview shown in app    
   \* User adds optional notes:    
     \* “Leak in kitchen, started after recent storm, ceiling discoloration approx 2x2 ft”  

8\. \*\*Estimate Display (Where Applicable)\*\*    
   \* For services where Sons provides ballpark estimates, show:    
     \* Estimated range: “Estimated cost: $X – $Y”    
     \* Clear disclaimer: “Final pricing will be confirmed after on-site inspection.”    
   \* For custom/complex jobs, show:    
     \* “Custom quote required. A Sons Roofing representative will contact you.”  

9\. \*\*Review & Submit\*\*    
   \* Summary screen shows:    
     \* Selected service    
     \* Property address    
     \* Contact info    
     \* Attached photo (thumbnail)    
     \* Estimate (if applicable)    
   \* User can edit any field    
   \* User taps “Submit Request”  

10\. \*\*Backend Processing (Conceptual)\*\*    
    \* App sends structured Service Request to backend API:    
      \* Customer account ID    
      \* Property address ID or raw address    
      \* Service type    
      \* Property type (Residential/Commercial)    
      \* Description/notes    
      \* Photo(s) metadata and file(s)    
    \* Backend:    
      \* Creates or links customer in Acculynx    
      \* Creates new Lead/Job with status mapped to:    
        \* App: “Received”    
        \* Acculynx: “Lead” or equivalent    
      \* Generates unique job reference number  

11\. \*\*Confirmation Screen\*\*    
    \* Success message: "Your emergency request has been received\!"    
    \* Displays:    
      \* Job reference number: \#SR-{123…}    
      \* Confirmation: "A Sons Roofing representative will contact you within 2 hours"    
      \* Contact info if urgent: \\\[Phone number\\\]    
    \* Confirmation email sent to user's email  

12\. \*\*User Creates Account\*\*    
    \* User taps "Create Account"    
    \* Form pre-filled with contact info already entered    
    \* Only needs to add:    
      \* Password: \\\[Required, min 8 characters\\\]    
      \* Confirm password    
    \* User agrees to Terms & Conditions (checkbox)    
    \* Taps "Create Account"  

13\. \*\*Account Created & Email Verification\*\*    
    \* Account created successfully    
    \* Verification email sent    
    \* User can immediately use app (verification optional for basic features)    
    \* User auto-logged in    
    \* Redirected to "My Orders" tab  

14\. \*\*View New Order in Dashboard\*\*    
    \* Order \#SR-12345 visible in "My Orders"    
    \* Status shows: "Submitted \- In Review"    
    \* User can now receive push notifications for this order    
    \* Address saved to profile for future use  

\---

\#\#\# 3\. Orders & Status Tracking

\*\*Goal:\*\* Provide customers with clear visibility into all active and past service requests.

\*\*Orders List Screen:\*\*

\- \*\*Active Orders\*\*    
  \* Cards for each active order with:    
    \* Job Reference (e.g. “\#SR-12345”)    
    \* Service type (e.g. “Emergency Roof Leak Repair”)    
    \* Property nickname/address    
    \* Status badge (Received, Scheduled, Job In Progress, Job Complete, Finished)    
    \* Last updated date/time  

\- \*\*Past Orders\*\*    
  \* Separate section or tab for completed/finished requests    
  \* Cards similar to Active Orders, but status shows “Finished” or “Cancelled”  

\*\*Order Detail Screen:\*\*

Each order detail displays:

1\. Header    
   \* Job reference number (\#SR-12345)    
   \* Service type    
   \* Status badge  

2\. Property Info    
   \* Property nickname (e.g. “Home”)    
   \* Full address    
   \* Property type (Residential / Commercial)  

3\. Service Details    
   \* Selected service type    
   \* Description of issue (from user notes)    
   \* Photo(s) with thumbnails and full-screen view  

4\. Status Timeline    
   \* Timeline component with steps:    
     \* Received    
     \* Scheduled    
     \* Job In Progress    
     \* Job Complete    
     \* Finished (Payment Finalized)    
   \* Each step shows:    
     \* Timestamp (if available)    
     \* Optional short description (e.g. “Tech assigned”, “Invoice sent”)  

5\. Scheduling Info (When Available)    
   \* Scheduled date and time window    
   \* Tech on the way indicator (if future enhancement supported)  

6\. Billing & Payment Status    
   \* Invoice status:    
     \* Not yet issued    
     \* Invoice ready    
     \* Paid    
   \* Amount due (if data available)    
   \* Notes on payment method (e.g. “You will receive an invoice via email to pay online or by check”)  

7\. Support & Contact    
   \* Clear CTA: “Call Sons Roofing”    
   \* Optional: “Email Sons Roofing”  

\---

\#\#\# 4\. Notifications & Communication

\*\*Goal:\*\* Keep customers informed at key points in the job lifecycle.

\*\*Notification Types:\*\*

1\. Service Request Submitted    
   \* Message: “We’ve received your request for \[Service\] at \[Property\]. Job \#SR-12345”  

2\. Job Scheduled    
   \* Message: “Your job \#SR-12345 is scheduled for \[Date\] in the \[Time Window\].”  

3\. Job In Progress    
   \* Message: “Your technician is on-site for job \#SR-12345.”  

4\. Job Complete    
   \* Message: “Your job \#SR-12345 is complete. We’ll send your invoice soon.”  

5\. Invoice Ready    
   \* Message: “Your invoice for job \#SR-12345 is ready. Please check your email.”  

6\. Payment Received / Finished    
   \* Message: “Payment received for job \#SR-12345. Thank you for choosing Sons Roofing.”  

\*\*Delivery Channels:\*\*

\- Push Notifications (Mobile OS-level)    
\- In-App Notifications Center (simple list of notifications with timestamps)  

\*\*Notification Preferences (Account Settings):\*\*

\- Toggles:    
  \* Receive push notifications: On/Off    
  \* Receive email notifications: On/Off (where applicable)  

\---

\#\#\# 5\. Service Catalog & Pricing

\*\*Goal:\*\* Provide a clear, structured list of services with simple, understandable pricing or quotes.

\*\*Service Catalog Structure:\*\*

\- Categories (Examples):    
  \* Emergency Services    
  \* Roof Inspections    
  \* Repair & Maintenance    
  \* Gutters & Drainage    
  \* Siding & Exterior    
  \* Windows & Doors (future expansion)  

Each service item includes:

\- Service name    
\- Short description    
\- Property type applicability (Residential / Commercial / Both)    
\- Price treatment:    
  \* Fixed-price or range estimate (if possible)    
  \* “Custom quote required” when pricing is complex  

\*\*Price Estimator (Where Applicable):\*\*

For services like gutter cleaning or small repairs:

\- Simple input fields:    
  \* Linear feet of gutter    
  \* Stories    
  \* Roof pitch (basic options: low/medium/high)    
\- Output:    
  \* Estimated range: “Est. $X – $Y”    
  \* Clear disclaimer text  

\---

\#\#\# 6\. Data Mapping & Status Alignment (Acculynx & QuickBooks)

\*\*Goal:\*\* Ensure the app’s simple statuses align with Acculynx and QuickBooks states behind the scenes.

\*\*Conceptual Mapping:\*\*

\- \*\*App: “Received”\*\*    
  \* Acculynx: Lead created or Job in “Lead” status  

\- \*\*App: “Scheduled”\*\*    
  \* Acculynx: Job scheduled (date/time set)  

\- \*\*App: “Job In Progress”\*\*    
  \* Acculynx: Job status updated to “In Progress” or tech marked as on-site  

\- \*\*App: “Job Complete”\*\*    
  \* Acculynx: Job marked complete / work finished  

\- \*\*App: “Finished (Payment Finalized)”\*\*    
  \* QuickBooks: Invoice paid    
  \* Acculynx: Job closed  

\*\*Note:\*\*    
The backend will handle the exact mapping logic and error handling; the app will only need to respond to status updates provided by the backend.

\---

\#\#\# 7\. Technical & UX Constraints

1\. \*\*Simplicity Over Power:\*\*    
   \* UX must be extremely simple. No complex configuration in the app.  

2\. \*\*Reliability:\*\*    
   \* All requests must be recorded reliably and synced to Acculynx.    
   \* The app should show clear error states if something goes wrong (e.g. “We couldn’t submit your request. Please try again or call us.”).  

3\. \*\*Performance:\*\*    
   \* App should feel snappy and load core screens quickly on typical mobile devices.  

4\. \*\*Security & Privacy:\*\*    
   \* All customer data handled securely.    
   \* Authentication tokens stored securely.  

\---

\#\#\# 8\. Future Enhancements (Not in V1 Scope But Influential)

1\. In-App Payments    
2\. Tech location sharing & “on the way” map    
3\. Maintenance plans and memberships with recurring services    
4\. In-app messaging with Sons team    
5\. More complex promotions & loyalty programs  

These future considerations should be kept in mind while designing data models and integration patterns but will not be implemented in V1.

\---

\*\*Appendix:\*\*

\*\*Core Entities (Conceptual, Not Full Schema):\*\*

1\. User    
   \* id    
   \* first\_name    
   \* last\_name    
   \* email    
   \* phone    
   \* password\_hash    
   \* email\_verified    
   \* notification\_preferences  

2\. Property    
   \* id    
   \* user\_id    
   \* nickname    
   \* address\_line\_1    
   \* address\_line\_2    
   \* city    
   \* state    
   \* zip    
   \* property\_type (Residential / Commercial)  

3\. Service    
   \* id    
   \* name    
   \* category    
   \* description    
   \* pricing\_type (fixed / range / custom\_quote)    
   \* pricing\_metadata  

4\. Order (Service Request)    
   \* id    
   \* user\_id    
   \* property\_id    
   \* service\_id    
   \* description    
   \* photos (file references)    
   \* status (Received / Scheduled / Job In Progress / Job Complete / Finished / Cancelled)    
   \* acculynx\_job\_id    
   \* created\_at    
   \* updated\_at  

5\. Notification    
   \* id    
   \* user\_id    
   \* order\_id (optional)    
   \* type    
   \* title    
   \* message    
   \* read\_at    
   \* created\_at  

\---

This PRD defines the user-facing behavior and core concepts for the Sons Roofing Solutions Mobile App (Sons Home Helper). Integration details, detailed database schema, and API specifications will be defined in the technical design phase.