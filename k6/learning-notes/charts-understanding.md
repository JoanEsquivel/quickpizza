# K6 Dashboard Comprehensive Understanding Guide

The K6 dashboard provides three main tabs to analyze load test results. Each tab offers different perspectives on your test performance, helping you identify bottlenecks, performance issues, and system behavior under load.

## Dashboard Tabs Overview

1. **Overview** - High-level performance metrics and trends
2. **Timings** - Detailed timing breakdown of HTTP requests
3. **Summary** - Statistical summary of all metrics

## Understanding Percentiles (p90, p95, p99)

Percentiles are crucial statistical measures that help you understand the distribution of your performance data. They tell you what percentage of your users experience a certain response time or better.

### What Percentiles Mean:

- **p90 (90th percentile)**: 90% of all requests were faster than this value, 10% were slower
- **p95 (95th percentile)**: 95% of all requests were faster than this value, 5% were slower  
- **p99 (99th percentile)**: 99% of all requests were faster than this value, 1% were slower

### Practical Example:
If your p95 response time is 500ms, it means:
- 95% of your users experienced response times of 500ms or faster
- Only 5% of users experienced slower response times than 500ms

### Why Percentiles Matter:
- **Average** can be misleading due to outliers
- **p95** represents the experience of most users (good target for SLAs)
- **p99** captures worst-case scenarios that affect user satisfaction
- Higher percentiles help identify performance outliers and edge cases

### Key Terms Explained:
- **TTFB (Time To First Byte)**: How long before the server starts sending response data
- **Virtual Users (VUs)**: Simulated users running your test script concurrently
- **Iteration**: One complete execution of your test script by a virtual user
- **SLA (Service Level Agreement)**: Performance targets you commit to meet
- **Connection Pool**: Reusable network connections to improve efficiency
- **SSL/TLS Handshake**: Security negotiation process for HTTPS connections

---

# 1. OVERVIEW TAB

The Overview tab provides a high-level view of your test's performance with key metrics and visual charts showing trends over time.

## Key Metrics Display

### Core Performance Indicators

- **Iteration Rate**: Number of complete test iterations per second
  - *An iteration is one complete run of your test script (e.g., login → browse → purchase → logout)*
- **HTTP Request Rate**: Number of HTTP requests per second  
  - *Total throughput your system is handling during the test*
- **HTTP Request Duration**: Average response time for HTTP requests
  - *How long users wait for pages/APIs to respond*
- **HTTP Request Failed**: Percentage of failed HTTP requests
  - *System reliability indicator - errors, timeouts, 5xx responses*
- **Received Rate**: Data received from server per second
  - *Download bandwidth usage - responses, images, files*
- **Sent Rate**: Data sent to server per second
  - *Upload bandwidth usage - form data, file uploads, API payloads*

## Charts in Overview Tab

### 1. HTTP Performance Overview Chart
- **X-axis**: Timeline of test execution *(when things happened during your test)*
- **Y-axis**: Dual scale (percentage for failure rate, rate for requests)
- **Lines**: 
  - **Request Rate** *(requests/second)* - How many HTTP requests your test is sending per second
  - **Request Duration** *(milliseconds)* - How long each HTTP request takes to complete
  - **Request Failed Rate** *(percentage)* - What percentage of requests are failing (errors, timeouts)
- **What it shows**: Overall HTTP performance trends, correlation between load, response times, and error rates

### 2. Virtual Users (VUs) Chart
- **X-axis**: Timeline of test execution *(when things happened during your test)*
- **Y-axis**: Number count *(how many of something)*
- **Lines**:
  - **Active Virtual Users (VUs)** - How many simulated users are running your test script right now
  - **HTTP Requests count** - Total number of HTTP requests made so far
- **What it shows**: Load generation patterns and the relationship between virtual users and actual request volume

### 3. Transfer Rate Chart
- **X-axis**: Timeline of test execution *(when things happened during your test)*
- **Y-axis**: Data transfer rate (KB/s) *(kilobytes per second)*
- **Lines**:
  - **Data Received rate** - How much data per second your test is downloading from the server
  - **Data Sent rate** - How much data per second your test is uploading to the server
