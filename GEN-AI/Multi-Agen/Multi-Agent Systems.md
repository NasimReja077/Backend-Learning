# Multi-Agent Systems (MAS) - Study Guide & Simple MERN Project

## 1. What are Multi-Agent Systems?

A **Multi-Agent System (MAS)** is a system composed of multiple interacting intelligent agents.  
Each agent is an autonomous entity that can:
- Perceive its environment
- Make decisions
- Act to achieve its own goals
- Communicate and coordinate with other agents

### Key Characteristics of Agents
| Characteristic       | Description                                      |
|----------------------|--------------------------------------------------|
| Autonomy             | Operates without direct human intervention       |
| Social Ability       | Communicates with other agents                   |
| Reactivity           | Responds to changes in the environment           |
| Pro-activeness       | Takes initiative to achieve goals                |

### Types of Agents
- **Reactive Agents**: Respond directly to stimuli (simple)
- **Deliberative Agents**: Plan and reason before acting
- **Hybrid Agents**: Combination of both
- **Collaborative / Competitive Agents**

### Common Architectures
- **Belief-Desire-Intention (BDI)**
- **Contract Net Protocol** (task allocation)
- **Blackboard Architecture**
- **Peer-to-Peer / Hierarchical**

### Communication
Agents usually communicate using:
- Message Passing
- Shared Environment / Blackboard
- ACL (Agent Communication Language) – e.g., FIPA-ACL

---

## 2. Simple Multi-Agent Systems Project (MERN Stack)

### Project Idea: **Smart Task Allocation System**

We will build a simple system where **three agents** collaborate to manage tasks:

| Agent              | Role                                      | Responsibility                     |
|--------------------|-------------------------------------------|------------------------------------|
| **Manager Agent**  | Central coordinator                       | Receives tasks and assigns them    |
| **Worker Agent**   | Task executor                             | Performs the assigned tasks        |
| **Monitor Agent**  | Supervisor                                | Tracks progress and reports status |

### Tech Stack (MERN)
- **MongoDB** → Store tasks, agents status, messages
- **Express + Node.js** → Backend + Agent logic
- **React** → Simple dashboard to create tasks and view agent activity
- **Socket.io** (optional but recommended) → Real-time communication between agents

---

### Project Structure


multi-agent-mern/
├── backend/
│   ├── models/
│   │   ├── Task.js
│   │   └── Agent.js
│   ├── agents/
│   │   ├── ManagerAgent.js
│   │   ├── WorkerAgent.js
│   │   └── MonitorAgent.js
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.jsx
│   │   │   ├── AgentStatus.jsx
│   │   │   └── TaskList.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

### Core Concepts Implemented

1. **Autonomy**  
   Each agent runs independently (can be separate Node processes or modules).

2. **Communication**  
   Agents communicate via:
   - MongoDB (shared state)
   - Socket.io events (real-time)

3. **Coordination**  
   Manager Agent uses a simple Contract Net style:
   - Announces task
   - Workers bid (based on load)
   - Manager assigns the task

4. **Reactivity**  
   Monitor Agent continuously watches task status and notifies when completed or delayed.

---

### Simple Agent Logic (Pseudocode)

#### Manager Agent
```js
class ManagerAgent {
  receiveTask(task) {
    const availableWorkers = getAvailableWorkers();
    const bestWorker = selectBestWorker(availableWorkers);
    assignTask(bestWorker, task);
    notifyMonitor("Task assigned");
  }
}
```

#### Worker Agent
```js
class WorkerAgent {
  constructor(id) {
    this.id = id;
    this.load = 0;
  }

  bid(task) {
    return this.load < 3; // simple capacity check
  }

  executeTask(task) {
    this.load++;
    // simulate work
    setTimeout(() => {
      completeTask(task);
      this.load--;
    }, 3000);
  }
}
```

#### Monitor Agent
```js
class MonitorAgent {
  watch() {
    setInterval(() => {
      const delayedTasks = findDelayedTasks();
      if (delayedTasks.length > 0) {
        alertManager(delayedTasks);
      }
    }, 5000);
  }
}
```

---

### How to Run the Project (High Level)

1. Start MongoDB
2. `cd backend` → `npm install` → `node server.js`
3. `cd frontend` → `npm install` → `npm run dev`
4. Open the React dashboard
5. Create a new task → Watch agents interact in real-time

---

### Learning Outcomes

By completing this project you will understand:

- How multiple autonomous agents can work together
- Basic coordination and communication patterns
- How to implement agents in a real web application (MERN)
- Difference between centralized and decentralized control
- Real-time multi-agent interaction using Socket.io

---

### Possible Extensions (After Basic Version)

- Add more specialized agents (Priority Agent, Notification Agent)
- Implement FIPA-ACL style messages
- Add machine learning for better task assignment
- Make agents run as separate microservices
- Add negotiation between agents

---