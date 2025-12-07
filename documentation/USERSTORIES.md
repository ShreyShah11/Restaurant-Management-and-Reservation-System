# User Stories

## Story 1 - User Registration

### Front of Card

- **As a** new user
- **I want to** register with my personal details (full name, email address, phone number, and password)
- **So that** I can create a unique account, access the system securely, and start booking tables

---

### Back of Card

#### Acceptance Criteria

1. Registration succeeds only when all required details are provided and valid.
2. The system must validate the **email format** before submission.
3. Passwords must meet complexity requirements (minimum 8 characters, at least one uppercase letter, one number, and one special character).
4. Upon successful registration, the user receives a **confirmation email and/or SMS** with an activation link/code.
5. The user account must be marked as **inactive** until the confirmation link/code is verified.
6. Registration errors (e.g., missing fields, weak password, duplicate email) must display user-friendly error messages.

---

## Story 2 - User Login

### Front of Card

- **As a** registered user
- **I want to** log in securely
- **So that** I can access my personalized dashboard

---

### Back of Card

#### Acceptance Criteria

1. Login succeeds only when the correct email/username and password are provided.
2. Incorrect credentials must display clear and user-friendly error messages without revealing sensitive details.
3. Passwords must be stored securely in encrypted (hashed & salted) form.
4. Users must be able to log out manually.
5. Account lockout must occur after multiple failed login attempts (e.g., 5 attempts) to prevent brute-force attacks.
6. System should provide “Forgot Password” functionality for account recovery.

---

## Story 3 - Search Restaurants

### Front of Card

- **As a** user
- **I want to** search for restaurants by location or cuisine
- **So that** I can find suitable dining options

---

### Back of Card

#### Acceptance Criteria

1. Matching restaurants must be displayed with essential details such as **name, rating, cuisine type, location, price range, and availability**.
2. If no matches exist, the system must display a clear and friendly message .
3. Users must be able to apply filters such as **distance, cuisine type, price range, rating, and availability**.
4. Search results must support pagination or infinite scrolling for better usability.
5. The system must allow sorting by **relevance, rating, distance, or popularity**.
6. If location-based search is enabled, the system must use the user’s current location (with permission) or allow manual input.

---

## Story 4 - View Menus

### Front of Card

- **As a** user
- **I want to** view restaurant menus
- **So that** I can decide what to order before reserving

---

### Back of Card

#### Acceptance Criteria

1. Menus must display **dish names, descriptions, prices, categories, and availability status**.
2. Any updates made by restaurant managers (e.g., adding/removing dishes, changing availability, updating prices) must reflect **immediately** in the user interface.
3. Menus must support categorization (e.g., Appetizers, Main Course, Desserts, Beverages).
4. Items should display dietary labels (e.g., vegetarian, vegan, gluten-free, spicy).
5. Search and filter options must be available within menus (e.g., filter by cuisine type, dietary preference, or price range).
6. If an item becomes unavailable while browsing, the system must indicate it clearly in real time.

---

## Story 5 – Book a Table

### Front of Card

- **As a** user
- **I want to** book a table by selecting date, time, and number of people
- **So that** I can secure my dining slot

---

### Back of Card

#### Acceptance Criteria

1. System checks real-time table availability.
2. Each booking generates a unique reservation ID.
3. Confirmation is sent via email/SMS/app.

#### Notes

- Reservation ID must be searchable in the system.

#### Constraints

- Booking must not exceed restaurant seating capacity.

---

## Story 6 – Modify/Cancel Reservation

### Front of Card

- **As a** user
- **I want to** modify or cancel my reservation
- **So that** I can adjust plans if needed

---

### Back of Card

#### Acceptance Criteria

1. Modification is allowed only before cutoff time.
2. Cancellation must notify both user and restaurant.

#### Notes

- Refund policies may apply for cancellations.

#### Constraints

- Modifications must be processed within **5 seconds**.

---

## Story 7 – Booking Confirmation

### Front of Card

- **As a** user
- **I want to** receive booking confirmations by giving tokens
- **So that** I have proof of my reservation

---

### Back of Card

#### Acceptance Criteria

1. Confirmation message is sent immediately after token payment.
2. Message contains reservation ID, date, time, and restaurant details.
3. Token payment must be logged and linked to the reservation.

