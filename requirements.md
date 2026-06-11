# Requirements Document

## Introduction

Doctor Hub is a healthcare consultation and patient history management system that connects patients with Allopathic, Homeopathic, and Herbal doctors. Patients can search and filter doctors by disease and treatment type, book appointments, upload payment screenshots for verification, and maintain immutable medical histories. Doctors manage their clinics, schedules, and prescriptions. Assistants verify payments and confirm bookings. Admins and Super Admins govern the platform. The system is built on a Node.js REST API backend with a React/Next.js frontend, JWT-based authentication, and a relational SQL database.

---

## Glossary

- **System**: The Doctor Hub platform as a whole
- **Patient**: A registered user who books appointments and manages personal health records
- **Doctor**: A registered healthcare provider offering consultations under a specific treatment type
- **Assistant**: A staff member assigned to a Doctor who verifies payments and manages bookings
- **Admin**: A platform administrator who manages doctors and regular users
- **Super_Admin**: A privileged administrator with full system control
- **Appointment**: A scheduled consultation between a Patient and a Doctor
- **Prescription**: A medical record created by a Doctor during or after a consultation
- **Medical_History**: The complete, immutable collection of a Patient's health records and prescriptions
- **Payment**: A payment transaction record associated with an Appointment, verified via screenshot upload
- **Clinic**: A physical or virtual location registered under a Doctor
- **Schedule**: The set of available time slots defined by a Doctor for a specific Clinic
- **JWT**: JSON Web Token used for stateless authentication
- **RBAC**: Role-Based Access Control governing which actions each role may perform
- **Treatment_Type**: The medical tradition a Doctor practices — one of Allopathic, Homeopathic, or Herbal
- **Auth_Service**: The subsystem responsible for registration, login, password reset, and JWT issuance
- **Doctor_Service**: The subsystem responsible for doctor profiles, clinics, and schedules
- **Appointment_Service**: The subsystem responsible for booking and confirmation workflows
- **Payment_Service**: The subsystem responsible for payment screenshot upload and verification
- **History_Service**: The subsystem responsible for reading and appending Medical_History records
- **Prescription_Service**: The subsystem responsible for creating and reading Prescriptions
- **Notification_Service**: The subsystem responsible for in-system notifications to users

---

## Requirements

---

### Requirement 1: User Registration

**User Story:** As a new user, I want to register an account with my role, so that I can access the features relevant to my role on the platform.

#### Acceptance Criteria

1. WHEN a registration request is submitted with a unique, valid-format email address, a password between 8 and 128 characters, a full name between 1 and 100 characters, a phone number matching the E.164 format (e.g. +12125551234, up to 15 digits), and a role of Patient or Doctor, THE Auth_Service SHALL create a new user record and return a success response indicating the account was created.
2. IF a registration request is submitted with an email that already exists in the system, THEN THE Auth_Service SHALL return a conflict error response indicating the email is already registered.
3. IF a registration request is submitted with a missing required field (email, password, full name, phone number, or role), THEN THE Auth_Service SHALL return a validation error response listing each missing field.
4. IF a registration request is submitted with a password outside the 8 to 128 character range, THEN THE Auth_Service SHALL return a validation error response indicating the password length requirement.
5. WHEN a user record is created, THE Auth_Service SHALL store the password in a non-reversible hashed form and SHALL NOT persist the plaintext password.
6. IF a registration request is submitted with a role value other than Patient or Doctor, THEN THE Auth_Service SHALL return a validation error response indicating the role is invalid.
7. IF a registration request is submitted to the public registration endpoint with a role of Admin or Super_Admin, THEN THE Auth_Service SHALL return a validation error response indicating the role is invalid, without creating a user record.
8. IF a registration request is submitted with an email that does not conform to a valid email address format, THEN THE Auth_Service SHALL return a validation error response indicating the email format is invalid.

---

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my credentials, so that I can receive a JWT and access protected resources.

#### Acceptance Criteria

1. WHEN a login request is submitted with a registered email and correct password, THE Auth_Service SHALL return a 200 response containing a signed JWT and the user's role.
2. WHEN a login request is submitted with an unregistered email, THE Auth_Service SHALL return a 401 Unauthorized error with an error message indicating invalid credentials.
3. WHEN a login request is submitted with a registered email and incorrect password, THE Auth_Service SHALL return a 401 Unauthorized error with an error message indicating invalid credentials.
4. THE Auth_Service SHALL sign JWTs with an expiry of 24 hours and include the user ID, role, and issued-at timestamp in the token payload.
5. WHEN a login request is submitted with a missing, empty, or blank email field, or a missing or empty password field, or an email that does not conform to a valid email address format, THE Auth_Service SHALL return a 422 Unprocessable Entity error listing each invalid or missing field.

