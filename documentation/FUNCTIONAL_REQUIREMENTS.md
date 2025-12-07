# Functional Requirements

1.  _User Authentication_
    - _Description:_ The system must provide a secure way for both customers and restaurant owners to create accounts, log in, and log out.
    - _Actors:_ Customer, Restaurant Owner
    - _Details:_
        - Customers should be able to register with their email and password.
        - Restaurant owners should have a separate registration process.
        - The system should authenticate users before granting access to protected features.

2.  _Restaurant Discovery and Search_
    - _Description:_ Customers must be able to find and view details of available restaurants.
    - _Actors:_ Customer
    - _Details:_
        - Display a list of all restaurants.
        - Allow customers to search for restaurants by name.
        - Allow customers to browse restaurant details, including location, cuisine, menus, and images.

3.  _Table Reservation_
    - _Description:_ Customers must be able to make a reservation at a selected restaurant.
    - _Actors:_ Customer
    - _Details:_
        - Customers can select a date, time, and the number of guests.
        - The system should check for table availability based on the restaurant's configuration.
        - A secure token payment is required to confirm the reservation.
        - Customers should receive a confirmation of their booking.

4.  _Restaurant Profile Management_
    - _Description:_ Restaurant owners must be able to manage their restaurant's profile.
    - _Actors:_ Restaurant Owner
    - _Details:_
        - Owners can add a new restaurant profile with details like name, location, cuisine, and contact information.
        - Owners can upload and update menus and images.
        - Owners can define opening hours and table configurations.
        - Owners can update or delete their restaurant profile.

5.  _Reservation Management_
    - _Description:_ Restaurant owners must be able to view and manage incoming reservations.
    - _Actors:_ Restaurant Owner
    - _Details:_
        - Display a list of all reservations for the owner's restaurant.
        - The list should include customer details, date, time, and number of guests.
        - Owners can update the status of a reservation (e.g., Confirmed, Canceled, Completed).

6.  _Customer Notifications and Reminders_
    - _Description:_ The system should notify customers about reservation confirmations, cancellations, or reminders.
    - _Actors:_ Customer, System
    - _Details:_
        - Send real time notifications via email/SMS for booking confirmations and cancellations.
        - Send reminders before the reservation time.
        - Notify in case of restaurant initiated changes.

7.  _Payment and Refund Management_
    - _Description:_ The system must handle secure payments and refund processing for reservations.
    - _Actors:_ Customer, System
    - _Details:_
        - Customers can pay securely using integrated payment gateways.
        - Refunds must be processed automatically in case of cancellations (as per policy).
        - The system should keep a transaction history for each customer.

8.  _Reviews and Ratings_
    - _Description:_ Customers must be able to rate and review restaurants after completing a reservation.
    - _Actors:_ Customer
    - _Details:_
        - Customers can submit reviews with star ratings and comments.
        - Reviews are linked to completed reservations only (to prevent fake reviews).
        - Average ratings should be displayed on restaurant profiles.

9. _Analytics Dashboard for Restaurant Owners_
    - _Description:_ Restaurant owners should be able to view insights about their reservations and performance.
    - _Actors:_ Restaurant Owner
    - _Details:_
        - Dashboard shows metrics like total reservations, peak booking times, cancellation rates.
        - Graphs/charts for tracking trends (weekly, monthly).
        - Helps owners optimize operations and marketing.

10. _Waitlist and Walk in Management_
    - _Description:_ Customers should be able to join a waitlist if no tables are available, and owners should manage walk ins.
    - _Actors:_ Customer, Restaurant Owner
    - _Details:_
        - Customers can request to be added to a waitlist for a specific time slot.
        - Owners can mark walk in reservations in the system.
        - The system should notify customers automatically if a table becomes available.

11. _MultiDevice Responsiveness_
    - _Description:_ The system must be accessible and functional across web and mobile devices.
    - _Actors:_ Customer, Restaurant Owner
    - _Details:_
        - Responsive UI/UX design.
        - Consistent performance on desktop, tablet, and mobile.
        - Cross browser compatibility.

12. _Admin Management (Super Admin)_
    - _Description:_ A super admin must be able to oversee the platform and handle disputes.
    - _Actors:_ Admin
    - _Details:_
        - Approve or verify restaurant owner accounts.
        - Monitor customer and owner activity.
        - Resolve payment/refund disputes.
        - Handle reports of inappropriate reviews or fake restaurants.

13. _Loyalty & Rewards Program_
    - _Description:_ The system should provide a loyalty program to encourage repeat customers.
    - _Actors:_ Customer, System
    - _Details:_
        - Award loyalty points for each completed reservation or a certain spend amount.
        - Allow customers to redeem points for discounts or special offers.
        - Display loyalty balance and redemption history in the customer profile.

14. _Advanced Search & Filtering_
    - _Description:_ Customers must be able to perform advanced searches to quickly find restaurants that match specific criteria.
    - _Actors:_ Customer
    - _Details:_
        - Filter restaurants by cuisine, price range, average rating, and distance.
        - Combine multiple filters (e.g., “Italian cuisine within 5 km and rating ≥4”).
        - Provide a real-time search experience with instant suggestions.
15. _Review Summarizer_
    - _Description:_ Customers must be able to see summarized reviews of a restaurant to quickly understand overall feedback.
    - _Actors:_ Customer, Restaurant Owner
    - _Details:_
        - Summarize reviews into short, readable text.
        - Display overall sentiment (positive/negative/neutral).
        - Summaries update automatically when new reviews are added.
        - Restaurant owners get improvement suggestions.

16. _Suggestion Maker (For Owners)_
    - _Description:_ Restaurant owners must receive AI-generated suggestions from customer reviews to enhance their services.
    - _Actors:_ Restaurant Owner
    - _Details:_
        - Extract actionable suggestions from customer feedback.
        - Display top 3 improvement areas in the admin dashboard.
        - Suggestions refresh weekly.

17. _Auto-Suggestion (Search Bar)_
    - _Description:_ Customers must get real-time auto-suggestions while typing in the search bar to quickly find restaurants, cuisines, or dishes.
    - _Actors:_ Customer
    - _Details:_
        - Suggestions appear after typing at least 2 characters.
        - Include restaurants, cuisines, and popular dishes.
        - Handle misspellings and intent.
        - Personalized suggestions based on past searches.