#### Notes

- Reservation ID must remain searchable in the system.
- Token policies (refundable/non-refundable) may vary per restaurant.

#### Constraints

- Notifications must be delivered via at least **two channels** (email + SMS).
- Token validation must complete within **3 seconds** to confirm booking.

---

## Story 8 – Reservation Reminder

### Front of Card

- **As a** user
- **I want to** receive reminders before my booking
- **So that** I do not forget my reservation

---

### Back of Card

#### Acceptance Criteria

1. Reminder sent **X hours** before scheduled time.
2. Includes booking details and restaurant contact.

#### Constraints

- Reminders must not be missed during system outages.

---

## Story 9 – Submit Reviews

### Front of Card

- **As a** user
- **I want to** submit reviews and ratings
- **So that** I can share my dining experience

---

### Back of Card

#### Acceptance Criteria

1. Only users with completed reservations can post reviews.
2. Reviews include a rating (1–5) and optional text.

#### Notes

- Offensive language must be filtered.

#### Constraints

- Reviews must be stored permanently unless flagged.

---

## Story 10 – View Reviews

### Front of Card

- **As a** user
- **I want to** see other users’ reviews
- **So that** I can make informed decisions

---

### Back of Card

#### Acceptance Criteria

1. Reviews are displayed with user rating and text.
2. Restaurants show aggregated rating scores.

#### Notes

- Reviews must be accurate and reflect real customer experiences.
- Display order may default to most recent first, with sorting/filtering options.

#### Constraints

- Reviews must load in under **2 seconds**.

---

## Story 11 – Update Table Availability

### Front of Card

- **As a** restaurant manager
- **I want to** update table availability
- **So that** customers see accurate booking slots

---

### Back of Card

#### Acceptance Criteria

1. Updated availability reflects instantly.
2. Overbooking must be prevented.

#### Notes

- Availability changes should sync across all platforms (web and mobile).
- Updates should be logged for audit purposes.

#### Constraints

- Updates allowed only by authorized managers.

---

## Story 12 – Update Menus

### Front of Card

- **As a** restaurant manager
- **I want to** update the menu
- **So that** customers can view the latest offerings

---

### Back of Card

#### Acceptance Criteria

1. Menu changes are reflected in real-time.
2. Out-of-stock items are clearly indicated.

#### Notes

- Menu updates should support images and detailed descriptions.
- Changes must be version-controlled for rollback if needed.

#### Constraints

- Menu must be editable only during manager login.

---

## Story 13 – Earn Loyalty Points

### Front of Card

- **As a** frequent user
- **I want to** earn loyalty points for reservations
- **So that** I can get rewards

---

### Back of Card

#### Acceptance Criteria

1. Points are credited after reservation completion.
2. Dashboard shows accumulated points.

#### Notes

- Points calculation should be consistent (e.g., fixed % of booking amount).
- Expiry rules for points (if any) must be clearly communicated.
- Points must be updated in real-time after booking completion.

#### Constraints

- Points cannot be transferred between accounts.

---

## Story 14 – Redeem Loyalty Points

### Front of Card

- **As a** user
- **I want to** redeem my loyalty points
- **So that** I can save money on future bookings

---

### Back of Card

#### Acceptance Criteria

1. Points are deducted upon redemption.
2. Discount is applied immediately at checkout.

#### Notes

- Redemption must happen only during checkout flow.
- System should show available balance and points applied before confirmation.
- Redemption history should be visible to users.

#### Constraints

- Minimum redemption threshold may apply.

---

## Story 15 – Manager Notifications for Bookings

### Front of Card

- **As a** restaurant manager
- **I want to** receive instant notifications for bookings
- **So that** I can prepare accordingly

---

### Back of Card

#### Acceptance Criteria

1. Manager gets SMS/Email/App notification instantly.
2. Notification contains date, time, customer, and party size.

#### Notes

- Push notifications require mobile app or web app support.
- Notifications should be configurable (enable/disable or select channel).
- Delivery logs must be maintained for audit.

#### Constraints

- Notifications must be delivered within **10 seconds** under normal conditions.

---

## Story 16 – Block Online Reservations

### Front of Card