---

### Requirement 3: Forgot Password

**User Story:** As a registered user who has forgotten my password, I want to reset it via my email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a forgot-password request is submitted with a registered email, THE Auth_Service SHALL send a password-reset link to that email address and return a 200 response.
2. WHEN a forgot-password request is submitted with an email not found in the system, THE Auth_Service SHALL return a 200 response without revealing whether the email exists.
3. WHEN a password-reset link is followed with a valid, unexpired token and a new password of at least 8 characters, THE Auth_Service SHALL update the password hash and invalidate the reset token, then return a 200 response.
4. WHEN a password-reset link is followed with an expired or already-used token, THE Auth_Service SHALL return a 400 Bad Request error with the message "Reset token is invalid or expired".
5. THE Auth_Service SHALL expire password-reset tokens after 60 minutes of issuance.

---

### Requirement 4: JWT Authentication and Role-Based Access Control

**User Story:** As the system, I want every protected API endpoint to verify the caller's JWT and role, so that only authorised users can access sensitive resources.

#### Acceptance Criteria

1. WHEN a request to a protected endpoint is received without an Authorization header, THE System SHALL return a 401 Unauthorized error with the message "Authentication required".
2. WHEN a request to a protected endpoint is received with a malformed or expired JWT, THE System SHALL return a 401 Unauthorized error with the message "Invalid or expired token".
3. WHEN a request to a protected endpoint is received with a valid JWT but the caller's role does not have permission for that operation, THE System SHALL return a 403 Forbidden error with the message "Insufficient permissions".
4. WHILE a valid JWT is present in the request, THE System SHALL extract the user ID and role from the token and make them available to all downstream service layers without re-querying the database on every request.
5. THE System SHALL enforce the following role-permission boundaries:
   - Patient: book appointments, view own Medical_History, upload Payment screenshots, view own Prescriptions
   - Doctor: create Prescriptions, manage own Clinics and Schedules, view assigned Patients' Medical_History
   - Assistant: verify Payments, view and update Appointment status for assigned Doctor
   - Admin: create and deactivate Doctor accounts, view all user accounts
   - Super_Admin: perform all Admin operations plus deactivate Admin accounts and access system-level reports

---

### Requirement 5: Doctor Profile and Search

**User Story:** As a Patient, I want to search for doctors by disease and treatment type, so that I can find the right doctor for my condition.

#### Acceptance Criteria

1. WHEN a GET /api/doctors request is received without filters, THE Doctor_Service SHALL return a paginated list of all active Doctor profiles with a default page size of 20.
2. WHEN a GET /api/doctors request is received with a `treatment_type` filter of Allopathic, Homeopathic, or Herbal, THE Doctor_Service SHALL return only Doctor profiles matching that treatment type.
3. WHEN a GET /api/doctors request is received with a `disease` filter, THE Doctor_Service SHALL return only Doctor profiles whose specialisation or listed conditions include the specified disease keyword.
4. WHEN a GET /api/doctors request is received with both `treatment_type` and `disease` filters, THE Doctor_Service SHALL return only Doctor profiles matching both conditions simultaneously.
5. IF no Doctor profiles match the provided filters, THEN THE Doctor_Service SHALL return a 200 response with an empty results array and a `total` count of 0.
6. WHEN a GET /api/doctors/{id} request is received for an existing Doctor, THE Doctor_Service SHALL return the full Doctor profile including name, treatment type, specialisations, clinic locations, and available schedule slots.
7. WHEN a GET /api/doctors/{id} request is received for a non-existent Doctor ID, THE Doctor_Service SHALL return a 404 Not Found error.

---

### Requirement 6: Doctor Registration and Profile Management

**User Story:** As a Doctor, I want to manage my professional profile, so that Patients can find accurate information about my practice.

#### Acceptance Criteria

1. WHEN an authenticated Doctor submits a profile update with valid fields (specialisation, treatment type, bio, consultation fee), THE Doctor_Service SHALL persist the update and return a 200 response with the updated profile.
2. WHEN an authenticated Doctor submits a profile update with an invalid treatment_type value, THE Doctor_Service SHALL return a 422 error with the message "treatment_type must be one of Allopathic, Homeopathic, Herbal".
3. WHEN an authenticated Doctor submits a profile update with a negative consultation fee, THE Doctor_Service SHALL return a 422 error with the message "consultation_fee must be a positive number".
4. WHEN an Admin creates a Doctor account via the admin endpoint, THE Doctor_Service SHALL create the Doctor record and return a 201 response.
5. WHEN an Admin deactivates a Doctor account, THE Doctor_Service SHALL set the Doctor's status to inactive and prevent that Doctor from appearing in search results.