- **What it shows**: Network bandwidth utilization and data flow patterns between client and server

### 4. HTTP Request Duration Chart
- **X-axis**: Timeline of test execution *(when things happened during your test)*
- **Y-axis**: Response time (milliseconds) *(how long requests take to complete)*
- **Lines**:
  - **Average (avg)** - The typical response time across all requests
  - **90th percentile (p90)** - 90% of requests were faster than this time
  - **95th percentile (p95)** - 95% of requests were faster than this time
  - **99th percentile (p99)** - 99% of requests were faster than this time
- **What it shows**: Response time distribution across different user experience levels, helping identify performance consistency and outliers

### 5. Iteration Duration Chart
- **X-axis**: Timeline of test execution *(when things happened during your test)*
- **Y-axis**: Duration (seconds) *(how long each complete test scenario takes)*
- **Lines**:
  - **Average iteration time** - Typical time to complete one full test scenario
  - **90th percentile (p90)** - 90% of test scenarios completed faster than this time
  - **95th percentile (p95)** - 95% of test scenarios completed faster than this time  
  - **99th percentile (p99)** - 99% of test scenarios completed faster than this time
- **What it shows**: Complete test scenario execution time distribution, including all requests, think time, and processing within each iteration

## Overview Tab Decision Table

| Metric | Good Range | Warning Range | Critical Range | Action Required |
|--------|------------|---------------|----------------|-----------------|
| **HTTP Request Duration (avg)** | < 200ms | 200ms - 1s | > 1s | Optimize backend, check database queries, review caching |
| **HTTP Request Failed Rate** | 0% - 0.1% | 0.1% - 1% | > 1% | Check error logs, verify endpoint availability, review rate limits |
| **Request Rate** | Matches expected load | 10-20% below target | > 20% below target | Check VU configuration, verify network capacity, review test script |
| **Data Transfer Rate** | Consistent with content size | Fluctuating patterns | Extremely high/low | Review payload sizes, check compression, verify content delivery |
| **P95 Response Time** | < 500ms | 500ms - 2s | > 2s | Performance tuning needed, check slow queries, review infrastructure |
| **P99 Response Time** | < 1s | 1s - 5s | > 5s | Critical performance issues, investigate outliers, check resource constraints |

### Scenario-Based Actions

| Scenario | Symptoms | Root Cause Analysis | Recommended Actions |
|----------|----------|---------------------|---------------------|
| **High Load, Good Performance** | Low response times, 0% errors, stable rates | System handling load well | Continue testing, gradually increase load |
| **Degrading Performance** | Increasing response times, stable error rate | Resource saturation beginning | Monitor resource usage, prepare for scaling |
| **Error Spike** | Sudden increase in failed requests | Service overload or dependency failure | Check logs, verify dependencies, implement circuit breakers |
| **Inconsistent Performance** | Fluctuating response times | Resource contention or GC issues | Profile application, check memory usage, review algorithms |

---

# 2. TIMINGS TAB

The Timings tab provides detailed breakdown of HTTP request lifecycle, showing where time is spent during each phase of the request-response cycle.

## HTTP Request Lifecycle Phases

Understanding the timing phases helps identify exactly where performance bottlenecks occur:

1. **Blocked** → Waiting for available connection
2. **Connecting** → Establishing TCP connection  
3. **TLS Handshaking** → Securing the connection (HTTPS only)
4. **Sending** → Uploading request data
5. **Waiting** → Server processing time (TTFB - Time To First Byte)
6. **Receiving** → Downloading response data

*Total Duration = Blocked + Connecting + TLS + Sending + Waiting + Receiving*

## Charts in Timings Tab

### 1. Request Duration
- **Purpose**: Overall HTTP request time from start to finish
- **X-axis**: Timeline
- **Y-axis**: Duration (milliseconds)
- **Lines**: avg, p90, p95, p99
- **What it shows**: Total time for complete HTTP request/response cycle

