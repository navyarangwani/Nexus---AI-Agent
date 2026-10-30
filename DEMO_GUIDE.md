# 3-to-5 Minute Demo Video Script & Walkthrough Guide

> **Pre-Recorded Demo Ready**: A full, synchronized 1080p demo video with side-by-side in-depth explanatory dossier (no audio required) is ready to watch:
> - 🎬 **Google Drive Video**: [Nexus AI Research Agent - Full Demo Walkthrough](https://drive.google.com/file/d/17a8rnNIueVt4EJwHUpFUslNZuFBRrKLL/view?usp=drive_link)
> - **Interactive Local Player**: Open `demo_video/watch_demo.html` directly in any web browser.

Use this script to review the recorded walkthrough or to present the project live. The video covers the **system architecture**, **one happy path**, **one failure/edge case**, and the **evaluation harness**.

---

## Video Outline & Timing Breakdown

| Timestamp | Segment | Visual Screen | Key Talking Points |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:45** | Introduction & System Design | Browser at `http://localhost:8000` | State problem, introduce the production-minded agent architecture |
| **0:45 – 2:15** | Happy Path Demonstration | Research Glassbox Tab | Run Vector DB query, walk through DAG, tool calls, and citation badges |
| **2:15 – 3:30** | Failure & Edge Case Demo | Fault Sandbox Drawer | Inject Tool Timeout & Prompt Injection, show auto-recovery |
| **3:30 – 4:30** | Evaluation Studio & Baseline | Evals Studio Tab | Run 5-query benchmark live, show side-by-side LLM baseline |
| **4:30 – 5:00** | Production Tradeoffs & Wrap-Up | Design Decisions Modal | Summarize cost/latency tradeoffs and production roadmap |

---

## Detailed Step-by-Step Script

### [0:00 – 0:45] Introduction & System Architecture
- **Action:** Open `http://localhost:8000`. Show the header with "Nexus Research Agent - Production-Minded".
- **Spoken Script:**
  > *"Hi everyone! Today I'm presenting my submission for the Production-Oriented AI Research Agent assignment.*
  > 
  > *Rather than building a thin chat wrapper around an LLM, I built an end-to-end, production-grade agentic system from scratch. It is engineered with Python FastAPI and Pydantic v2 on the backend, streaming real-time telemetry over Server-Sent Events to a custom React Glassbox UI.*
  > 
  > *The system features four standout capabilities: real-time DAG orchestration tracking, automated noise and injection filtering, an autonomous Hallucination Judge with citation grounding, and an interactive Fault Injection Sandbox."*

---

### [0:45 – 2:15] Happy Path: Vector Databases for Startup RAG
- **Action:** Click the example chip **"Vector DBs for RAG"** (or type *"Compare the top 3 open-source vector databases for a startup building RAG products"*). Ensure *"Compare Direct LLM Baseline"* is checked. Click **"Research"**.
- **Visual:** Show the live execution DAG lighting up step-by-step:
  1. Planning & Intent Deconstruction (Step 01)
  2. Parallel Tool Execution (Step 02)
  3. Noise & Injection Filter (Step 03)
  4. Structured Synthesis (Step 04)
  5. Hallucination Judge (Step 05)
- **Spoken Script:**
  > *"Let's test the happy path. The agent accepts the user query and immediately deconstructs it into two parallel sub-tasks: technical architecture retrieval and empirical latency benchmarks.*
  > 
  > *Notice the DAG updating in real-time. The tools execute concurrently with latency timing. In step 3, our Information Filter screens the raw snippets—scoring relevance from 0.0 to 1.0, removing duplicates, and prioritizing authoritative documentation.*
  > 
  > *Here is our structured final response: we have an Executive Short Answer, followed by grounded Key Findings with explicit citation badges like [1] and [2].*
  > 
  > *If I hover over or click citation [1], you see an interactive tooltip showing the exact source snippet, domain, and relevance score, and it scrolls right to the verified source card!*
  > 
  > *Finally, our autonomous Hallucination Judge evaluated each claim against the retrieved evidence, confirming a 100% Faithfulness score."*

---

### [2:15 – 3:30] Failure & Edge Case: Fault Sandbox & Prompt Injection
- **Action:** Click the **"Fault Sandbox"** button in the top right.
  1. Toggle ON **"Simulate Tool Timeout & Network Drop"**.
  2. Toggle ON **"Simulate Adversarial Prompt Injection"**.
  3. Click **"Done"** (notice the red active indicator in the header).
  4. Now click the example chip **"Adversarial Test (Chaos)"** and click **"Research"**.
- **Visual:** Watch the agent execute:
  - Step 02 tool telemetry shows timeout recovery.
  - Step 03 filter flags the prompt injection payload: `Quarantined: Detected potential prompt injection attack pattern`.
  - Final answer safely refuses to leak credentials and issues honest audit disclosures.
- **Spoken Script:**
  > *"Now let's examine how the system behaves under failure conditions, which is crucial for production reliability.*
  > 
  > *I've opened our Fault Sandbox and simulated two critical failure modes: a downstream tool timeout and an adversarial prompt injection attack.*
  > 
  > *When I run the adversarial query, notice what happens in the inspector: the WebScraper and Information Filter detect the malicious injection tokens—quarantining the untrusted text with an explicit audit reason.*
  > 
  > *Furthermore, when the tool experienced a simulated network timeout, the tool registry executed exponential backoff retries and avoided cascading failure.*
  > 
  > *The system never crashes, never leaks confidential credentials, and gracefully reports a low-confidence assessment with transparent limitations."*

---

### [3:30 – 4:30] Evaluation Studio & Baseline Comparison
- **Action:** Click on the **"Evals Studio"** tab in the top navigation. Click the green button **"Run Benchmark Suite"**.
- **Visual:** Watch the 5 benchmark tests run and render:
  - 100% Pass Rate (5 / 5 passed)
  - 100% Average Faithfulness
  - Expand **EVAL-01** or **EVAL-05** to show the "What Worked Well" and "Failure Modes" breakdown.
- **Spoken Script:**
  > *"Next, let's look at the Evaluation Studio. As required by the assignment, I implemented an automated evaluation framework testing 5 distinct scenarios—from technical architecture to market landscape and adversarial security.*
  > 
  > *With one click, the test suite executes all 5 benchmarks. Every run evaluates plan validity, citation precision, faithfulness score, and latency SLAs.*
  > 
  > *We can also see the side-by-side A/B comparison against a direct zero-shot LLM. While a standard LLM hallucinated Pinecone as open-source and included US companies in an Indian SaaS query, our agentic system backed every single assertion with verified, traceable sources."*

---

### [4:30 – 5:00] Production Architecture & Conclusion
- **Action:** Click **"Design Decisions"** in the top navigation. Briefly show the 7 sections answering the prompt questions.
- **Spoken Script:**
  > *"To wrap up, every design decision—from handling bad tool results and schema auto-repair to cost vs latency tradeoffs—is thoroughly documented in the built-in guide and the repository README.*
  > 
  > *The code is fully tested with 11 unit tests, runs with zero configuration via start.bat, and is ready for production scaling. Thank you!"*