---

### Requirement 7: Clinic Management

**User Story:** As a Doctor, I want to register and manage my clinics, so that Patients know where and when I am available.

#### Acceptance Criteria

1. WHEN an authenticated Doctor submits a POST /api/clinics request with a valid clinic name, address, and city, THE Doctor_Service SHALL create a Clinic record linked to that Doctor and return a 201 response.
2. WHEN an authenticated Doctor submits a clinic update with valid fields, THE Doctor_Service SHALL update the Clinic record and return a 200 response.
3. WHEN an authenticated Doctor submits a clinic creation request with a missing clinic name or address, THE Doctor_Service SHALL return a 422 error listing each missing field.
4. IF an authenticated Doctor attempts to update or delete a Clinic not belonging to that Doctor, THEN THE Doctor_Service SHALL return a 403 Forbidden error.
5. THE Doctor_Service SHALL allow a single Doctor to register up to 5 Clinics.
6. WHEN an authenticated Doctor submits a DELETE /api/clinics/{id} request for an owned Clinic with no future confirmed Appointments, THE Doctor_Service SHALL soft-delete the Clinic and return a 200 response.
7. IF an authenticated Doctor attempts to delete a Clinic that has future confirmed Appointments, THEN THE Doctor_Service SHALL return a 409 Conflict error with the message "Cannot delete clinic with upcoming appointments".

---

### Requirement 8: Schedule Management

**User Story:** As a Doctor, I want to define my availability schedule per clinic, so that Patients can only book slots when I am available.

#### Acceptance Criteria

1. WHEN an authenticated Doctor submits a schedule for a Clinic with valid day-of-week, start time, end time, and slot duration in minutes, THE Doctor_Service SHALL create the Schedule and return a 201 response.
2. WHEN a schedule is submitted where the start time is not before the end time, THE Doctor_Service SHALL return a 422 error with the message "start_time must be before end_time".
3. WHEN a schedule is submitted with a slot duration less than 10 minutes or greater than 120 minutes, THE Doctor_Service SHALL return a 422 error with the message "slot_duration must be between 10 and 120 minutes".
4. WHEN an authenticated Doctor updates a Schedule, THE Doctor_Service SHALL apply the update only to future time slots and SHALL NOT modify already-booked Appointment slots.
5. THE Doctor_Service SHALL make available slot times computable from the Schedule by dividing the time window into equal intervals of the specified slot duration.

---

### Requirement 9: Appointment Booking

**User Story:** As a Patient, I want to book an appointment with a Doctor at an available slot, so that I can receive a consultation.

#### Acceptance Criteria

1. WHEN an authenticated Patient submits a POST /api/appointments request with a valid Doctor ID, Clinic ID, and an available date-time slot, THE Appointment_Service SHALL create an Appointment in the "pending_payment" status and return a 201 response with the Appointment ID.
2. WHEN an Appointment booking request is submitted for a date-time slot that is already booked or outside the Doctor's Schedule, THE Appointment_Service SHALL return a 409 Conflict error with the message "Slot unavailable".
3. WHEN an Appointment booking request is submitted with a missing Doctor ID, Clinic ID, or date-time slot, THE Appointment_Service SHALL return a 422 error listing each missing field.
4. WHILE an Appointment is in "pending_payment" status for more than 24 hours without a verified Payment, THE Appointment_Service SHALL automatically cancel the Appointment and release the slot.
5. WHEN an Appointment is cancelled by the System under criterion 4, THE Notification_Service SHALL send a cancellation notification to the Patient.
6. WHEN an authenticated Patient submits a cancellation request for their own Appointment that is in "pending_payment" or "confirmed" status at least 2 hours before the scheduled time, THE Appointment_Service SHALL cancel the Appointment and return a 200 response.
7. IF an authenticated Patient attempts to cancel an Appointment less than 2 hours before the scheduled time, THEN THE Appointment_Service SHALL return a 409 Conflict error with the message "Cancellation window has passed".

---

### Requirement 10: Payment Upload and Verification

**User Story:** As a Patient, I want to upload a payment screenshot for my appointment, so that the assistant can verify my payment and confirm my booking.

#### Acceptance Criteria