### 2. Request Failed Rate
- **Purpose**: Percentage of HTTP requests that failed
- **X-axis**: Timeline
- **Y-axis**: Failure rate (percentage)
- **Lines**: HTTP request failure percentage
- **What it shows**: System reliability and error trends

### 3. Request Rate
- **Purpose**: Number of HTTP requests per second *(how busy your test is)*
- **X-axis**: Timeline *(when during the test)*
- **Y-axis**: Requests per second *(how many HTTP calls per second)*
- **Lines**: HTTP requests rate
- **What it shows**: Load intensity and throughput *(how much traffic your system is handling)*

### 4. Request Waiting
- **Purpose**: Time spent waiting for server response *(TTFB - Time To First Byte)*
  - *This is how long your server takes to start responding after receiving a request*
- **X-axis**: Timeline *(when during the test)*
- **Y-axis**: Duration (milliseconds) *(waiting time)*
- **Lines**: avg, p90, p95, p99 *(different percentile measurements)*
- **What it shows**: Server processing time and backend performance *(how fast your server processes requests)*

### 5. TLS Handshaking
- **Purpose**: Time spent establishing secure connection *(for HTTPS websites)*
  - *This is the "handshake" process to set up encrypted communication*
- **X-axis**: Timeline *(when during the test)*
- **Y-axis**: Duration (milliseconds) *(handshake time)*
- **Lines**: avg, p90, p95, p99 *(different percentile measurements)*
- **What it shows**: SSL/TLS negotiation overhead *(extra time needed for security)*

### 6. Request Sending
- **Purpose**: Time spent sending request data to server *(uploading your request)*
  - *How long it takes to send your request data (forms, files, API calls) to the server*
- **X-axis**: Timeline *(when during the test)*
- **Y-axis**: Duration (microseconds/milliseconds) *(upload time)*
- **Lines**: avg, p90, p95, p99 *(different percentile measurements)*
- **What it shows**: Upload bandwidth and network latency *(your internet upload speed and connection quality)*

### 7. Request Connecting
- **Purpose**: Time spent establishing TCP connection *(making initial connection to server)*
  - *This is like "dialing" the server before you can send any data*
- **X-axis**: Timeline *(when during the test)*
- **Y-axis**: Duration (milliseconds) *(connection time)*
- **Lines**: avg, p90, p95, p99 *(different percentile measurements)*
- **What it shows**: Network connectivity and connection pooling efficiency *(how fast you can connect and if connections are being reused)*

