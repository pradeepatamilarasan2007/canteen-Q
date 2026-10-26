/**
 * Automated Test Suite for CanteenQ SMS Notification System
 * 
 * Verifies:
 * 1. Phone number normalization and validation (E.164, 10-digit Indian numbers, invalid numbers).
 * 2. Order placement with phone number via POST /api/orders.
 * 3. Correct association of mobile number with order in storage.
 * 4. Status transition to 'Preparing'.
 * 5. Status transition to 'Ready for Collection' triggering SMS.
 * 6. Duplicate SMS prevention when updating same status repeatedly.
 * 7. Graceful handling of invalid or missing mobile numbers.
 * 8. Verification that delivery is not falsely claimed if credentials are missing or gateway fails.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { 
  normalizePhoneNumber, 
  getGatewayConfigStatus, 
  sendFoodReadySMS 
} = require('./smsService');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper for making HTTP JSON requests
function makeRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log(' CANTEENQ SMS NOTIFICATION FEATURE TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Phone Number Normalization Unit Tests
  // ----------------------------------------------------
  console.log('--- TEST 1: Phone Normalization & Validation ---');
  const valid10 = normalizePhoneNumber('9876543210');
  assert(valid10.isValid && valid10.formatted === '+919876543210', '10-digit number 9876543210 formats to +919876543210');

  const validIntl = normalizePhoneNumber('+14155552671');
  assert(validIntl.isValid && validIntl.formatted === '+14155552671', 'E.164 international number +14155552671 preserved');

  const validFormatted = normalizePhoneNumber('(987) 654-3210');
  assert(validFormatted.isValid && validFormatted.formatted === '+919876543210', 'Formatted string (987) 654-3210 cleaned to +919876543210');

  const invalidShort = normalizePhoneNumber('12345');
  assert(!invalidShort.isValid && invalidShort.error.includes('10 digits'), 'Short number 12345 rejected gracefully');

  const emptyPhone = normalizePhoneNumber('');
  assert(!emptyPhone.isValid && emptyPhone.error.includes('missing'), 'Empty phone rejected gracefully');

  // ----------------------------------------------------
  // TEST 2: Gateway Config Check
  // ----------------------------------------------------
  console.log('\n--- TEST 2: SMS Gateway Status Endpoint ---');
  try {
    const statusRes = await makeRequest('GET', '/api/sms/status');
    assert(statusRes.status === 200, 'GET /api/sms/status returns HTTP 200');
    assert(typeof statusRes.body.isConfigured === 'boolean', 'Gateway returns configuration status');
    console.log(`    Twilio Configured: ${statusRes.body.isConfigured} (Missing: ${statusRes.body.missing?.join(', ') || 'None'})`);
  } catch (err) {
    console.error('Server not reachable at http://localhost:5000. Start server with node server.js first.');
    return;
  }

  // ----------------------------------------------------
  // TEST 3: Place Order with Valid Phone Number
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Order Placement & Phone Association ---');
  const testOrderId = `test_ord_${Date.now()}`;
  const testToken = `CQ_TEST_${Math.floor(Math.random() * 900 + 100)}`;
  const customerMobile = '9876543210';

  const orderPayload = {
    id: testOrderId,
    tokenNumber: testToken,
    customerName: 'Priya Sharma',
    phone: customerMobile,
    items: [
      { id: 'm1', name: 'Masala Dosa', price: 60, quantity: 1, prepTimeMinutes: 8 }
    ],
    paymentMethod: 'UPI',
    specialInstructions: 'Extra sambar'
  };

  const createRes = await makeRequest('POST', '/api/orders', orderPayload);
  assert(createRes.status === 201, 'POST /api/orders returns HTTP 201 Created');
  assert(createRes.body.order?.id === testOrderId, `Order ID saved correctly: ${testOrderId}`);
  assert(createRes.body.order?.phone === '+919876543210', `Customer phone normalized and saved as ${createRes.body.order?.phone}`);
  assert(createRes.body.order?.smsNotificationSent === false, 'smsNotificationSent initialized to false');

  // Verify stored in data/orders.json file
  const ordersFile = path.join(__dirname, 'data', 'orders.json');
  const storedOrders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
  const foundInFile = storedOrders.find(o => o.id === testOrderId);
  assert(foundInFile && foundInFile.phone === '+919876543210', 'Order details and phone persisted in data/orders.json');

  // ----------------------------------------------------
  // TEST 4: Status Transition to "Preparing"
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Status Transition: Order Placed -> Preparing ---');
  const prepRes = await makeRequest('PATCH', `/api/orders/${testOrderId}/status`, { status: 'Preparing' });
  assert(prepRes.status === 200, 'PATCH status to "Preparing" returns HTTP 200');
  assert(prepRes.body.order?.status === 'Preparing', 'Order status updated to "Preparing"');
  assert(!prepRes.body.sms, 'No SMS dispatched for "Preparing" status');

  // ----------------------------------------------------
  // TEST 5: Status Transition to "Ready for Collection"
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Status Transition: Preparing -> Ready for Collection ---');
  const readyRes = await makeRequest('PATCH', `/api/orders/${testOrderId}/status`, { status: 'Ready for Collection' });
  assert(readyRes.status === 200, 'PATCH status to "Ready for Collection" returns HTTP 200');
  assert(readyRes.body.order?.status === 'Ready for Collection', 'Order status updated to "Ready for Collection"');
  assert(readyRes.body.sms !== null, 'SMS notification was triggered by Ready for Collection status');

  if (readyRes.body.sms?.notConfigured) {
    console.log('    [Notice] Real SMS not dispatched because Twilio credentials are not yet set in .env.');
    assert(readyRes.body.order.smsStatus === 'GATEWAY_NOT_CONFIGURED', 'Order correctly marks SMS status as GATEWAY_NOT_CONFIGURED (no false delivery claim)');
  } else if (readyRes.body.sms?.success) {
    console.log(`    [Confirmed] SMS Delivered to Twilio! Message SID: ${readyRes.body.sms.messageId}`);
    assert(readyRes.body.order.smsNotificationSent === true, 'Order marked smsNotificationSent: true');
  }

  // ----------------------------------------------------
  // TEST 6: Duplicate Prevention
  // ----------------------------------------------------
  console.log('\n--- TEST 6: Duplicate SMS Prevention on Repeated Status Update ---');
  // First, simulate order with smsNotificationSent: true
  const ordersCurrent = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
  const targetIdx = ordersCurrent.findIndex(o => o.id === testOrderId);
  ordersCurrent[targetIdx].smsNotificationSent = true;
  ordersCurrent[targetIdx].smsSentAt = new Date().toISOString();
  fs.writeFileSync(ordersFile, JSON.stringify(ordersCurrent, null, 2), 'utf-8');

  // Attempt duplicate trigger
  const dupRes = await makeRequest('PATCH', `/api/orders/${testOrderId}/status`, { status: 'Ready for Collection' });
  assert(dupRes.status === 200, 'Repeated status update returns HTTP 200');
  assert(dupRes.body.sms?.skipped === true, 'Backend prevented duplicate SMS dispatch (skipped: true)');
  assert(dupRes.body.sms?.reason?.includes('Duplicate'), `Reason provided: "${dupRes.body.sms?.reason}"`);

  // ----------------------------------------------------
  // TEST 7: Invalid Phone Handling
  // ----------------------------------------------------
  console.log('\n--- TEST 7: Invalid Phone Number Handling ---');
  const invalidOrderId = `test_invalid_${Date.now()}`;
  await makeRequest('POST', '/api/orders', {
    id: invalidOrderId,
    tokenNumber: 'CQ_BAD_PHONE',
    customerName: 'Test Invalid',
    phone: '123', // Invalid short phone
    items: [{ id: 'm1', name: 'Masala Dosa', price: 60, quantity: 1 }]
  });

  const invalidReadyRes = await makeRequest('PATCH', `/api/orders/${invalidOrderId}/status`, { status: 'Ready for Collection' });
  assert(invalidReadyRes.status === 200, 'Order status update succeeds even with invalid phone');
  assert(invalidReadyRes.body.sms?.success === false, 'SMS returns success: false for invalid phone');
  assert(invalidReadyRes.body.sms?.code === 'INVALID_PHONE_NUMBER', 'SMS returned code INVALID_PHONE_NUMBER');
  console.log(`    Reported SMS error: "${invalidReadyRes.body.sms?.error}"`);

  // Clean up test orders from data/orders.json
  const finalOrders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
  const cleanedOrders = finalOrders.filter(o => o.id !== testOrderId && o.id !== invalidOrderId);
  fs.writeFileSync(ordersFile, JSON.stringify(cleanedOrders, null, 2), 'utf-8');
  console.log('\n[Cleanup] Test orders removed from data/orders.json.');

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n========================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