1. WHEN an authenticated Patient submits a POST /api/payments request with a valid Appointment ID and a screenshot file in JPEG, PNG, or PDF format, THE Payment_Service SHALL store the file and create a Payment record in "pending_verification" status, then return a 201 response.
2. WHEN a payment upload is submitted with an Appointment ID that does not belong to the requesting Patient, THE Payment_Service SHALL return a 403 Forbidden error.
3. WHEN a payment upload is submitted with a file exceeding 5 MB, THE Payment_Service SHALL return a 422 error with the message "File size must not exceed 5 MB".
4. WHEN a payment upload is submitted with a file type other than JPEG, PNG, or PDF, THE Payment_Service SHALL return a 422 error with the message "Unsupported file type".
5. WHEN an authenticated Assistant marks a Payment record as "verified", THE Payment_Service SHALL update the Payment status to "verified" and THE Appointment_Service SHALL update the associated Appointment status to "confirmed", then THE Notification_Service SHALL notify the Patient of confirmation.
6. WHEN an authenticated Assistant marks a Payment record as "rejected" with a reason, THE Payment_Service SHALL update the Payment status to "rejected" and THE Notification_Service SHALL notify the Patient with the rejection reason.
7. IF an authenticated Assistant attempts to verify or reject a Payment not associated with their assigned Doctor, THEN THE Payment_Service SHALL return a 403 Forbidden error.

---

### Requirement 11: Prescription Management

**User Story:** As a Doctor, I want to create prescriptions for my patients after a consultation, so that patients have a permanent record of their treatment.

#### Acceptance Criteria

1. WHEN an authenticated Doctor submits a POST /api/prescriptions request with a valid confirmed Appointment ID, medication list, dosage instructions, and diagnosis notes, THE Prescription_Service SHALL create a Prescription record and return a 201 response.
2. WHEN a prescription creation request is submitted for an Appointment that does not belong to the requesting Doctor, THE Prescription_Service SHALL return a 403 Forbidden error.
3. WHEN a prescription creation request is submitted for an Appointment not in "confirmed" status, THE Prescription_Service SHALL return a 409 Conflict error with the message "Prescription can only be created for confirmed appointments".
4. THE Prescription_Service SHALL NOT allow any user role to modify or delete an existing Prescription record after creation.
5. WHEN an authenticated Patient requests GET /api/prescriptions for their own account, THE Prescription_Service SHALL return all Prescription records associated with that Patient.
6. WHEN an authenticated Doctor requests GET /api/prescriptions for a specific Patient, THE Prescription_Service SHALL return Prescription records only for Appointments where that Doctor was the consulting Doctor.

---

### Requirement 12: Medical History Management

**User Story:** As a Patient, I want to view my complete medical history, so that I can share it with any doctor I consult.

#### Acceptance Criteria

1. WHEN an authenticated Patient submits a GET /api/history request, THE History_Service SHALL return the complete, chronologically ordered Medical_History for that Patient, including all Prescriptions, diagnoses, and uploaded reports.
2. WHEN an authenticated Doctor submits a GET /api/history/{patient_id} request for a Patient with whom the Doctor has at least one confirmed Appointment, THE History_Service SHALL return that Patient's Medical_History.
3. IF an authenticated Doctor submits a GET /api/history/{patient_id} request for a Patient with whom the Doctor has no confirmed Appointment, THEN THE History_Service SHALL return a 403 Forbidden error with the message "Access to this patient's history is not authorised".
4. THE History_Service SHALL NOT expose any endpoint that allows deletion of a Medical_History record for any user role.
5. THE History_Service SHALL NOT expose any endpoint that allows modification of an existing Medical_History entry.
6. WHEN an authenticated Doctor appends a new record to a Patient's Medical_History via POST /api/history/{patient_id}, THE History_Service SHALL create a new immutable record and return a 201 response, without altering any existing record.
7. WHEN an authenticated Patient uploads a medical report file in PDF, JPEG, or PNG format via POST /api/history/reports, THE History_Service SHALL store the file and attach it as an entry in the Patient's Medical_History, then return a 201 response.

---

### Requirement 13: Doctor Assistant Management

**User Story:** As a Doctor, I want to assign and manage assistants for my practice, so that payment verification and booking management are handled efficiently.

#### Acceptance Criteria

