# UX Flow Design

## User Journey Overview

1. **Landing/Authentication**
   - User visits application URL
   - Redirected to Azure AD login if not authenticated
   - Domain validation: Only users from client email domain can access
   - After successful login, redirected to questionnaire

2. **Welcome/Introduction Screen**
   - Brief explanation of questionnaire purpose
   - Estimated completion time (45-60 minutes)
   - Progress indicator (0% initially)
   - "Start Questionnaire" button
   - If returning user: "Resume" button with last section indicator

3. **Questionnaire Navigation**
   - Left sidebar (desktop) or top navigation (mobile):
     - List of all 10 sections
     - Visual indicators: Completed (✓), In Progress (•), Not Started (○)
     - Click to jump to any section
   - Main content area: Current section questions
   - Progress bar: Top of page, shows percent complete

4. **Section Flow**
   - Each section displays:
     - Section title and description
     - Estimated time for section
     - Questions in sequence
     - Helper text for each question
     - "Previous" and "Next" buttons
     - "Mark Section Complete" checkbox/button
   - Questions appear one at a time or grouped logically
   - Auto-save indicator: "Saving..." → "Saved" (top right)

5. **Question Types UI**
   - **Multiple Choice**: Radio buttons with clear labels
   - **Multiple Select**: Checkboxes
   - **Yes/No**: Toggle or radio buttons, with conditional follow-up appearing below
   - **Scale (1-5)**: Horizontal slider with labels at ends and middle
   - **Number Input**: Styled number input with validation
   - **Free Text**: Textarea with character count
   - **Date Picker**: Native date picker
   - **Percentage Sliders**: For Section 10, with sum validation (must equal 100%)

6. **Progress & Persistence**
   - Every field change triggers auto-save (debounced)
   - Progress bar updates in real-time
   - Section completion status updates immediately
   - User can close browser and return later - all progress saved

7. **Completion**
   - Final section (Section 10) includes "Submit Questionnaire" button
   - Validation: All required questions must be answered
   - Confirmation screen: "Thank you for completing the questionnaire"
   - Option to review/edit responses
   - Data is marked as complete in backend

## Responsive Design

### Desktop (>1024px)
- Sidebar navigation (fixed left)
- Main content area (scrollable)
- Progress bar (fixed top)
- Two-column layout for some question types

### Tablet (768px - 1024px)
- Collapsible sidebar (hamburger menu)
- Single column layout
- Touch-friendly controls

### Mobile (<768px)
- Full-width layout
- Bottom navigation for sections (swipeable)
- Large touch targets
- Simplified progress indicator

## Visual Design Principles

- **Professional & Calm**: Business-appropriate color scheme (blues, grays)
- **Non-technical**: Avoid technical jargon, use plain English
- **Clear Hierarchy**: Section titles, question labels, helper text clearly differentiated
- **Accessibility**: WCAG 2.1 AA compliant
- **Loading States**: Skeleton screens during data fetch
- **Error States**: Clear error messages, retry options

## Key Interactions

1. **Auto-save Feedback**
   - Subtle animation on save
   - "Saved" indicator appears briefly after save
   - Error state if save fails (with retry)

2. **Section Navigation**
   - Smooth scroll to section
   - Highlight current section in navigation
   - Breadcrumb showing current location

3. **Question Validation**
   - Inline validation on blur
   - Required fields marked with asterisk
   - Error messages appear below field

4. **Progress Calculation**
   - Real-time update as questions are answered
   - Visual progress bar with percentage
   - Estimated time remaining calculation

## Accessibility Features

- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators
- ARIA labels for all interactive elements
- Skip to content link

## Performance Considerations

- Lazy load sections (only load current + adjacent)
- Optimistic UI updates (update UI before server confirmation)
- Debounced auto-save (500ms)
- Client-side validation (reduce server round-trips)
- Progressive enhancement (works without JavaScript for basic flow)
