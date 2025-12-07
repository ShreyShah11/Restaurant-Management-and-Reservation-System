# EPICs for Restaurant Reservation System

## EPIC 1 – User & Account Management

**Goal:** Secure and functional authentication and account handling for customers, restaurant owners, and admin.  
**Functional Requirements:**

- FR1 – User Authentication
- FR13 – Admin Management (Super Admin)
- FR12 – MultiDevice Responsiveness

**Suggested Sprint:** Sprint 1–2

---

## EPIC 2 – Restaurant Discovery & Search

**Goal:** Enable customers to find restaurants easily using search, filters, and auto-suggestions.  
**Functional Requirements:**

- FR2 – Restaurant Discovery and Search
- FR15 – Advanced Search & Filtering
- FR17 – Auto-Suggestion (Search Bar)

**Suggested Sprint:** Sprint 2–3

---

## EPIC 3 – Reservations & Table Management

**Goal:** Allow customers to book tables and owners to manage seating efficiently.  
**Functional Requirements:**

- FR3 – Table Reservation
- FR5 – Reservation Management
- FR6 – Table Management
- FR11 – Waitlist and Walk-in Management

**Suggested Sprint:** Sprint 3–4

---

## EPIC 4 – Payments & Loyalty

**Goal:** Handle secure payments, refunds, and reward programs.  
**Functional Requirements:**

- FR8 – Payment and Refund Management
- FR14 – Loyalty & Rewards Program

**Suggested Sprint:** Sprint 4–5

---

## EPIC 5 – Reviews & Feedback

**Goal:** Collect and summarize customer feedback; provide AI-driven insights for restaurant owners.  
**Functional Requirements:**

- FR9 – Reviews and Ratings
- FR15 – Review Summarizer
- FR16 – Suggestion Maker (For Owners)

**Suggested Sprint:** Sprint 5–6

---

## EPIC 6 – Analytics & Dashboard

**Goal:** Provide insights for restaurant owners to optimize operations.  
**Functional Requirements:**

- FR10 – Analytics Dashboard for Restaurant Owners

**Suggested Sprint:** Sprint 6

---

## EPIC 7 – Notifications & Real-time Updates

**Goal:** Keep customers informed and enhance engagement.  
**Functional Requirements:**

- FR7 – Customer Notifications and Reminders

**Suggested Sprint:** Sprint 4

---

# ⚡ Conflicts Between EPICs / Sprints

1. **Dependency Conflicts:**
    - EPIC 2 (Search) depends on EPIC 1 (User Authentication) for personalized search and suggestions.
    - EPIC 3 (Reservations) requires EPIC 1 (Authentication) and EPIC 2 (Restaurant Discovery) to be functional first.
    - EPIC 5 (Review Summarizer & Suggestions) depends on EPIC 9 (Reviews) from earlier sprints.

2. **Sprint Overlaps:**
    - Notifications (EPIC 7, Sprint 4) may overlap with Payment/Loyalty (EPIC 4, Sprint 4–5) due to confirmation triggers.
    - Advanced Search (EPIC 2, Sprint 2–3) and Auto-Suggestion (Sprint 2–3) must coordinate real-time API endpoints.

3. **Resource Conflicts:**
    - Sprint 1–2 may need more backend developers to implement Authentication + Admin management simultaneously.

---

# Proof of Concept (POC) – Sprint 1

**Objective:** Establish the foundation of the project by gathering requirements, setting up the backend, and creating the initial front page layout.

---

## Tasks Completed

### 1. Requirements & Elicitation

- Gathered all functional and non-functional requirements.
- Conducted stakeholder analysis and requirement elicitation sessions.
- Documented user stories, epics, and acceptance criteria.

### 2. Backend Setup

- Initialized Express/Node.js project.

### 3. Frontend (Initial Front Page)

- Designed the front page layout in Figma.
- Implemented basic static front page using Next.js.
