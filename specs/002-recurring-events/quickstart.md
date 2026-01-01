# Quickstart: Recurring Events

**Date**: 2024-12-30  
**Feature**: Recurring Events

## Test Scenarios

### Scenario 1: Create Daily Recurring Event

**Given** a user is authenticated  
**When** they create a recurring event with:
- Title: "Morning Standup"
- Start: 2024-01-15 09:00:00
- End: 2024-01-15 09:30:00
- Pattern: DAILY
- End Date: 2024-12-31

**Then**:
- Recurring event is created
- Event instances are generated for each day from 2024-01-15 to 2024-12-31
- Calendar view shows the event on every day in the date range
- Total instances: ~351 (depending on date range)

**API Call**:
```http
POST /calendar-events/recurring
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Morning Standup",
  "startDate": "2024-01-15T09:00:00Z",
  "endDate": "2024-01-15T09:30:00Z",
  "recurrencePattern": {
    "type": "DAILY",
    "interval": 1
  },
  "recurrenceEndDate": "2024-12-31T23:59:59Z",
  "noEndDate": false
}
```

---

### Scenario 2: Create Weekly Recurring Event with Specific Days

**Given** a user is authenticated  
**When** they create a recurring event with:
- Title: "Team Meetings"
- Start: 2024-01-15 10:00:00
- End: 2024-01-15 11:00:00
- Pattern: WEEKLY on Monday, Wednesday, Friday
- No end date

**Then**:
- Recurring event is created
- Event instances are generated for every Monday, Wednesday, and Friday
- Calendar view shows the event 3 times per week
- Instances generated up to 2 years ahead (default limit)

**API Call**:
```http
POST /calendar-events/recurring
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meetings",
  "startDate": "2024-01-15T10:00:00Z",
  "endDate": "2024-01-15T11:00:00Z",
  "recurrencePattern": {
    "type": "WEEKLY",
    "interval": 1,
    "daysOfWeek": [1, 3, 5]
  },
  "noEndDate": true
}
```

---

### Scenario 3: Edit Individual Instance

**Given** a user has a recurring weekly event  
**When** they edit one specific instance (e.g., 2024-01-17) to:
- Change time to 14:00:00 - 15:00:00
- Change title to "Team Meeting - Rescheduled"

**Then**:
- Only that instance is modified
- Other instances in the series remain unchanged
- Modified instance shows updated time and title
- `isModified` flag is set to true for that instance

**API Call (Update)**:
```http
PUT /calendar-events/recurring/1/instances/5
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting - Rescheduled",
  "startDate": "2024-01-17T14:00:00Z",
  "endDate": "2024-01-17T15:00:00Z"
}
```

**API Call (Delete)**:
```http
DELETE /calendar-events/recurring/1/instances/5
Authorization: Bearer <token>
```

---

### Scenario 4: Edit Entire Series

**Given** a user has a recurring weekly event  
**When** they edit the series to:
- Change time to 11:00:00 - 12:00:00
- Change pattern to only Monday and Wednesday

**Then**:
- All future instances are updated to new time
- Future instances follow new pattern (only Mon/Wed)
- Past instances remain unchanged
- Individually modified instances preserve their modifications

**API Call**:
```http
PUT /calendar-events/recurring/1/series
Authorization: Bearer <token>
Content-Type: application/json

{
  "startDate": "2024-01-15T11:00:00Z",
  "endDate": "2024-01-15T12:00:00Z",
  "recurrencePattern": {
    "type": "WEEKLY",
    "interval": 1,
    "daysOfWeek": [1, 3]
  }
}
```

---

### Scenario 5: Delete Individual Instance

**Given** a user has a recurring weekly event  
**When** they delete one specific instance (e.g., 2024-01-17)

**Then**:
- That instance is removed from calendar
- RecurrenceException is created for that date
- Other instances continue to appear
- No new instance is generated for that date

**API Call**:
```http
DELETE /calendar-events/recurring/1/instances/5
Authorization: Bearer <token>
```

---

### Scenario 6: Delete Entire Series

**Given** a user has a recurring weekly event  
**When** they delete the entire series with option "all"

**Then**:
- Recurring event is deleted
- All event instances are deleted
- All recurrence exceptions are deleted
- Calendar view no longer shows any instances

**API Call**:
```http
DELETE /calendar-events/recurring/1?deleteOption=all
Authorization: Bearer <token>
```

---

### Scenario 7: Delete Only Future Instances

**Given** a user has a recurring weekly event  
**When** they delete the series with option "future"

**Then**:
- Future instances are deleted
- Past instances remain visible
- Recurring event is updated (recurrenceEndDate set to today)
- No new instances are generated

**API Call**:
```http
DELETE /calendar-events/recurring/1?deleteOption=future
Authorization: Bearer <token>
```

---

### Scenario 8: Monthly Recurrence Edge Case

**Given** a user creates a monthly recurring event on the 31st  
**When** the system generates instances for February

**Then**:
- February instance appears on February 28th (or 29th in leap year)
- Other months show instance on the 31st
- rrule library handles this automatically

**API Call**:
```http
POST /calendar-events/recurring
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Monthly Review",
  "startDate": "2024-01-31T10:00:00Z",
  "endDate": "2024-01-31T11:00:00Z",
  "recurrencePattern": {
    "type": "MONTHLY",
    "interval": 1
  },
  "recurrenceEndDate": "2024-12-31T23:59:59Z"
}
```

---

### Scenario 9: View Calendar with Recurring Events

**Given** a user has multiple recurring events (daily, weekly, monthly)  
**When** they view the calendar for a specific week

**Then**:
- All instances for that week are displayed
- Daily events appear every day
- Weekly events appear on their scheduled days
- Monthly events appear if the week contains the scheduled day
- Instances are visually distinguishable (e.g., recurring icon/indicator)

**API Call**:
```http
GET /calendar-events?startDate=2024-01-15&endDate=2024-01-21
Authorization: Bearer <token>
```

**Expected Response**: Array of event instances (generated from recurring events) for the date range

---

### Scenario 10: Modify Instance Then Edit Series

**Given** a user has modified an individual instance  
**When** they edit the entire series

**Then**:
- Modified instance preserves its individual changes
- Other instances are updated according to series changes
- Modified instance's `isModified` flag remains true
- Override fields (titleOverride, etc.) are preserved

**Steps**:
1. Create recurring event
2. Modify one instance (change time)
3. Edit series (change pattern)
4. Verify modified instance keeps its changes

