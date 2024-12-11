# WorldSmart Dashboard
## Project Overview
I used to work for a company named WorldSmart. They use Zendesk as a ticketing system for their customers. This dashboard uses the Zendesk API to build an overview of current stats of tickets and support agents.
## Features
- List of agents
    - Shows a progress bar based on how far they are into their shift.
    - Progress bar changes colour based on how on track they are to meet a ticket closure goal, if they continued the way they are now for their entire shift they would reach: under 9 tickets = red, 9-11 tickets = yellow, 12+ tickets = green and 24+ tickets = blue.
    - Each state (in Australia, some are combined as they fall under the same duristiction for the business) has its own card views for New (unassigned), Open, Urgent and Solved (closed) tickets at any given time.
    - Each state also has a clock above the state to show what time it is in any given state, dynamically updating with daylight savings causing mixed states to split to different times.
    - Superuser password at the top that updates everyday that allows us to login into any customers system, copies upon clicking.
    - Voicemails button that updates whenever a voicemail ticket comes through, causing the bar at the top to flash red (these require immediate action).
    - Ability to place any agent on sick leave (resets each day), which will grey their bar out and show a sick emoji.
    - Ability to add annual leave for any agent, showing a plane emoji next to their name.
    - Annual Leave view, to show any upcoming leave for agents.
## Screenshots
![image](https://github.com/user-attachments/assets/ee3be907-a0f7-446a-bb7e-cafb1c9633ad)
## Disclaimer/Information
This repository serves as a demo and has certain features removed with dummy data put in as a placeholder.
This is used by the company to this day.
## Licence
There is no Licence for this project, meaning you cannot use this commercially.
If you wish to use this code please contact me via Discord or Email, found on my profile, thanks.