- **As a** restaurant manager
- **I want to** stop online reservations for particular dates and times
- **So that** I can handle walk-in customers easily

---

### Back of Card

#### Acceptance Criteria

1. Manager can block specific slots.
2. Blocked slots are not shown to customers.

#### Notes

- Important for handling festive rush or large group bookings.
- Blocking rules must allow recurring blocks (e.g., every Monday lunch).
- System must keep history of blocked slots for reports.

#### Constraints

- Blocking must reflect on the customer side within **5 seconds**.

---

## Story 17 – Monitor System

### Front of Card

- **As an** administrator
- **I want to** monitor system activity
- **So that** I can ensure smooth operations

---

### Back of Card

#### Acceptance Criteria

1. Dashboard displays active users, reservations, and system load.
2. Alerts are generated for unusual activity.

#### Notes

- Monitoring dashboard should be real-time with auto-refresh.
- Alert thresholds must be configurable by administrators.
- Logs of alerts and activities must be stored for audit.

#### Constraints

- Monitoring must not affect system performance.

---

## Story 18 – Add Payment Gateway

### Front of Card

- **As an** admin
- **I want to** add a payment gateway
- **So that** the platform stays secure and manages payments

---

### Back of Card

#### Acceptance Criteria

1. Admin can configure payment gateway (Stripe, PayPal, Razorpay).
2. Transactions are logged and encrypted.
3. Failed transactions are rejected safely.

#### Notes

- Must be PCI DSS compliant.
- Supports refunds and cancellations.
- System should support switching between multiple providers.

#### Constraints

- Payment gateway integration must meet industry security standards.
- All transactions must complete or fail within **30 seconds**.

## Story 19 – Generate Reports

### Front of Card

- **As an** administrator
- **I want** to generate reports on reservations, activity, and revenue
- **So that I** can support decision-making

---

### Back of Card

#### Acceptance Criteria

1. Reports are exportable in PDF/Excel formats.
2. Reports are available daily, weekly, and monthly.

#### Notes

- Reports should include filters (e.g., by date range, restaurant, or user).
- Reports must be accessible only to authorized administrators.
- Generated reports should be stored for future reference.

#### Constraints

- Report generation must not exceed **10 seconds**.

---

## Story 20 – Review Summarizer

### Front of Card

- **As a** customer
- **I want** to see summarized reviews of a restaurant
- **So that I** can quickly understand overall customer feedback

---

### Back of Card

#### Acceptance Criteria

1. Reviews are summarized into short, readable text.
2. Sentiment (positive/negative/neutral) is displayed.
3. Summaries are updated automatically when new reviews are added.

#### Notes

- LLM should generate summaries in a crisp and non-biased format.
- Restaurant owners should get improvement suggestions (e.g., “improve service speed”).

#### Constraints

- Summarization must complete in <5 seconds.
- Avoid hallucinated or fake information.

---

## Story 21 – Suggestion Maker (For Owners)

### Front of Card

- **As a** restaurant owner
- **I want** AI-generated improvement suggestions from customer reviews
- **So that I** can enhance my services and attract more customers

---

### Back of Card

#### Acceptance Criteria

1. Suggestions are actionable (e.g., improve hygiene, reduce wait time).
2. Suggestions must be based only on actual customer reviews.
3. Suggestions are displayed in the admin dashboard.

#### Notes

- Uses LLM/NLP to extract common complaints or praises.
- Should highlight top 3 improvement areas.

#### Constraints

- Suggestions must refresh weekly.
- Must handle at least 1,000 reviews per restaurant.

---

## Story 22 – Auto-Suggestion (Search Bar)

### Front of Card

- **As a** customer
- **I want** auto-suggestions while typing in the search bar
- **So that I** can quickly find restaurants, cuisines, or dishes

---

### Back of Card

#### Acceptance Criteria

1. Suggestions appear after typing at least 2 characters.
2. Must show restaurants, cuisines, and popular dishes.
3. Suggestions update dynamically as user types more.

#### Notes

- LLM/NLP can handle misspellings and intent (e.g., “cheap pizza” → budget pizza places).
- Personalized suggestions based on past searches.

#### Constraints

- Load time <1 second.
- Should not show closed/inactive restaurants.