### 8. Request Receiving
- **Purpose**: Time spent downloading response data *(getting the server's response)*
  - *How long it takes to download the server's response (web pages, JSON data, files)*
- **X-axis**: Timeline *(when during the test)*
- **Y-axis**: Duration (milliseconds) *(download time)*
- **Lines**: avg, p90, p95, p99 *(different percentile measurements)*
- **What it shows**: Download bandwidth and response size impact *(your internet download speed and how big the responses are)*

### 9. Request Blocked
- **Purpose**: Time spent waiting for available connection *(waiting in line to connect)*
  - *When all connections are busy, new requests must wait for one to become available*
- **X-axis**: Timeline *(when during the test)*
- **Y-axis**: Duration (milliseconds) *(waiting time)*
- **Lines**: avg, p90, p95, p99 *(different percentile measurements)*
- **What it shows**: Connection pool saturation and resource constraints *(if your system is running out of available connections)*

## Timings Tab Decision Table

| Metric | Good Range | Warning Range | Critical Range | Root Cause | Action Required |
|--------|------------|---------------|----------------|------------|-----------------|
| **Request Duration** | < 500ms | 500ms - 2s | > 2s | Overall performance | End-to-end optimization needed |
| **Request Waiting (TTFB)** | < 200ms | 200ms - 1s | > 1s | Server processing | Optimize backend, database, caching |
| **Request Connecting** | < 10ms | 10ms - 100ms | > 100ms | Network/DNS issues | Check network, DNS resolution, connection pooling |
| **Request Sending** | < 10ms | 10ms - 50ms | > 50ms | Upload bandwidth | Check network capacity, reduce payload size |
| **Request Receiving** | < 50ms | 50ms - 200ms | > 200ms | Download bandwidth | Optimize response size, enable compression |
| **Request Blocked** | < 1ms | 1ms - 10ms | > 10ms | Connection limits | Increase connection pool, optimize keep-alive |
| **TLS Handshaking** | < 50ms | 50ms - 200ms | > 200ms | SSL performance | Optimize TLS configuration, use session resumption |

### Timing Analysis Scenarios

| Scenario | Pattern | Diagnosis | Solution |
|----------|---------|-----------|----------|
| **High Waiting Time** | Request waiting >> other phases | Backend bottleneck | Database optimization, caching, code profiling |
| **High Connecting Time** | Request connecting consistently high | Network/DNS issues | DNS optimization, connection pooling, CDN |
| **High Blocked Time** | Request blocked increasing over time | Connection exhaustion | Increase max connections, optimize connection reuse |
| **High Receiving Time** | Request receiving >> request size | Bandwidth limitation | Compress responses, optimize payload, CDN |
| **Consistent TLS Time** | TLS handshaking constant and high | SSL overhead | Session resumption, certificate optimization |

---

# 3. SUMMARY TAB

The Summary tab provides statistical summaries of all metrics collected during the test, organized into different metric types with comprehensive percentile distributions.

## Metric Categories

### Timing Metrics (Histograms)
Statistical distribution showing min, max, average, median, and percentiles (p90, p95, p99) for timing-related metrics.

#### Key Timing Metrics:

**http_req_blocked**
- **Definition**: Time spent waiting for an available connection
- **Indicates**: Connection pool efficiency and resource availability

**http_req_connecting**
- **Definition**: Time spent establishing TCP connection
- **Indicates**: Network latency and connection establishment overhead

**http_req_duration**
- **Definition**: Total request time (sending + waiting + receiving)
- **Indicates**: Overall request performance

**http_req_receiving**
- **Definition**: Time spent downloading response
- **Indicates**: Network bandwidth and response size efficiency

**http_req_sending**
- **Definition**: Time spent uploading request
- **Indicates**: Upload bandwidth and request size efficiency

**http_req_tls_handshaking**
- **Definition**: Time spent in TLS handshake
- **Indicates**: SSL/TLS configuration efficiency

**http_req_waiting**
- **Definition**: Time waiting for server response (TTFB)
- **Indicates**: Server processing performance

**iteration_duration**
- **Definition**: Time for complete test iteration
- **Indicates**: Overall test script performance

### Counter Metrics
Cumulative values that increase throughout the test.

**data_received**
- **Count**: Total bytes received from server
- **Rate**: Bytes per second received

**data_sent**
- **Count**: Total bytes sent to server
- **Rate**: Bytes per second sent

**http_reqs**
- **Count**: Total HTTP requests made
- **Rate**: HTTP requests per second

**iterations**
- **Count**: Total test iterations completed
- **Rate**: Iterations per second

### Rate Metrics
Percentage-based metrics showing success/failure rates.

**checks**
- **Definition**: Percentage of successful check assertions
- **Indicates**: Test validation success rate

**http_req_failed**
- **Definition**: Percentage of failed HTTP requests
- **Indicates**: System reliability and error rate

### Gauge Metrics
Point-in-time values that can increase or decrease.

**vus**
- **Definition**: Current number of active virtual users
- **Indicates**: Current load level

**vus_max**
- **Definition**: Maximum virtual users configured
- **Indicates**: Peak load capacity

## Summary Tab Analysis Tables

### Timing Metrics Analysis

| Metric | Excellent | Good | Acceptable | Poor | Critical | Action Required |
|--------|-----------|------|------------|------|----------|-----------------|
| **http_req_duration (avg)** | < 100ms | 100-300ms | 300-800ms | 800ms-2s | > 2s | Performance optimization critical |
| **http_req_duration (p95)** | < 200ms | 200-500ms | 500ms-1.5s | 1.5s-3s | > 3s | Address performance outliers |
| **http_req_duration (p99)** | < 500ms | 500ms-1s | 1s-3s | 3s-5s | > 5s | Critical performance tuning needed |
| **http_req_waiting (avg)** | < 50ms | 50-150ms | 150-400ms | 400ms-1s | > 1s | Backend optimization required |
| **http_req_blocked (p95)** | < 1ms | 1-5ms | 5-20ms | 20-100ms | > 100ms | Connection pool tuning needed |
| **http_req_connecting (p95)** | < 5ms | 5-20ms | 20-100ms | 100-300ms | > 300ms | Network/DNS optimization required |

### Counter Metrics Analysis

| Metric | Analysis Focus | Good Indicators | Warning Signs | Action Required |
|--------|----------------|-----------------|---------------|-----------------|
| **http_reqs rate** | Throughput achievement | Matches target load | < 80% of target | Increase VUs, check bottlenecks |
| **data_received rate** | Bandwidth utilization | Consistent with response size | Unusually high/low | Review response optimization |
| **data_sent rate** | Upload efficiency | Appropriate for request size | Excessive for request type | Optimize request payloads |
| **iterations rate** | Test execution efficiency | Matches expected iteration time | Significantly below target | Review test script performance |

### Rate Metrics Analysis

| Metric | Target | Warning Threshold | Critical Threshold | Immediate Actions |
|--------|--------|------------------|-------------------|-------------------|
| **checks** | 100% | < 99% | < 95% | Review test assertions, fix failing validations |
| **http_req_failed** | 0% | > 0.1% | > 1% | Investigate errors, check system capacity |

### Performance Percentile Interpretation

| Percentile | Meaning | Use Case | Action Threshold |
|------------|---------|----------|------------------|
| **Average** | Typical user experience | General performance baseline | > 300ms for web apps |
| **p90** | 90% of users experience this or better | Good user experience target | > 500ms for web apps |
| **p95** | 95% of users experience this or better | Acceptable user experience | > 1s for web apps |
| **p99** | 99% of users experience this or better | Worst-case user experience | > 2s for web apps |

### Comprehensive Decision Matrix

| Scenario | Symptoms | Root Cause | Priority | Actions |
|----------|----------|------------|----------|---------|
| **Excellent Performance** | All metrics green, low percentiles | System performing optimally | Low | Continue monitoring, document baseline |
| **Backend Bottleneck** | High waiting time, low connecting time | Server processing issues | High | Database tuning, caching, code optimization |
| **Network Issues** | High connecting/sending/receiving | Network or connectivity problems | Medium | Network optimization, CDN, compression |
| **Resource Exhaustion** | High blocked time, increasing over time | Connection or resource limits | High | Scale infrastructure, optimize connection pooling |
| **Intermittent Issues** | High p99 vs p95 spread | Inconsistent performance | Medium | Investigate outliers, check resource spikes |
| **SSL/TLS Overhead** | High TLS handshaking time | Certificate or SSL config issues | Low | Optimize TLS settings, session resumption |

---

## Quick Reference Guide

### Critical Metrics to Monitor
1. **http_req_duration (p95)** - User experience indicator
2. **http_req_failed** - System reliability
3. **http_req_waiting** - Backend performance
4. **Request Rate** - Throughput achievement

### Performance Benchmarks (Web Applications)
- **Excellent**: p95 < 200ms, 0% errors
- **Good**: p95 < 500ms, < 0.1% errors
- **Acceptable**: p95 < 1s, < 1% errors
- **Poor**: p95 > 1s, > 1% errors

### Troubleshooting Priority
1. **High Error Rate** (> 1%) - Immediate attention
2. **High Response Times** (p95 > 2s) - Performance optimization
3. **Connection Issues** (high blocked/connecting) - Infrastructure scaling
4. **Bandwidth Issues** (high sending/receiving) - Network optimization

This comprehensive guide enables data-driven performance analysis and optimization decisions based on k6 dashboard metrics.