1. WHEN an authenticated Doctor submits a POST /api/assistants request with a valid registered user ID and that user has no existing Assistant assignment, THE Doctor_Service SHALL create an Assistant record linking that user to the Doctor and return a 201 response.
2. WHEN a Doctor attempts to assign a user who is already an Assistant for another Doctor, THE Doctor_Service SHALL return a 409 Conflict error with the message "User is already assigned as an assistant".
3. THE Doctor_Service SHALL allow a single Doctor to assign up to 3 Assistants.
4. WHEN a Doctor attempts to assign a 4th Assistant, THE Doctor_Service SHALL return a 409 Conflict error with the message "Maximum of 3 assistants allowed per doctor".
5. WHEN an authenticated Doctor submits a DELETE /api/assistants/{id} request for one of their own Assistants, THE Doctor_Service SHALL remove the Assistant assignment and return a 200 response.

---

### Requirement 14: Admin — Doctor and User Management

**User Story:** As an Admin, I want to manage doctor accounts and all user accounts, so that the platform maintains accurate and trustworthy provider listings.

#### Acceptance Criteria

1. WHEN an authenticated Admin submits a GET /api/admin/users request, THE System SHALL return a paginated list of all user accounts with their roles and statuses.
2. WHEN an authenticated Admin submits a POST /api/admin/doctors request with valid Doctor profile data and account credentials, THE System SHALL create the Doctor account and return a 201 response.
3. WHEN an authenticated Admin submits a PATCH /api/admin/users/{id}/deactivate request for a Patient or Doctor account, THE System SHALL set that account's status to inactive and return a 200 response.
4. IF an authenticated Admin attempts to deactivate another Admin or a Super_Admin account, THEN THE System SHALL return a 403 Forbidden error.
5. WHEN a user account is deactivated, THE Auth_Service SHALL reject all subsequent login attempts for that account with a 401 error and the message "Account is deactivated".

---

### Requirement 15: Super Admin — Full System Control

**User Story:** As a Super Admin, I want full control over all accounts and system operations, so that I can maintain platform integrity and compliance.

#### Acceptance Criteria

1. WHEN an authenticated Super_Admin submits a PATCH /api/admin/users/{id}/deactivate request for any account including Admin accounts, THE System SHALL set that account's status to inactive and return a 200 response.
2. WHEN an authenticated Super_Admin submits a GET /api/admin/reports request, THE System SHALL return system-level metrics including total registered users by role, total Appointments by status, and total Payments by status.
3. THE System SHALL ensure that only one Super_Admin account exists per deployment, created via a protected internal seeding mechanism and not through the public API.
4. WHEN an authenticated Super_Admin reactivates a deactivated account via PATCH /api/admin/users/{id}/activate, THE System SHALL set that account's status to active and return a 200 response.

---

### Requirement 16: Patient-Doctor Communication

**User Story:** As a Patient, I want to send messages to my Doctor within the platform, so that I can ask follow-up questions without booking a new appointment.

#### Acceptance Criteria

1. WHEN an authenticated Patient submits a POST /api/messages request with a valid Doctor ID and message body, and the Patient has at least one confirmed past Appointment with that Doctor, THE System SHALL store the message and return a 201 response.
2. IF an authenticated Patient attempts to message a Doctor with whom they have no confirmed past Appointment, THEN THE System SHALL return a 403 Forbidden error with the message "Messaging is only available after a confirmed consultation".
3. WHEN an authenticated Doctor submits a GET /api/messages request, THE System SHALL return all message threads from Patients who have had confirmed Appointments with that Doctor, ordered by most recent message.
4. WHEN an authenticated Doctor replies to a Patient message, THE System SHALL store the reply and return a 201 response.
5. THE System SHALL NOT allow bulk or broadcast messaging from any role.

---

### Requirement 17: Data Security and Input Validation

**User Story:** As the system, I want all inputs validated and data protected, so that patient data and platform integrity are maintained.

#### Acceptance Criteria

1. THE System SHALL validate all incoming request bodies against defined schemas before passing data to any service layer, and SHALL return a 422 error with field-level details for any schema violation.
2. THE System SHALL use parameterised queries or an ORM with parameterised bindings for all database interactions to prevent SQL injection.
3. WHEN a user account is created or a password is changed, THE Auth_Service SHALL hash the password using bcrypt with a minimum cost factor of 10.
4. THE System SHALL enforce HTTPS for all API endpoints and SHALL reject HTTP connections.
5. THE System SHALL include rate limiting on authentication endpoints, allowing a maximum of 10 requests per IP address per minute, and SHALL return a 429 Too Many Requests error when the limit is exceeded.
6. THE System SHALL sanitise all user-supplied string inputs before storing them to prevent XSS payloads from being persisted.
