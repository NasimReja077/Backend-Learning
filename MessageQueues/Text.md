# use -> redis-server

## How to Run EverythingOpen 4 terminals:Terminal 1: Redispowershell

- redis-server

## Terminal 2: Workerpowershell

- node worker.js

## Terminal 3: Dashboardpowershell

- node dashboard.js

## Terminal 4: Add Jobspowershell

- node producer.js

- Then open your browser:
http://localhost:3000/admin/queuesYou will see a beautiful dashboard to monitor all jobs.