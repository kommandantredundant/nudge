# Nudge - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Modular Structure](#modular-structure)
3. [API Endpoints](#api-endpoints)
4. [Components](#components)
5. [Custom Hooks](#custom-hooks)
6. [Context Providers](#context-providers)
7. [Services](#services)
8. [Utility Functions](#utility-functions)
9. [Development Guidelines](#development-guidelines)
10. [Migration from Monolithic to Modular](#migration-from-monolithic-to-modular)

## Architecture Overview

Nudge follows a layered architecture pattern with clear separation of concerns:

UI Components
- Custom Hooks
- Context Providers
- Services Layer
- Utility Functions
- Express Server

### Key Architectural Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Dependency Inversion**: Higher layers depend on abstractions, not concretions
3. **Single Responsibility**: Each module has one reason to change
4. **Open/Closed Principle**: Modules are open for extension but closed for modification
5. **Dependency Injection**: Dependencies are provided rather than created internally

## Modular Structure

### Directory Breakdown

src/
- components/ - UI Components
  - common/ - Reusable components (Button.jsx, Input.jsx)
  - contacts/ - Contact-specific components (ContactCard.jsx)
  - layout/ - Layout components (Header.jsx)
- context/ - React Context providers (AppContext.jsx, ThemeContext.jsx)
- hooks/ - Custom hooks (useContacts.js, useSettings.js, useNotifications.js)
- services/ - API and external services (api.js, notifications.js)
- styles/ - CSS and styling (globals.css, variables.css)
- utils/ - Utility functions (contactUtils.js, dateUtils.js)
- App.jsx - Main application component
- index.js - Application entry point

## API Endpoints

The application uses a RESTful API with both new modular endpoints and legacy endpoints for backward compatibility.

### Contacts API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/contacts | Retrieve all contacts | - | Array of contacts |
| POST | /api/contacts | Create a new contact | Contact object | Created contact |
| PUT | /api/contacts/:id | Update a contact | Updated contact object | Updated contact |
| DELETE | /api/contacts/:id | Delete a contact | - | Success confirmation |

### Circles API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/circles | Retrieve all circles | - | Array of circles |
| PUT | /api/circles/:id | Update a circle | Updated circle object | Updated circle |

### Settings API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/settings | Retrieve settings | - | Settings object |
| PUT | /api/settings | Update settings | Updated settings object | Updated settings |

### Legacy API (Backward Compatibility)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/data | Retrieve all data | - | Complete data object |
| POST | /api/data | Save all data | Complete data object | Success confirmation |

### Notifications API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | /api/notifications/test | Test notification | Notification config | Success confirmation |

## Components

### Common Components

#### Button Component (src/components/common/Button.jsx)

A reusable button component with multiple variants and sizes.

**Props:**
- variant: 'primary', 'secondary', 'success', 'danger'
- size: 'sm', 'md', 'lg'
- loading: Boolean for loading state
- disabled: Boolean for disabled state
- onClick: Click handler function
- children: Button content

#### Input Component (src/components/common/Input.jsx)

A reusable input component with validation support.

**Props:**
- type: Input type (text, email, tel, etc.)
- label: Input label
- value: Input value
- onChange: Change handler
- error: Error message
- placeholder: Placeholder text
- required: Boolean for required field

### Layout Components

#### Header Component (src/components/layout/Header.jsx)

The main application header with navigation and settings.

**Props:**
- onSettingsToggle: Function to toggle settings panel
- showSettings: Boolean indicating if settings is visible

### Contact Components

#### ContactCard Component (src/components/contacts/ContactCard.jsx)

Displays a contact with their information and action buttons.

**Props:**
- contact: Contact object
- circle: Circle object
- onDelete: Delete handler function
- onMarkContacted: Mark contacted handler
- isRemoving: Boolean for removal state

## Custom Hooks

### useContacts Hook (src/hooks/useContacts.js)

Manages all contact-related operations and state.

**Returns:**
- contacts: Array of contacts
- circles: Array of circles
- loading: Boolean loading state
- error: Error object
- addContact: Function to add a contact
- updateContact: Function to update a contact
- deleteContact: Function to delete a contact
- markContacted: Function to mark contact as contacted
- getContactsInCircle: Function to get contacts by circle
- getFormattedContacts: Function to get formatted contacts for display
- overdueContacts: Array of overdue contacts
- birthdayContacts: Array of contacts with birthdays today
- contactCounts: Object with contact counts by circle

### useSettings Hook (src/hooks/useSettings.js)

Manages application settings and preferences.

**Returns:**
- settings: Settings object
- notificationTimes: Array of notification times
- theme: Current theme
- lastCheck: Last check timestamp
- updateSettings: Function to update settings
- addNotificationTime: Function to add notification time
- updateNotificationTime: Function to update notification time
- removeNotificationTime: Function to remove notification time
- updateTheme: Function to update theme

### useNotifications Hook (src/hooks/useNotifications.js)

Manages browser notifications and permissions.

**Returns:**
- notificationPermission: Current permission status
- requestPermission: Function to request notification permission
- checkAndNotify: Function to check and send notifications
- canSendNotifications: Boolean indicating if notifications can be sent

## Context Providers

### AppContext (src/context/AppContext.jsx)

Central state management for the application.

**State:**
- contacts: Array of contacts
- circles: Array of circles
- settings: Application settings
- loading: Boolean loading state
- error: Error object
- notificationPermission: Notification permission status

**Methods:**
- loadData: Load initial data
- saveData: Save data to storage
- addContact: Add a new contact
- updateContact: Update existing contact
- deleteContact: Delete a contact
- markContacted: Mark contact as contacted
- updateCircle: Update circle configuration
- updateSettings: Update application settings
- requestNotificationPermission: Request notification permission
- checkAndNotify: Check and send notifications

### ThemeContext (src/context/ThemeContext.jsx)

Manages application theme and appearance.

**State:**
- currentTheme: Current theme ('light', 'dark', 'auto')
- setTheme: Function to set theme

## Services

### API Service (src/services/api.js)

Handles all HTTP requests to the backend API.

**Methods:**
- getContacts(): Fetch all contacts
- createContact(data): Create new contact
- updateContact(id, data): Update contact
- deleteContact(id): Delete contact
- getCircles(): Fetch all circles
- updateCircle(id, data): Update circle
- getSettings(): Fetch settings
- updateSettings(data): Update settings
- getData(): Fetch all data (legacy)
- saveData(data): Save all data (legacy)
- testNotification(config): Test notification

### Notification Service (src/services/notifications.js)

Manages browser notifications and scheduling.

**Methods:**
- checkPermission(): Check notification permission
- requestPermission(): Request notification permission
- showNotification(title, options): Show notification
- checkAndNotify(contacts, circles, settings): Check and send notifications
- schedulePeriodicCheck(checkFunction): Schedule periodic checks

## Utility Functions

### Contact Utils (src/utils/contactUtils.js)

Utility functions for contact management.

**Functions:**
- isOverdue(contact, circles): Check if contact is overdue
- getOverdueContacts(contacts, circles): Get overdue contacts
- getBirthdayContacts(contacts): Get contacts with birthdays today
- getContactsByCircle(contacts, circleId): Get contacts by circle
- getCircleById(circles, circleId): Get circle by ID
- validateContact(contact): Validate contact data
- formatContactForDisplay(contact, circles): Format contact for display
- sortContacts(contacts, sortBy, sortOrder): Sort contacts
- filterContactsBySearch(contacts, searchTerm): Filter contacts by search
- getDefaultCircles(): Get default circle configuration

### Date Utils (src/utils/dateUtils.js)

Utility functions for date manipulation.

**Functions:**
- getDaysSince(date): Get days since a date
- isBirthdayToday(birthday): Check if birthday is today
- getAge(birthday): Calculate age from birthday
- formatBirthday(birthday): Format birthday for display
- getRelativeTimeString(date): Get relative time string

## Development Guidelines

### Code Style

1. **Component Structure**: Follow the standard React component structure with imports, component definition, state/effects, event handlers, and render method.

2. **Naming Conventions**:
   - Components: PascalCase
   - Functions/Variables: camelCase
   - Constants: UPPER_SNAKE_CASE
   - Files: PascalCase for components, camelCase for utilities

3. **File Organization**:
   - Group related files in directories
   - Keep components focused on single responsibility
   - Separate business logic from UI components

### Best Practices

1. **State Management**:
   - Use React Context for global state
   - Keep local state in components when possible
   - Use custom hooks for complex state logic

2. **Error Handling**:
   - Implement proper error boundaries
   - Provide meaningful error messages
   - Handle API errors gracefully

3. **Performance**:
   - Use React.memo for expensive components
   - Implement proper loading states
   - Optimize re-renders with useCallback and useMemo

4. **Testing**:
   - Write unit tests for utility functions
   - Test components with React Testing Library
   - Mock API calls in tests

### Git Workflow

1. **Branch Naming**:
   - feature/feature-name for new features
   - bugfix/bug-description for bug fixes
   - refactor/refactor-description for refactoring

2. **Commit Messages**:
   - Use conventional commit format
   - type(scope): description
   - Examples: feat(contacts): add birthday notifications

3. **Pull Requests**:
   - Provide clear description of changes
   - Include screenshots for UI changes
   - Ensure all tests pass

## Migration from Monolithic to Modular

### Before (Monolithic)

The original application had all functionality in a single large component with:
- All state management in one place
- Business logic mixed with UI
- Direct API calls in components
- Large render methods with everything
- Tight coupling between different concerns

### After (Modular)

The refactored application follows a modular structure with:
- Separation of UI and business logic
- Custom hooks for state management
- Service layer for API calls
- Reusable components
- Context providers for global state
- Utility functions for pure logic

### Benefits of the Modular Approach

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Business logic can be tested independently
3. **Reusability**: Components and hooks can be reused
4. **Scalability**: New features can be added without affecting existing code
5. **Developer Experience**: Easier to understand and modify

### Migration Steps

1. **Extract Business Logic**: Move business logic from components to hooks
2. **Create Reusable Components**: Break down UI into reusable components
3. **Implement Context**: Use React Context for global state management
4. **Create Service Layer**: Abstract API calls into service modules
5. **Add Utility Functions**: Extract pure functions to utility modules
6. **Refactor Components**: Simplify components to focus on UI only

This modular architecture provides a solid foundation for future development and makes the application more maintainable and scalable.